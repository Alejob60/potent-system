# Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the MisyBot system to a production environment. It covers deployment scripts, monitoring setup, backup procedures, and deployment validation.

## Prerequisites

### System Requirements

- Node.js 18.x or higher
- PostgreSQL 13.x or higher
- Redis 6.x or higher
- MongoDB 5.x or higher
- Azure CLI (for Azure AD authentication)
- Docker (optional, for containerized deployment)

### Environment Variables

Ensure all required environment variables are configured in the production environment:

```env
# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSL=true

# Redis Configuration
REDIS_HOST=your-redis-host
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true
REDIS_TTL=900

# MongoDB Configuration
MONGODB_URI=your-production-mongodb-uri

# Azure Service Bus
AZURE_SERVICE_BUS_CONNECTION_STRING=your-service-bus-connection-string

# Azure Key Vault
AZURE_KEY_VAULT_URL=your-key-vault-url

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-storage-connection-string

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_ENDPOINT=your-openai-api-endpoint

# Application Configuration
PORT=3007
CORS_ORIGINS=your-production-origins
```

## Deployment Scripts

### 1. Build Script

Create a build script to compile the TypeScript code:

```bash
#!/bin/bash
# build.sh

echo "Building MisyBot application..."

# Clean previous build
rm -rf dist

# Compile TypeScript
npx tsc

# Copy necessary files
cp .env.local dist/
cp -r public dist/

echo "Build completed successfully!"
```

### 2. Database Migration Script

Create a script to run database migrations:

```bash
#!/bin/bash
# migrate.sh

echo "Running database migrations..."

# Run TypeORM migrations
npx typeorm migration:run -d dist/data-source.js

echo "Database migrations completed!"
```

### 3. Deployment Script

Create a comprehensive deployment script:

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting MisyBot deployment..."

# 1. Pull latest code
echo "Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo "Installing dependencies..."
npm ci --production

# 3. Build application
echo "Building application..."
./build.sh

# 4. Run database migrations
echo "Running database migrations..."
./migrate.sh

# 5. Stop existing application
echo "Stopping existing application..."
pm2 stop misybot-backend || true

# 6. Start application
echo "Starting application..."
pm2 start dist/src/main.js --name misybot-backend

# 7. Save PM2 configuration
pm2 save

echo "Deployment completed successfully!"
```

### 4. Rollback Script

Create a rollback script for quick recovery:

```bash
#!/bin/bash
# rollback.sh

echo "Rolling back to previous version..."

# Stop current application
pm2 stop misybot-backend || true

# Restore previous version (implementation depends on your deployment strategy)
# This could involve:
# - Reverting Git commit
# - Restoring from backup
# - Switching to previous Docker image

# Start previous version
pm2 start dist/src/main.js --name misybot-backend

echo "Rollback completed!"
```

## Monitoring Setup

### 1. Application Insights Configuration

The application already includes Application Insights integration. Ensure the following environment variables are set:

```env
APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key
APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string
```

### 2. Health Check Endpoints

The application exposes health check endpoints:

- `GET /health` - Basic health check
- `GET /health/database` - Database connectivity check
- `GET /health/redis` - Redis connectivity check
- `GET /health/mongodb` - MongoDB connectivity check

### 3. Log Monitoring

Configure log aggregation and monitoring:

```bash
# Example logrotate configuration
/var/log/misybot/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 misybot misybot
}
```

### 4. Performance Monitoring

Set up performance monitoring with the following metrics:

- Response times
- Error rates
- Database query performance
- Redis operation throughput
- Memory usage
- CPU usage

## Backup Procedures

### 1. Database Backup

Create a database backup script:

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/backups/misybot"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/misybot_db_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "misybot_db_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: $BACKUP_FILE.gz"
```

### 2. Redis Backup

Create a Redis backup script:

```bash
#!/bin/bash
# backup-redis.sh

BACKUP_DIR="/backups/misybot"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/misybot_redis_$DATE.rdb"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create Redis backup (BGSAVE command)
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD BGSAVE

# Wait for backup to complete
sleep 10

# Copy the RDB file
cp /var/lib/redis/dump.rdb $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 7 days
find $BACKUP_DIR -name "misybot_redis_*.rdb.gz" -mtime +7 -delete

echo "Redis backup completed: $BACKUP_FILE.gz"
```

### 3. MongoDB Backup

Create a MongoDB backup script:

```bash
#!/bin/bash
# backup-mongodb.sh

BACKUP_DIR="/backups/misybot"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/mongodb_$DATE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create MongoDB backup
mongodump --uri="$MONGODB_URI" --out=$BACKUP_PATH

# Compress backup
tar -czf $BACKUP_PATH.tar.gz $BACKUP_PATH

# Remove uncompressed backup
rm -rf $BACKUP_PATH

# Remove backups older than 7 days
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +7 -delete

echo "MongoDB backup completed: $BACKUP_PATH.tar.gz"
```

### 4. Automated Backup Schedule

Set up automated backups using cron:

