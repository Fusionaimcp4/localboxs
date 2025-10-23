# LocalBoxs Server Deployment Guide

## Server Deployment Workflow

### 1. Local Development
```bash
# Work on your local machine
npm run dev
# Make changes, test locally
```

### 2. Push to GitHub
```bash
# Commit and push changes
git add .
git commit -m "Your changes"
git push origin main
```

### 3. Server Deployment
```bash
# SSH to your server
ssh user@your-server

# Navigate to project directory
cd /opt/localboxs

# Pull latest changes
git pull origin main

# Run deployment script
chmod +x server-deploy.sh
./server-deploy.sh
```

## Server Requirements

- **Docker & Docker Compose** installed
- **Git** for pulling code
- **Port 3200** available (for Nginx proxy)
- **Port 5433** available (for PostgreSQL)

## Environment Setup on Server

```bash
# Copy environment template
cp env.example .env

# Edit with your production values
nano .env
```

## Nginx Configuration

Your server already has:
```nginx
server_name localboxs.com www.localboxs.com;
location / {
    proxy_pass http://127.0.0.1:3200;
}
```

## Quick Deploy Commands

```bash
# Full deployment
./server-deploy.sh

# Just restart services
docker-compose -f docker-compose.prod.yml restart

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Stop everything
docker-compose -f docker-compose.prod.yml down
```

## Troubleshooting

- **Port conflicts**: Check if ports 3200/5433 are free
- **Build failures**: Check database is running during build
- **Permission errors**: Run with `sudo` if needed
