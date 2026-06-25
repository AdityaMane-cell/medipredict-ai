# MediPredict: Production-Grade Health AI System
Comprehensive AI-powered health diagnosis tool with enterprise-grade security, observability, and model governance.

### ✨ Key Features

**🤖 Advanced Prediction Engine**
- XGBoost ensemble multi-label disease predictor
- Fuzzy-matched symptom extraction via scispacy/rapidfuzz
- Confidence scoring with low-confidence warnings
- SHAP explainability layer for top predictions
- Real-time symptom validation

**🔐 Security & Trust**
- JWT + 2FA QR-code TOTP authentication
- Account lockout + brute-force throttling (5 attempts, 15-min lockout)
- Password hashing with bcrypt
- Request body-size limits (100KB default)
- Rate limiting (30 req/min, 1000/hour per IP)
- Password reset with secure tokens
- SAN mapping + NLP sanitization for injection prevention

**📊 User Experience**
- Guest prediction + authenticated persistent history
- Profile dashboard with session statistics  
- Sidebar with prediction history and 2FA management
- Session-aware form state persistence
- Responsive React + Vite frontend
- Rich prediction display with confidence meter

**🧪 Quality & Deployment**
- Pytest test suite with edge-case coverage
- Docker & Docker Compose for fast local setup
- GitHub Actions CI/CD pipeline
- Alembic database migrations  
- Structured JSON logging + Prometheus metrics
- Health check endpoints

### 🚀 Quick Start

**Local Development**

```bash
# 1. Clone and install deps
git clone ...
cd health-ai-project
pip install -r requirements.txt

# 2. Start PostgreSQL + API
docker-compose up -d

# 3. Run API
uvicorn api.app:app --reload

# 4. In another terminal, start frontend
cd web && npm run dev
```

Visit `http://localhost:5173` → choose Guest or Sign Up.

**Production Deployment**

```bash
# With Docker
docker build -t health-ai .
docker run -e DATABASE_URL=postgres://... -p 8000:8000 health-ai

# Or with docker-compose
docker-compose -f docker-compose.yml up -d
```

### 📋 Configuration

Copy `.env.example` to `.env`:
```
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-very-strong-secret
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=15
```

### 🔧 API Endpoints

**Auth**
- `POST /register` – Create account
- `POST /token` – Login (supports 2FA via `x-totp-code` header)
- `GET /me` – Current user profile
- `POST /password-reset-request` – Password reset token
- `POST /password-reset` – Complete reset
- `POST /2fa/setup` – Begin 2FA onboarding
- `POST /2fa/enable` – Activate 2FA with TOTP code
- `POST /2fa/disable` – Disable 2FA

**Prediction**
- `GET /symptoms` – List available symptoms
- `POST /predict` – Diagnose from symptom list
- `POST /predict-text` – Extract symptoms & diagnose from text
- `GET /history` – Authenticated user's prediction history

**Ops**
- `GET /health` – Readiness check
- `GET /metrics` – Prometheus metrics stub

### ✅ Quality Metrics

- **Security**: JWT, 2FA, rate limits, account lockout, input validation
- **Reliability**: Async error handling, graceful degradation, DB migrations
- **Observability**: Structured logging, trace IDs, metrics exporter
- **Testing**: Pytest suite; edge cases for NLP, predictor validation
- **Scalability**: Stateless API, connection pooling, caching ready
- **Ops**: Docker, CI/CD, health checks, config from environment

### 📚 Architecture

