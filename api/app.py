from fastapi import FastAPI, Depends, HTTPException, status, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import logging
import os
import pyotp
from datetime import datetime, timedelta

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from api.db import SessionLocal, engine
from api import models
from api.schemas import (
    UserCreate,
    UserLogin,
    UserRead,
    Token,
    SymptomRequest,
    TextRequest,
    PredictionHistoryCreate,
    PredictionHistoryRead,
)
from api.auth import verify_password, get_password_hash, create_access_token, decode_access_token, generate_totp_secret, verify_totp_code
from api.services.predictor import predict_disease, available_symptoms
from api.services.nlp_parser import text_to_symptoms

# password reset imports
import uuid
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=engine)

# logging + observability
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger('health-ai-api')

limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute", "1000/hour"])

app = FastAPI(title='Health AI - Symptom Prediction API')
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

# in-memory token map for password reset demo; replace with DB in production
PASSWORD_RESET_TOKENS = {}

# helper to expire tokens after 30 minutes
PASSWORD_RESET_TTL = timedelta(minutes=30)

class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_body_size: int = 1024 * 100):
        super().__init__(app)
        self.max_body_size = max_body_size

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get('content-length')
        if content_length and int(content_length) > self.max_body_size:
            return JSONResponse({'detail': 'Request body too large'}, status_code=413)
        return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # in prod restrict to explicit host(s)
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.add_middleware(BodySizeLimitMiddleware, max_body_size=int(os.getenv('MAX_BODY_BYTES', '131072')))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    username = decode_access_token(token)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid authentication credentials')
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user


def get_optional_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        return None
    if not authorization.startswith('Bearer '):
        return None
    token = authorization.split(' ', 1)[1]
    username = decode_access_token(token)
    if not username:
        return None
    user = db.query(models.User).filter(models.User.username == username).first()
    return user


def check_and_increment_lockout(user: models.User, db: Session):
    if user.account_locked_until and user.account_locked_until > datetime.utcnow():
        raise HTTPException(status_code=423, detail='Account locked. Try again later.')

    user.failed_login_attempts += 1
    if user.failed_login_attempts >= int(os.getenv('MAX_LOGIN_ATTEMPTS', '5')):
        user.account_locked_until = datetime.utcnow() + timedelta(minutes=int(os.getenv('LOCKOUT_MINUTES', '15')))
        db.commit()
        raise HTTPException(status_code=423, detail='Account temporarily locked due to too many failed attempts.')

    db.commit()


def reset_login_attempts(user: models.User, db: Session):
    user.failed_login_attempts = 0
    user.account_locked_until = None
    db.commit()


