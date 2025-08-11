@echo off
REM Development Startup Script for Windows
echo 🚀 Starting development environment...

REM Check if .env files exist, if not create them from examples
if not exist "backend\.env" (
    echo 📝 Creating backend .env from example...
    copy "backend\env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your actual configuration
)

if not exist "frontend\.env.local" (
    echo 📝 Creating frontend .env.local from example...
    copy "frontend\env.example" "frontend\.env.local"
    echo ⚠️  Please edit frontend\.env.local with your actual configuration
)

REM Start development environment
echo 🐳 Starting Docker development environment...
docker-compose -f docker-compose.dev.yml up --build

echo ✅ Development environment started!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo 🗄️  MongoDB: localhost:27017

pause