```
api/
  ├── app.py           # FastAPI + routes, auth, prediction endpoints
  ├── auth.py          # JWT, 2FA (pyotp), password utils
  ├── db.py            # SQLAlchemy + PostgreSQL
  ├── models.py        # User, PredictionHistory ORM
  ├── schemas.py       # Pydantic request/response DTOs  
  └── services/
      ├── predictor.py # XGBoost model, inference, SHAP explain
      └── nlp_parser.py # Fuzzy-match, tokenize, normalize symptoms

ml/
  ├── src/
  │   ├── train.py     # Model training pipeline  
  │   └── preprocess.py # Data prep + feature engineering
  ├── models/          # Serialized XGBoost, encoders, weights
  └── Data/*           # Training datasets (CSV)

web/
  ├── src/
  │   ├── App.jsx      # React router: home / auth / app
  │   ├── App.css      # Responsive design, dark-mode ready
  │   └── main.jsx     # Vite entry
  └── index.html       # HTML template

tests/
  ├── test_predictor.py   # Edge cases: no symptoms, invalid types
  └── test_nlp_parser.py  # Text extraction correctness
```

### 🔄 CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`):
- Lint (flake8)
- Type-check (mypy)
- Test (pytest ≥90% coverage target)
- Build Docker image
- (Future) Deploy to staging/prod

### 🎯 Next-Tier Enhancements

Priority roadmap to unlock top 0.1%:

1. **Model Ops**
   - MLflow experiment tracking + model registry
   - Automated weekly retraining via scheduler
   - Drift detection + A/B canary rollout
   - Feature store for semantic comorbidities

2. **Observability**
   - Sentry error tracking
   - Prometheus + Grafana dashboards
   - OpenTelemetry distributed tracing
   - ELK stack for log aggregation

3. **Enterprise Auth**
   - OAuth2/OIDC (Google, Azure AD)
   - SAML2 SSO
   - Audit logs (who accessed what, when)
   - Role-based access control (RBAC)

4. **Compliance & Privacy**
   - HIPAA / GDPR audit trail
   - Data encryption at rest + in transit
   - PII redaction in logs
   - Terms / Privacy UI

5. **Frontend**
   - Dark mode toggle
   - Multi-language support (i18n)
   - Offline mode (service worker + IndexedDB)
   - Accessibility (WCAG 2.1 AA)

6. **Scale**
   - Redis caching + session store
   - Kubernetes (Helm charts)
   - CDN for static assets
   - Horizontal pod autoscaling

### 📖 Database Schema

**users** – Credentials, 2FA secrets, login lockout  
**prediction_history** – Query + result + confidence, per user

See `api/models.py` for ORM definitions.

### 🛡️ Security Checklist

- [x] Passwords hashed (bcrypt)
- [x] JWT expiration (1 day default)
- [x] 2FA TOTP optional
- [x] Account lockout after 5 failures
- [x] Password reset tokens (30-min expiry)
- [x] Rate limiting per IP
- [x] Request body size limit
- [x] CORS configured (restrict in prod!)
- [x] Input sanitization (symptoms)
- [ ] HTTPS + HSTS (in reverse proxy)
- [ ] CSP headers (in proxy)
- [ ] SQL injection defense (ORM + parameterized)
- [ ] XSS defense (React templating)

### 🧑‍💻 Contributing

```bash
# Create branch
git checkout -b feature/my-feature

# Make changes + test
pytest -xvs

# Commit with clear message
git commit -m "feat: add comorbidity detection"

# Open PR → CI passes → merge
```

### 📄 License

MIT (or your chosen license)

### 🙋 Support & Docs

- API Docs: `http://localhost:8000/docs` (Swagger)
- ML Model Training: See `ml/Documentation/backend_integration_and_deploy.md`
- Env Vars: Copy `.env.example` → `.env`

---

## 💡 Next Iteration (Roadmap)

1. **Advanced Auth** – OAuth2, SAML, enterprise SSO
2. **Observability** – Sentry, Prometheus, Grafana
3. **ML Ops** – MLflow, weekly retraining, drift detection
4. **Enterprise** – RBAC, audit logs, HIPAA compliance
5. **Scale** – Redis, Kubernetes, CDN
6. **Community** – API SDK generation, CLI tool

---

**Status**: Production-ready MVP with enterprise security & observability ✅
