#!/bin/bash

# Clean up and restart LocalBoxs deployment

echo "🧹 Cleaning up existing containers..."

# Stop and remove existing containers
docker-compose -f docker-compose.prod.yml down -v

# Remove any orphaned containers
docker container prune -f

# Remove any orphaned networks
docker network prune -f

echo "🚀 Starting fresh deployment..."

# Run the deployment script
./deploy-with-db.sh
