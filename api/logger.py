import json
import logging
from datetime import datetime
from typing import Any

# Structured logging formatter for JSON export

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s %(name)s %(levelname)s %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)

    def log_prediction(self, user_id: int, method: str, confidence: float, result: str):
        self.logger.info(json.dumps({
            'event': 'prediction',
            'user_id': user_id,
            'method': method,
            'confidence': confidence,
            'result': result,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }))

    def log_auth_event(self, username: str, event: str, success: bool):
        self.logger.info(json.dumps({
            'event': 'auth',
            'username': username,
            'action': event,
            'success': success,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }))

    def log_error(self, error_code: str, message: str, context: dict[str, Any] | None = None):
        self.logger.error(json.dumps({
            'event': 'error',
            'code': error_code,
            'message': message,
            'context': context or {},
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }))
