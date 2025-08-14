# Deployment Guide

## 🚀 Deployment with Docker Compose

This project provides secure, production-ready deployment with Docker Compose and comprehensive security features.

## 🔒 Security Features

- **MongoDB Security**: No public internet exposure, authentication required
- **Network Isolation**: Database only accessible within Docker network
- **Automatic User Creation**: Database users created automatically on first startup
- **Environment-based Configuration**: Secure credentials managed via environment variables

## 📁 Environment Configuration

### 1. **Copy the appropriate environment file:**

```bash
# For local development
cp env.example .env

# For production (recommended)
cp env.production.example .env
```

### 2. **Edit the `.env` file** with your configuration:

```bash
# Local development (default)
BACKEND_HOST=localhost
BACKEND_PORT=3001
BACKEND_URL=http://localhost:3001

# Production example
BACKEND_HOST=your-domain-or-ip.com
BACKEND_PORT=3001
BACKEND_URL=https://your-domain-or-ip.com

# MongoDB Security (Production)
MONGO_USERNAME=admin
MONGO_PASSWORD=your-secure-password-here
MONGO_DATABASE=e-commerce-db
```

## 🐳 Deploy with Docker Compose

### **Local Development (with hot reload):**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### **Production (Secure):**
```bash
# First time setup
chmod +x prod.sh
./prod.sh

# Or manually
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔧 Environment-Specific Configurations

### **Development Environment**
- Uses `docker-compose.dev.yml`
- Hot reloading enabled
- MongoDB exposed on localhost:27017
- Frontend connects to backend via localhost

### **Production Environment**
- Uses `docker-compose.prod.yml`
- **Secure MongoDB**: No public exposure
- Authentication required for database access
- Network isolation between services
- Persistent data volumes

## 🚀 Production Deployment Steps

### 1. **Prepare Environment**
```bash
# Copy production environment template
cp env.production.example .env

# Edit with your secure credentials
nano .env
```

### 2. **Deploy Secure Stack**
```bash
# Stop any existing containers
docker-compose -f docker-compose.prod.yml down

# Start production stack
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. **Verify Security**
```bash
# Check MongoDB is not exposed publicly
netstat -tlnp | grep 27017
# Should show no results

# Check container logs
docker-compose -f docker-compose.prod.yml logs mongo
docker-compose -f docker-compose.prod.yml logs backend
```

### 4. **Seed Database (Optional)**
```bash
# Run production seeder
docker-compose -f docker-compose.prod.yml exec backend npm run seed:prod
```

## 🔄 Switching Between Environments

### **Development → Production:**
```bash
# Stop development
docker-compose -f docker-compose.dev.yml down

# Start production
docker-compose -f docker-compose.prod.yml up -d --build
```

### **Production → Development:**
```bash
# Stop production
docker-compose -f docker-compose.prod.yml down

# Start development
docker-compose -f docker-compose.dev.yml up --build
```

## 📊 Monitoring & Maintenance

### **Check Service Status:**
```bash
docker-compose -f docker-compose.prod.yml ps
```

### **View Logs:**
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs mongo
```

### **Update Services:**
```bash
# Pull latest changes and rebuild
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🆘 Troubleshooting

### **Common Issues:**

1. **Port Conflicts**: Ensure ports 3000, 3001, and 27017 are available
2. **Permission Errors**: Check Docker permissions and volume access
3. **Database Connection**: Verify MongoDB credentials in `.env` file
4. **Image Loading**: Check Next.js configuration for proper image domains

### **Reset Everything:**
```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: This deletes all data)
docker volume rm pf-se-cs-mongo-data

# Start fresh
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📚 Additional Resources

- [MongoDB Security Guide](MONGODB_SECURITY.md) - Detailed security configuration
- [README.md](README.md) - Complete project overview
- [Backend Documentation](backend/README.md) - API documentation
- [Frontend Documentation](frontend/README.md) - Frontend setup

---

**For detailed security configuration, see [MONGODB_SECURITY.md](MONGODB_SECURITY.md)**
