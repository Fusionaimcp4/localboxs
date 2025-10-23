# LocalBoxs Server Deployment

## Quick Deploy

```bash
# 1. Pull latest code
git pull origin main

# 2. Run deployment
chmod +x server-deploy.sh
./server-deploy.sh
```

## What It Does

1. **Starts PostgreSQL** → Docker container on port 5433
2. **Runs migrations** → Database schema setup
3. **Builds app** → With database available during build
4. **Starts app** → Production deployment on port 3200

## Ports

- **App**: 3200 (proxied by Nginx)
- **Database**: 5433 (Docker PostgreSQL)
- **Existing PostgreSQL**: 5432 (unchanged)

## Environment

Make sure `.env` file exists with all required variables.

## Troubleshooting

```bash
# Check containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Restart services
docker-compose -f docker-compose.prod.yml restart
```
