#!/bin/bash

# Comprehensive Docker Rebuild Script for LocalBoxs
# This script ensures a clean rebuild with React 18.2.0 compatibility

echo "🔄 Starting comprehensive Docker rebuild..."

# Stop all containers
echo "📦 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Remove all containers and images to force rebuild
echo "🗑️ Removing old containers and images..."
docker-compose -f docker-compose.prod.yml rm -f
docker image rm localboxs_app localboxs_nginx 2>/dev/null || true

# Clean up any dangling images
echo "🧹 Cleaning up dangling images..."
docker image prune -f

# Rebuild with no cache
echo "🔨 Rebuilding with no cache..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 10

# Check container health
echo "🏥 Checking container health..."
docker-compose -f docker-compose.prod.yml ps

# Verify React versions in the container
echo "🔍 Verifying React versions..."
docker exec localboxs_app npm ls react react-dom next

echo "✅ Rebuild complete!"
echo "🌐 Application should be available at: https://localboxs.com"
