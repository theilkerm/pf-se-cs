# MongoDB Security Configuration

This document describes the secure MongoDB setup for production deployment.

## Security Features

✅ **No Public Internet Exposure**: MongoDB is no longer accessible from outside the Docker network
✅ **Authentication Required**: Username/password authentication is mandatory
✅ **Network Isolation**: Only the backend container can connect to MongoDB
✅ **Automatic User Creation**: Database users are created automatically on first startup

## Configuration Changes

### 1. Environment Variables

Update your `.env` file with these MongoDB variables:

```bash
# MongoDB Configuration
MONGO_USERNAME=admin
MONGO_PASSWORD=your-secure-password-here
MONGO_DATABASE=e-commerce-db
```

**Important**: Choose a strong, unique password for `MONGO_PASSWORD`.

### 2. Docker Compose Changes

- Removed `ports` mapping for MongoDB (no public exposure)
- Added authentication environment variables
- Added MongoDB initialization script volume
- Updated backend connection string to include credentials

### 3. Connection String Format

The new connection string format is:
```
mongodb://username:password@mongo:27017/database?authSource=admin
```

## Deployment Steps

### 1. Update Environment File

```bash
# Copy the production example
cp env.production.example .env

# Edit the file and set your secure password
nano .env
```

### 2. Deploy the Updated Stack

```bash
# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Remove existing MongoDB volume (WARNING: This will delete all data)
docker volume rm pf-se-cs-mongo-data

# Start the new secure stack
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Verify Security

```bash
# Check that MongoDB is not exposed to public internet
netstat -tlnp | grep 27017
# Should show no results

# Check container logs
docker-compose -f docker-compose.prod.yml logs mongo
docker-compose -f docker-compose.prod.yml logs backend
```

## Security Benefits

1. **No Public Access**: MongoDB port 27017 is no longer exposed to the internet
2. **Authentication Required**: All connections must provide valid credentials
3. **Network Isolation**: Only containers in the same Docker network can connect
4. **Automatic Setup**: No manual database user creation required

## Troubleshooting

### Connection Issues

If the backend can't connect to MongoDB:

1. Check that the MongoDB container is running:
   ```bash
   docker-compose -f docker-compose.prod.yml ps mongo
   ```

2. Verify environment variables are set correctly:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend env | grep MONGO
   ```

3. Check MongoDB logs for authentication errors:
   ```bash
   docker-compose -f docker-compose.prod.yml logs mongo
   ```

### Data Persistence

The MongoDB data is persisted in the `pf-se-cs-mongo-data` volume. If you need to reset the database:

```bash
# Stop containers
docker-compose -f docker-compose.prod.yml down

# Remove the volume
docker volume rm pf-se-cs-mongo-data

# Restart - this will create a fresh database
docker-compose -f docker-compose.prod.yml up -d
```

## Migration from Unsecured Setup

If you're migrating from the previous unsecured setup:

1. **Backup your data** before making changes
2. **Update the configuration files** as described above
3. **Deploy the new stack** following the deployment steps
4. **Verify functionality** by testing your application

## Monitoring

Monitor your MongoDB security by:

- Checking that port 27017 is not accessible from outside
- Verifying authentication logs in MongoDB container
- Monitoring failed connection attempts
- Regular security audits of your deployment
