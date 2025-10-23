#!/bin/bash

# LocalBoxs Production Deployment Script
# This script builds the application with database available

echo "🚀 Starting LocalBoxs Production Deployment..."

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
sleep 10

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🔨 Building application with database available..."
docker-compose -f docker-compose.prod.yml build --no-cache app

echo "🚀 Starting application..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at: http://localhost:3200"
echo "📊 Database is running on port 5432"

# Show logs
echo "📋 Application logs:"
docker-compose -f docker-compose.prod.yml logs -f app
