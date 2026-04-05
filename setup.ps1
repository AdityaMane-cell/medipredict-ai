#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automatic setup script for Health AI project on Windows
.DESCRIPTION
    Sets up database, backend, and frontend with minimal user input
.PARAMETER SkipDocker
    Skip Docker setup, assume manual PostgreSQL installation
#>

param(
    [switch]$SkipDocker = $false,
    [string]$DbPassword = "backend-sprint",
    [string]$DbHost = "localhost"
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Green -BackgroundColor DarkGray
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Check prerequisites
Write-Header "Checking Prerequisites"

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Success "Python found: $pythonVersion"
} catch {
    Write-Error-Custom "Python not found. Please install Python 3.12+"
    exit 1
}

# Check Node
try {
    $nodeVersion = node --version
    Write-Success "Node found: $nodeVersion"
} catch {
    Write-Error-Custom "Node not found. Please install Node 18+"
    exit 1
}

# Database Setup
Write-Header "Database Setup"

if (-not $SkipDocker) {
    try {
        $dockerVersion = docker --version
        Write-Success "Docker found: $dockerVersion"
        
        # Start PostgreSQL container
        Write-Host "Starting PostgreSQL container..." -ForegroundColor Cyan
        
        # Check if container already exists
        $containerExists = docker ps -a --filter "name=healthai-db" --format "{{.Names}}" 2>$null
        
        if ($containerExists) {
            Write-Warning "Container already exists, starting it..."
            docker start healthai-db 2>$null
        } else {
            Write-Host "Creating new PostgreSQL container..." -ForegroundColor Cyan
            docker run -d `
                --name healthai-db `
                -e POSTGRES_USER=postgres `
                -e POSTGRES_PASSWORD=$DbPassword `
                -e POSTGRES_DB=healthai `
                -p 5432:5432 `
                postgres:16
        }
        
        Write-Host "Waiting for PostgreSQL to start (10 seconds)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
        
        Write-Success "PostgreSQL started in Docker"
    } catch {
        Write-Warning "Docker setup failed. Assuming manual PostgreSQL installation..."
        Write-Warning "Make sure PostgreSQL is running on port 5432"
    }
} else {
    Write-Warning "Skipping Docker setup. Ensure PostgreSQL is running manually."
}

# Backend Setup
Write-Header "Backend Setup"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt --quiet

Write-Success "Python dependencies installed"

# Create .env file
Write-Host "Creating .env file..." -ForegroundColor Cyan
$envContent = @"
DATABASE_URL=postgresql://postgres:${DbPassword}@${DbHost}:5432/healthai
SECRET_KEY=dev-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=15
MAX_BODY_BYTES=131072
MODEL_DIR=ml/models
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Success ".env file created"

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Cyan
python -c "from api.db import engine; from api import models; models.Base.metadata.create_all(bind=engine); print('Database tables created')" 2>&1

Write-Success "Database initialized"

# Frontend Setup
Write-Header "Frontend Setup"

Set-Location web

Write-Host "Installing Node dependencies..." -ForegroundColor Cyan
npm install --silent --legacy-peer-deps

Write-Success "Node dependencies installed"

# Final Instructions
Write-Header "Setup Complete! ✓"

Write-Host "Your project is ready to run. Follow these steps:`n" -ForegroundColor Green

Write-Host "1. START BACKEND:" -ForegroundColor Cyan
Write-Host "   - Open a terminal in project root" -ForegroundColor White
Write-Host "   - Run: .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "   - Run: uvicorn api.app:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
Write-Host "   - You should see: 'Uvicorn running on http://0.0.0.0:8000'" -ForegroundColor Yellow

Write-Host "`n2. START FRONTEND:" -ForegroundColor Cyan
Write-Host "   - Open another terminal in project/web folder" -ForegroundColor White
Write-Host "   - Run: npm run dev" -ForegroundColor White
Write-Host "   - You should see: 'Local: http://localhost:5173'" -ForegroundColor Yellow

Write-Host "`n3. OPEN IN BROWSER:" -ForegroundColor Cyan
Write-Host "   - Visit: http://localhost:5173" -ForegroundColor White

Write-Host "`n4. TEST SIGNUP:" -ForegroundColor Cyan
Write-Host "   - Click 'Login / Sign Up'" -ForegroundColor White
Write-Host "   - Create test account (testuser/test@ex.com/password123)" -ForegroundColor White
Write-Host "   - Try prediction with 'fever' + 'headache'" -ForegroundColor White

Write-Host "`n📚 For more info, read: LOCAL_SETUP.md" -ForegroundColor Cyan
Write-Host "`n⚠️  If prediction shows 'analyzing...' stuck:" -ForegroundColor Yellow
Write-Host "    - Check browser console for errors (F12)" -ForegroundColor White
Write-Host "    - Check backend terminal for logs" -ForegroundColor White
Write-Host "    - Ensure ml/models/*.pkl files exist" -ForegroundColor White

Write-Host "`n✓ Happy coding! 🚀`n" -ForegroundColor Green
