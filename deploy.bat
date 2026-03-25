@echo off
echo 🚀 Starting Resume Cleaner deployment...

echo 📦 Building Docker images...
docker-compose build

echo 🛑 Stopping existing containers...
docker-compose down

echo 🧹 Cleaning up old data...
docker system prune -f

echo 🚀 Starting containers...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak > nul

echo 🏥 Checking health...
curl -f http://localhost:8000/health || echo ⚠️ Backend health check failed

echo ✅ Deployment complete!
echo.
echo 📱 Application URLs:
echo    Frontend: http://localhost
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 🔑 Default credentials:
echo    Username: user
echo    Password: 888888

pause