```bash
# Add to crontab (crontab -e)
# Daily database backup at 2 AM
0 2 * * * /path/to/backup-database.sh

# Daily Redis backup at 3 AM
0 3 * * * /path/to/backup-redis.sh

# Daily MongoDB backup at 4 AM
0 4 * * * /path/to/backup-mongodb.sh
```

## Security Considerations

### 1. Environment Variable Security

- Never commit sensitive environment variables to version control
- Use secret management services (Azure Key Vault, HashiCorp Vault)
- Rotate secrets regularly
- Use different secrets for different environments

### 2. Network Security

- Restrict database access to application servers only
- Use TLS/SSL for all external connections
- Implement firewall rules to limit access
- Use private networks where possible

### 3. Application Security

- Keep dependencies up to date
- Run security scans regularly
- Implement proper authentication and authorization
- Validate all input data
- Sanitize output data

## Deployment Validation

### 1. Pre-deployment Checklist

- [ ] All tests pass locally
- [ ] Code has been reviewed
- [ ] Security scans completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Backup procedures tested

### 2. Post-deployment Validation

Create a validation script to verify deployment:

```bash
#!/bin/bash
# validate-deployment.sh

BASE_URL="http://localhost:3007"

echo "Validating MisyBot deployment..."

# Check if application is responding
echo "Checking application health..."
curl -f $BASE_URL/health || { echo "Health check failed"; exit 1; }

# Check database connectivity
echo "Checking database connectivity..."
curl -f $BASE_URL/health/database || { echo "Database health check failed"; exit 1; }

# Check Redis connectivity
echo "Checking Redis connectivity..."
curl -f $BASE_URL/health/redis || { echo "Redis health check failed"; exit 1; }

# Check MongoDB connectivity
echo "Checking MongoDB connectivity..."
curl -f $BASE_URL/health/mongodb || { echo "MongoDB health check failed"; exit 1; }

# Test API endpoints
echo "Testing API endpoints..."
curl -f $BASE_URL/api/v1/agents/trend-scanner || { echo "API endpoint test failed"; exit 1; }

echo "Deployment validation completed successfully!"
```

### 3. Smoke Tests

Implement smoke tests to verify core functionality:

```bash
#!/bin/bash
# smoke-tests.sh

# Test tenant registration
echo "Testing tenant registration..."
curl -X POST $BASE_URL/api/meta-agent/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Test Tenant",
    "contactEmail": "test@example.com",
    "websiteUrl": "https://test.example.com",
    "businessIndustry": "technology"
  }' || { echo "Tenant registration failed"; exit 1; }

# Test front desk service
echo "Testing front desk service..."
curl -X POST $BASE_URL/v2/agents/front-desk \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, world!",
    "context": {
      "sessionId": "test-session-123"
    }
  }' || { echo "Front desk service test failed"; exit 1; }

echo "Smoke tests completed successfully!"
```

## Rollback Procedures

### 1. When to Rollback

- Critical bugs in production
- Performance degradation
- Security vulnerabilities
- Data corruption

### 2. Rollback Steps

1. Identify the issue and confirm rollback is needed
2. Notify stakeholders
3. Execute rollback script
4. Validate rollback success
5. Monitor system post-rollback
6. Plan fix for rolled-back version

### 3. Rollback Validation

After rollback, verify:

- Application is functioning correctly
- No data loss occurred
- Performance is acceptable
- All services are operational

## Disaster Recovery

### 1. Backup Restoration

Procedures for restoring from backups:

```bash
#!/bin/bash
# restore-backup.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

echo "Restoring from backup: $BACKUP_FILE"

# Stop application
pm2 stop misybot-backend

# Restore database
gunzip -c $BACKUP_FILE | psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME

# Start application
pm2 start misybot-backend

echo "Backup restoration completed!"
```

### 2. Failover Procedures

Implement failover for critical services:

- Database replication
- Redis clustering
- Load balancer configuration
- CDN setup for static assets

## Monitoring and Alerting

### 1. Critical Alerts

Set up alerts for:

- Application downtime
- High error rates (>5%)
- Slow response times (>2 seconds)
- Database connection failures
- Redis connectivity issues
- High memory/CPU usage

### 2. Performance Alerts

Set up alerts for:

- Database query performance degradation
- Redis operation latency
- API response time increases
- Queue processing delays

### 3. Security Alerts

Set up alerts for:

- Unauthorized access attempts
- Suspicious activity
- Failed authentication attempts
- Data access anomalies

## Maintenance Procedures

### 1. Regular Maintenance Tasks

- Database index optimization
- Redis memory cleanup
- Log file rotation
- Dependency updates
- Security patches

### 2. Scheduled Maintenance Windows

Plan maintenance during low-traffic periods:

- Database maintenance: Weekly, Sunday 2-4 AM
- System updates: Monthly, first Sunday of month
- Backup verification: Weekly, Saturday 1-2 AM

## Conclusion

This deployment guide provides a comprehensive framework for deploying the MisyBot system to production. By following these procedures, you can ensure a smooth, secure, and reliable deployment with proper monitoring and backup procedures in place.

Regular review and updates to this guide are recommended as the system evolves and new requirements emerge.