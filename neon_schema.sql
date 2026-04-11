-- neon_schema.sql
-- Run these commands in Neon SQL editor to create the required database tables for the Health AI project.

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(128) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  hashed_password VARCHAR(256) NOT NULL,
  totp_secret VARCHAR(64),
  totp_enabled VARCHAR(8) DEFAULT 'false',
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prediction_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  method VARCHAR(32) NOT NULL,
  query TEXT NOT NULL,
  result TEXT NOT NULL,
  confidence VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
