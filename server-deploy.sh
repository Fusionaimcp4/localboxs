#!/bin/bash

# LocalBoxs Server Deployment Script
# This script is run ON THE SERVER after pulling from GitHub

echo "🚀 Starting LocalBoxs Server Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy env.example to .env and configure your environment variables."
    exit 1
fi

# Load environment variables
source .env

echo "📊 Starting PostgreSQL database..."
docker-compose -f docker-compose.prod.yml up -d postgres

echo "⏳ Waiting for database to be ready..."
sleep 15

echo "🔄 Running database migrations..."
export DATABASE_URL="postgresql://localboxs:${POSTGRES_PASSWORD:-postgres}@localhost:5433/localboxs"
npx prisma migrate deploy

echo "🔨 Building application with database available..."
docker-compose -f docker-compose.prod.yml build --no-cache app

echo "🚀 Starting application..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Server deployment completed successfully!"
echo "🌐 Application is running at: http://localhost:3200"
echo "📊 Database is running on port 5433"

# Show logs
echo "📋 Application logs:"
docker-compose -f docker-compose.prod.yml logs -f app
