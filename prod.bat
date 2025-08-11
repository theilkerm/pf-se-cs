@echo off
REM Production Startup Script for Windows
echo 🚀 Starting production environment...

REM Check if production environment file exists
if not exist ".env" (
    echo 📝 Creating production .env from example...
    copy "docker-compose.prod.env" ".env"
    echo ⚠️  Please edit .env with your production server configuration
    echo    - Update NEXT_PUBLIC_API_URL to your production server
    echo    - Update FRONTEND_URL to your production domain
    echo    - Update CORS_ORIGIN to your production domain
    pause
    exit /b 1
)

REM Start production environment
echo 🐳 Starting Docker production environment...
docker-compose -f docker-compose.prod.yml up --build -d

echo ✅ Production environment started!
echo 🌐 Frontend: http://your-production-domain.com:3000
echo 🔧 Backend API: http://your-production-domain.com:3001
echo 🗄️  MongoDB: Running in container

pause
