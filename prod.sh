#!/bin/bash

# Production Startup Script
echo "🚀 Starting production environment..."

# Check if production environment file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating production .env from example..."
    cp docker-compose.prod.env .env
    echo "⚠️  Please edit .env with your production server configuration"
    echo "   - Update NEXT_PUBLIC_API_URL to your production server"
    echo "   - Update FRONTEND_URL to your production domain"
    echo "   - Update CORS_ORIGIN to your production domain"
    exit 1
fi

# Load environment variables
source .env

# Start production environment
echo "🐳 Starting Docker production environment..."
docker-compose -f docker-compose.prod.yml up --build -d

echo "✅ Production environment started!"
echo "🌐 Frontend: http://your-production-domain.com:3000"
echo "🔧 Backend API: http://your-production-domain.com:3001"
echo "🗄️  MongoDB: Running in container"