@app.post('/register', response_model=UserRead)
def register(user_create: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        (models.User.username == user_create.username) | (models.User.email == user_create.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail='Username or email already registered')

    user = models.User(
        username=user_create.username,
        email=user_create.email,
        hashed_password=get_password_hash(user_create.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post('/password-reset-request')
def password_reset_request(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail='Email not registered')

    token = str(uuid.uuid4())
    PASSWORD_RESET_TOKENS[token] = {
        'user_id': user.id,
        'expires_at': datetime.utcnow() + PASSWORD_RESET_TTL,
    }

    return {'message': 'Password reset token generated', 'token': token}


@app.post('/password-reset')
def password_reset(token: str, new_password: str, db: Session = Depends(get_db)):
    if token not in PASSWORD_RESET_TOKENS:
        raise HTTPException(status_code=400, detail='Invalid token')

    data = PASSWORD_RESET_TOKENS[token]
    if data['expires_at'] < datetime.utcnow():
        del PASSWORD_RESET_TOKENS[token]
        raise HTTPException(status_code=400, detail='Token expired')

    user = db.query(models.User).filter(models.User.id == data['user_id']).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    user.hashed_password = get_password_hash(new_password)
    db.commit()
    del PASSWORD_RESET_TOKENS[token]

    return {'message': 'Password successfully reset'}


@app.post('/token', response_model=Token)
@limiter.limit("10/minute")
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect username or password')

    if user.account_locked_until and user.account_locked_until > datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_423_LOCKED, detail='Account locked. Try again later.')

    if not verify_password(form_data.password, user.hashed_password):
        check_and_increment_lockout(user, db)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect username or password')

    # 2FA check if enabled
    if user.totp_enabled == 'true':
        otp_code = request.headers.get('x-totp-code')
        if not otp_code or not verify_totp_code(user.totp_secret, otp_code):
            check_and_increment_lockout(user, db)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid 2FA code')

    reset_login_attempts(user, db)

    access_token = create_access_token({'sub': user.username})
    return {'access_token': access_token, 'token_type': 'bearer'}


@app.get('/me', response_model=UserRead)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.post('/2fa/setup')
def setup_totp(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = generate_totp_secret()
    current_user.totp_secret = secret
    current_user.totp_enabled = 'false'
    db.commit()
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=current_user.email, issuer_name='HealthAI')
    return {'totp_secret': secret, 'otp_uri': otp_uri}


@app.post('/2fa/enable')
def enable_totp(code: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail='TOTP setup not completed')
    if verify_totp_code(current_user.totp_secret, code):
        current_user.totp_enabled = 'true'
        db.commit()
        return {'message': '2FA enabled'}
    raise HTTPException(status_code=400, detail='Invalid 2FA code')


@app.post('/2fa/disable')
def disable_totp(code: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.totp_enabled != 'true':
        return {'message': '2FA already disabled'}
    if verify_totp_code(current_user.totp_secret, code):
        current_user.totp_enabled = 'false'
        current_user.totp_secret = None
        db.commit()
        return {'message': '2FA disabled'}
    raise HTTPException(status_code=400, detail='Invalid 2FA code')


@app.get('/health')
def health_check():
    return {'status': 'ok', 'timestamp': datetime.utcnow().isoformat() + 'Z'}


@app.get('/metrics')
def prometheus_metrics():
    # Placeholder for real metrics (structured stats + Prometheus exporter)
    return {
        'uptime_seconds': 0,
        'requests_total': 0,
        'active_users': 0,
    }


@app.get('/symptoms')
def list_symptoms():
    try:
        return {'symptoms': available_symptoms()}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post('/predict')
def predict(req: SymptomRequest, current_user: Optional[models.User] = Depends(get_optional_user), db: Session = Depends(get_db)):
    if not req.symptoms:
        raise HTTPException(status_code=422, detail='symptoms list cannot be empty')

    result = predict_disease(req.symptoms)
    if 'error' in result:
        raise HTTPException(status_code=400, detail=result['error'])

    if current_user:
        record = models.PredictionHistory(
            user_id=current_user.id,
            method='symptoms',
            query=json.dumps(req.symptoms),
            result=json.dumps(result),
            confidence=str(result.get('confidence', '')),
        )
        db.add(record)
        db.commit()

    return result


@app.post('/predict-text')
def predict_text(req: TextRequest, current_user: Optional[models.User] = Depends(get_optional_user), db: Session = Depends(get_db)):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=422, detail='text cannot be empty')

    symptoms = text_to_symptoms(req.text)
    result = predict_disease(symptoms)
    if 'error' in result:
        raise HTTPException(status_code=400, detail=result['error'])

    if current_user:
        record = models.PredictionHistory(
            user_id=current_user.id,
            method='text',
            query=json.dumps(req.text),
            result=json.dumps(result),
            confidence=str(result.get('confidence', '')),
        )
        db.add(record)
        db.commit()

    return {'extracted_symptoms': symptoms, 'prediction': result}



@app.get('/history', response_model=List[PredictionHistoryRead])
def get_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = (
        db.query(models.PredictionHistory)
        .filter(models.PredictionHistory.user_id == current_user.id)
        .order_by(models.PredictionHistory.created_at.desc())
        .limit(50)
        .all()
    )
    return entries
