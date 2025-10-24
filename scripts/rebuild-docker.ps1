# Comprehensive Docker Rebuild Script for LocalBoxs (PowerShell)
# This script ensures a clean rebuild with React 18.2.0 compatibility

Write-Host "🔄 Starting comprehensive Docker rebuild..." -ForegroundColor Green

# Stop all containers
Write-Host "📦 Stopping containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Remove all containers and images to force rebuild
Write-Host "🗑️ Removing old containers and images..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml rm -f
docker image rm localboxs_app localboxs_nginx 2>$null

# Clean up any dangling images
Write-Host "🧹 Cleaning up dangling images..." -ForegroundColor Yellow
docker image prune -f

# Rebuild with no cache
Write-Host "🔨 Rebuilding with no cache..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

# Start containers
Write-Host "🚀 Starting containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to be ready
Write-Host "⏳ Waiting for containers to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check container health
Write-Host "🏥 Checking container health..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# Verify React versions in the container
Write-Host "🔍 Verifying React versions..." -ForegroundColor Yellow
docker exec localboxs_app npm ls react react-dom next

Write-Host "✅ Rebuild complete!" -ForegroundColor Green
Write-Host "🌐 Application should be available at: https://localboxs.com" -ForegroundColor Cyan
