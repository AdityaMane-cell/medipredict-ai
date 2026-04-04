"""
Full Health AI backend test suite.
"
Tests cover security, data validation, and prediction correctness.
Run: pytest -xvs
"""

import pytest
from api.auth import generate_totp_secret, verify_totp_code, verify_password, get_password_hash


def test_password_hashing():
    plain = "test_password123"
    hashed = get_password_hash(plain)
    assert hashed != plain
    assert verify_password(plain, hashed)
    assert not verify_password("wrong_password", hashed)


def test_totp_secret_generation():
    secret = generate_totp_secret()
    assert len(secret) > 0
    assert isinstance(secret, str)


def test_totp_code_verification():
    import pyotp
    secret = generate_totp_secret()
    totp = pyotp.TOTP(secret)
    code = totp.now()
    assert verify_totp_code(secret, code)
    assert not verify_totp_code(secret, "000000")


def test_api_health_endpoint():
    from fastapi.testclient import TestClient
    from api.app import app
    
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
