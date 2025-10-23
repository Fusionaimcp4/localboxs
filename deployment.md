# LocalBoxs Docker Deployment Guide

This guide provides step-by-step instructions for deploying LocalBoxs using Docker on your server.

## Prerequisites

- Docker and Docker Compose installed on your server
- Git installed on your server
- Domain name pointing to your server (optional but recommended)
- SSL certificate (if using HTTPS)

## Fresh Deployment (No Existing Database)

If you're deploying LocalBoxs for the first time with no existing database:

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/localboxs.git
cd localboxs
cp env.example .env
```

### 2. Configure Environment for localboxs.com

Edit `.env` file with your domain:

```env
# Database (will be created automatically)
DATABASE_URL="postgresql://localboxs:your_secure_password@postgres:5432/localboxs"
POSTGRES_DB=localboxs
POSTGRES_USER=localboxs
POSTGRES_PASSWORD=your_secure_password

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://localboxs.com
NEXT_PUBLIC_APP_URL=https://localboxs.com
NEXT_PUBLIC_BASE_URL=https://localboxs.com

# Your existing integrations
OPENAI_API_KEY=your_openai_api_key
CHATWOOT_BASE_URL=https://your-chatwoot-instance.com
CHATWOOT_ACCOUNT_ID=your_account_id
CHATWOOT_API_KEY=your_api_key
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key
FUSION_BASE_URL=https://your-fusion-instance.com
FUSION_API_KEY=your_fusion_api_key

# Email configuration
EMAIL_SERVER_HOST=smtp.your-provider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@localboxs.com
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_FROM=your_email@localboxs.com

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

### 3. Deploy with Docker

```bash
# Deploy the application
./deploy.sh prod

# Or manually
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Update Nginx Configuration

Your nginx is already configured for port 3200, which is perfect! The Docker setup will run on port 3200.

If you need to update your nginx config, use the template in `nginx-localboxs.conf`:

```bash
# Copy the nginx configuration
sudo cp nginx-localboxs.conf /etc/nginx/sites-available/localboxs
sudo ln -s /etc/nginx/sites-available/localboxs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Verify Deployment

```bash
# Check application health
curl http://localhost:3200/api/health

# Check via your domain
curl https://localboxs.com/api/health
```

### 6. Access Your Application

- **Main Application**: https://localboxs.com
- **Admin Panel**: https://localboxs.com/admin
- **Health Check**: https://localboxs.com/api/health

## Production Deployment

### 1. SSL/HTTPS Setup

For production, set up SSL certificates. You can use Let's Encrypt with nginx:

```bash
# Install nginx and certbot
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Create nginx configuration
sudo nano /etc/nginx/sites-available/localboxs
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and get SSL certificate:

```bash
sudo ln -s /etc/nginx/sites-available/localboxs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 2. Environment Variables for Production

Update your `.env` file with production URLs:

```env
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Database Backup

Set up regular database backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-localboxs.sh
```

Backup script:

```bash
#!/bin/bash
BACKUP_DIR="/backups/localboxs"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U localboxs localboxs > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Make it executable and add to cron:

```bash
sudo chmod +x /usr/local/bin/backup-localboxs.sh
sudo crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /usr/local/bin/backup-localboxs.sh
```

## Management Commands

### Start/Stop Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f app
docker-compose logs -f postgres
```

### Database Management

```bash
# Access database
docker-compose exec postgres psql -U localboxs -d localboxs

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Reset database (WARNING: This will delete all data)
docker-compose exec app npx prisma migrate reset

# Generate Prisma client
docker-compose exec app npx prisma generate
```

### Application Management

```bash
# Access application container
docker-compose exec app sh

# Check application health
curl http://localhost:3200/api/health

# View application logs
docker-compose logs -f app
```

## Monitoring

### Health Checks

The application includes built-in health checks:

- **Application**: `http://your-domain.com/api/health`
- **Database**: Automatically checked by Docker Compose

### Log Monitoring

```bash
# Real-time logs
docker-compose logs -f

# Application logs only
docker-compose logs -f app

# Database logs only
docker-compose logs -f postgres
```

### Resource Monitoring

```bash
# Check container resource usage
docker stats

# Check disk usage
docker system df
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   docker-compose logs app
   
   # Check environment variables
   docker-compose exec app env | grep -E "(DATABASE_URL|NEXTAUTH)"
   ```

2. **Database connection issues**
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready -U localboxs
   
   # Check database logs
   docker-compose logs postgres
   ```

3. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Port conflicts**
   ```bash
   # Check what's using port 3000
   sudo netstat -tulpn | grep :3000
   
   # Change port in docker-compose.yml if needed
   ```

### Performance Optimization

1. **Enable Docker BuildKit**
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **Use multi-stage builds** (already configured)

3. **Optimize image size**
   ```bash
   # Clean up unused images
   docker image prune -a
   
   # Clean up unused containers
   docker container prune
   ```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Security**: Use strong passwords and limit database access
3. **Network Security**: Use firewalls and restrict port access
4. **SSL/TLS**: Always use HTTPS in production
5. **Regular Updates**: Keep Docker images and dependencies updated

## Backup and Recovery

### Backup

```bash
# Database backup
docker-compose exec postgres pg_dump -U localboxs localboxs > backup.sql

# Volume backup
docker run --rm -v localboxs_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Recovery

```bash
# Restore database
docker-compose exec -T postgres psql -U localboxs localboxs < backup.sql

# Restore volume
docker run --rm -v localboxs_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## Support

For issues and support:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check the health endpoint: `/api/health`
4. Review this documentation
5. Check GitHub issues

## Migration from Non-Docker Setup

If you're migrating from a non-Docker setup:

1. **Export your current database**:
   ```bash
   pg_dump your_current_db > migration_backup.sql
   ```

2. **Update environment variables** to match your current setup

3. **Deploy with Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Import your data**:
   ```bash
   docker-compose exec -T postgres psql -U localboxs localboxs < migration_backup.sql
   ```

5. **Run any pending migrations**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

The Docker setup is designed to be a drop-in replacement for your current setup with minimal configuration changes.
