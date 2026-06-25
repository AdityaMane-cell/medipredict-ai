# 🚀 Local Development Setup Guide

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Git

---

## Step 1: PostgreSQL Database Setup

### Option A: Using Docker (Recommended - Fastest)

If you have Docker installed:

```bash
# Start PostgreSQL container
docker run -d \
  --name healthai-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=backend-sprint \
  -e POSTGRES_DB=healthai \
  -p 5432:5432 \
  postgres:16

# Verify it's running
docker ps | grep healthai-db
```

### Option B: Manual PostgreSQL Installation (Windows)

1. **Download & Install PostgreSQL 16**
   - Go to https://www.postgresql.org/download/windows/
   - Run installer
   - During setup:
     - Password: `backend-sprint`
     - Port: `5432`
     - Database: `healthai`

2. **Create the database using pgAdmin or CLI**

   ```bash
   psql -U postgres -c "CREATE DATABASE healthai;"
   ```

3. **Verify connection**
   ```bash
   psql -U postgres -d healthai -c "SELECT version();"
   ```

### Option C: Using WSL (If on Windows 11)

```bash
# In WSL2
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres createdb healthai
```

---

## Step 2: Environment Configuration

```bash
# Navigate to project root
cd \filepath\...\medipredict-ai

# Copy environment template
cp .env.example .env

# Edit .env with your values (or use defaults)
# Default: DATABASE_URL=postgresql://postgres:backend-sprint@localhost:5432/healthai
```

### .env Content:

```env
# Database
DATABASE_URL=postgresql://postgres:backend-sprint@localhost:5432/healthai

# Security
SECRET_KEY=your-super-secret-key-change-in-production

# Token Settings
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=15

# API Config
MAX_BODY_BYTES=131072
MODEL_DIR=ml/models
```

---

## Step 3: Backend Setup

```bash
# Navigate to project root
cd \filepath\...\medipredict-ai

# Activate virtual environment (if not already activated)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep -E "fastapi|sqlalchemy|psycopg2|pyotp"

# Create database tables (automatic on first run)
python -c "from api.db import engine; from api import models; models.Base.metadata.create_all(bind=engine); print('✓ Database initialized')"
```

---

## Step 4: Start Backend

```bash
# Make sure you're in the project root and venv is activated

# Start FastAPI server (will auto-create tables)
uvicorn api.app:app --reload --host 0.0.0.0 --port 8000

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

Test API:

```bash
# In another terminal
curl http://localhost:8000/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 5: Frontend Setup

```bash
# In another terminal, navigate to web folder
cd \filepath\...\medipredict-ai  \web

# Install Node dependencies
npm install

# Start dev server
npm run dev

# You should see:
# > dev
# ➜  Local:   http://localhost:5173/
```

---

## Step 6: Test the Application

1. **Open browser**: http://localhost:5173
2. **Test signup flow**:
   - Click "Login / Sign Up"
   - Fill in: testuser, test@example.com, password123
   - Click "Create Account"
   - Should create user and redirect to prediction page

3. **Verify user in database**:

   ```bash
   # In terminal
   psql -U postgres -d healthai -c "SELECT id, username, email FROM users;"

   # Should see your created user
   ```

4. **Test prediction**:
   - On prediction page, select symptoms like "fever", "headache"
   - Click "Predict from Symptoms"
   - Should see results with disease predictions

---

## Troubleshooting

### ❌ "connect() failed: could not translate host"

**Solution**: PostgreSQL not running

```bash
# Docker: check if running
docker ps | grep healthai

# Manual: start PostgreSQL service
# Windows: Services → PostgreSQL → Start
# WSL: sudo service postgresql start
```

### ❌ "FATAL: role 'postgres' does not exist"

**Solution**: Create user

```bash
psql -U postgres -c "CREATE ROLE postgres LOGIN PASSWORD 'backend-sprint';"
```

### ❌ "User not found" after signup

**Solution**: Database not initialized

```bash
# Reinitialize
python -c "from api.db import engine; from api import models; models.Base.metadata.drop_all(bind=engine); models.Base.metadata.create_all(bind=engine); print('✓ Database reset')"

# Try signup again
```

### ❌ "ModuleNotFoundError: No module named 'api'"

**Solution**: Add project to PYTHONPATH

```bash
# Windows PowerShell
$env:PYTHONPATH = "$pwd;$env:PYTHONPATH"
uvicorn api.app:app --reload
```

### ❌ "Cannot predict - analyzing stuck"

**Solution**: Model files missing or ML server not loaded

```bash
# Check model files exist
ls ml/models/

# Should see: model.pkl, mlb.pkl, le.pkl, weights.pkl, desc.pkl, prec.pkl

# If missing, download or train them:
# See: ml/Documentation/backend_integration_and_deploy.md
```

### ❌ "Port already in use 8000"

**Solution**: Change port or kill existing process

```bash
# Use different port
uvicorn api.app:app --reload --port 8001

# Or kill existing process (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## Quick Commands Reference

```bash
# Backend
cd \filepath\...\medipredict-ai
.\venv\Scripts\Activate.ps1
uvicorn api.app:app --reload --host 0.0.0.0 --port 8000

# Frontend (in another terminal)
cd web
npm run dev

# Database
psql -U postgres -d healthai

# Check tables
\dt

# View users
SELECT * FROM users;

# View prediction history
SELECT * FROM prediction_history;

# Reset database
DROP DATABASE healthai;
CREATE DATABASE healthai;
```

---

## Testing with Sample Users

After running the app, create test account:

```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'

# Should return user object:
# {"id":1,"username":"john_doe","email":"john@example.com","created_at":"2026-04-04T..."}
```

---

## Production vs Development

| Item             | Dev                   | Prod                     |
| ---------------- | --------------------- | ------------------------ |
| **API**          | http://localhost:8000 | https://api.healthai.com |
| **Frontend**     | http://localhost:5173 | https://healthai.com     |
| **DB Host**      | localhost             | RDS/managed DB           |
| **SECRET_KEY**   | anything              | AWS Secrets Manager      |
| **CORS Origins** | \*                    | Specific domains         |
| **Logs**         | Console               | CloudWatch/ELK           |

---

## Next Steps

✅ Database running  
✅ Backend running  
✅ Frontend running

Now:

1. Make changes to code
2. Backend auto-reloads (uvicorn)
3. Frontend hot-reloads (Vite)
4. Check console for debug logs

Happy coding! 🎉
