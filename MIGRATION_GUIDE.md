# Migration Guide: From Non-Docker to Docker

This guide helps you migrate your existing LocalBoxs installation to Docker deployment.

## Pre-Migration Checklist

- [ ] Backup your current database
- [ ] Export your current environment variables
- [ ] Note your current configuration settings
- [ ] Plan for downtime during migration

## Step-by-Step Migration

### 1. Backup Current Installation

```bash
# Backup your database
pg_dump your_current_db > localboxs_backup.sql

# Backup your environment variables
cp .env .env.backup

# Backup any custom configurations
tar -czf localboxs_config_backup.tar.gz prisma/ public/ data/
```

### 2. Prepare Docker Environment

```bash
# Clone the Docker-ready repository
git clone https://github.com/your-username/localboxs.git
cd localboxs

# Copy your environment variables
cp ../your-old-installation/.env .env
```

### 3. Update Environment Variables

Update your `.env` file for Docker:

```env
# Update database URL for Docker
DATABASE_URL="postgresql://localboxs:your_password@postgres:5432/localboxs"

# Update URLs if needed
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### 4. Deploy with Docker

```bash
# Deploy the new Docker setup
./deploy.sh prod

# Or manually
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Import Your Data

```bash
# Wait for services to start
sleep 30

# Import your database
docker-compose exec -T postgres psql -U localboxs -d localboxs < localboxs_backup.sql

# Run any pending migrations
docker-compose exec app npx prisma migrate deploy
```

### 6. Verify Migration

```bash
# Check application health
curl http://localhost:3000/api/health

# Check database connection
docker-compose exec postgres psql -U localboxs -d localboxs -c "SELECT COUNT(*) FROM users;"

# Test admin access
curl http://localhost:3000/admin
```

### 7. Update DNS/Proxy

If you're using a reverse proxy or load balancer:

```nginx
# Update nginx configuration
upstream localboxs {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localboxs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Post-Migration Tasks

### 1. Clean Up Old Installation

```bash
# Stop old services
sudo systemctl stop your-old-localboxs-service

# Remove old files (be careful!)
rm -rf /path/to/old/localboxs
```

### 2. Update Monitoring

Update your monitoring systems to check the new Docker endpoints:

```bash
# Health check endpoint
curl http://localhost:3000/api/health

# Docker container status
docker-compose ps
```

### 3. Update Backup Scripts

Update your backup scripts to work with Docker:

```bash
#!/bin/bash
# New backup script for Docker
BACKUP_DIR="/backups/localboxs"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U localboxs localboxs > $BACKUP_DIR/backup_$DATE.sql

# Backup volumes
docker run --rm -v localboxs_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_volume_$DATE.tar.gz -C /data .

# Clean old backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "postgres_volume_*.tar.gz" -mtime +7 -delete
```

## Troubleshooting Migration Issues

### Database Connection Issues

```bash
# Check database status
docker-compose exec postgres pg_isready -U localboxs

# Check database logs
docker-compose logs postgres

# Reset database connection
docker-compose restart postgres
```

### Application Issues

```bash
# Check application logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Check environment variables
docker-compose exec app env | grep -E "(DATABASE_URL|NEXTAUTH)"
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Scale services if needed
docker-compose up -d --scale app=2
```

## Rollback Plan

If you need to rollback:

```bash
# Stop Docker services
docker-compose down

# Restore old installation
sudo systemctl start your-old-localboxs-service

# Restore database
psql your_current_db < localboxs_backup.sql
```

## Benefits of Docker Migration

- **Consistency**: Same environment across development, staging, and production
- **Scalability**: Easy to scale services up or down
- **Maintenance**: Simplified updates and rollbacks
- **Isolation**: Better security and resource management
- **Backup**: Easier backup and restore procedures

## Support

If you encounter issues during migration:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check the health endpoint: `/api/health`
4. Review this migration guide
5. Check GitHub issues for similar problems

The Docker setup is designed to be a drop-in replacement for your current installation with minimal configuration changes.
