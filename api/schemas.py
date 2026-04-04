from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class SymptomRequest(BaseModel):
    symptoms: List[str]


class TextRequest(BaseModel):
    text: str


class PredictionHistoryCreate(BaseModel):
    method: str
    query: Any
    result: Any
    confidence: Optional[float] = None


class PredictionHistoryRead(BaseModel):
    id: int
    method: str
    query: Any
    result: Any
    confidence: Optional[float]
    created_at: datetime

    class Config:
        orm_mode = True
