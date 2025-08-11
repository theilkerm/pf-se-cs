#!/bin/bash

# Development Startup Script
echo "🚀 Starting development environment..."

# Check if .env files exist, if not create them from examples
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env from example..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your actual configuration"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local from example..."
    cp frontend/env.example frontend/.env.local
    echo "⚠️  Please edit frontend/.env.local with your actual configuration"
fi

# Start development environment
echo "🐳 Starting Docker development environment..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Development environment started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️  MongoDB: localhost:27017"
