# ELEPHANT local backend setup (Windows PowerShell)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== ELEPHANT backend setup ===" -ForegroundColor Cyan

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

Write-Host "Installing dependencies..."
.\.venv\Scripts\pip install -r requirements.txt -q

if (-not (Test-Path ".\.env")) {
    Copy-Item .env.example .env
    Write-Host "Created .env from .env.example"
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    Write-Host "Starting PostgreSQL + Redis via Docker..."
    docker compose up -d
    Start-Sleep -Seconds 5
} else {
    Write-Host "Docker not found — ensure PostgreSQL is running and credentials match backend/.env" -ForegroundColor Yellow
}

$env:PYTHONPATH = "."
Write-Host "Checking database..."
.\.venv\Scripts\python.exe scripts\check_db.py
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running migrations..."
.\.venv\Scripts\python.exe -m alembic upgrade head

Write-Host "Seeding demo data..."
.\.venv\Scripts\python.exe scripts\seed_demo.py

Write-Host ""
Write-Host "Setup complete. Start API with:" -ForegroundColor Green
Write-Host '  $env:PYTHONPATH="."; .\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000'
