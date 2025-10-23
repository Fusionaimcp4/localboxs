#!/bin/bash

# Proper LocalBoxs Production Deployment Script

echo "🚀 Starting LocalBoxs Production Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Load environment variables
source .env

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start PostgreSQL first
echo "📊 Starting PostgreSQL..."
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 15

# Check if PostgreSQL is running and healthy
if ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "healthy"; then
    echo "❌ PostgreSQL is not healthy!"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
fi

echo "✅ PostgreSQL is healthy!"

# Set DATABASE_URL for build and migrations
export DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5433/localboxs"

# Run migrations on the Docker PostgreSQL
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Build the app with database available
echo "🔨 Building application with database available..."
docker-compose -f docker-compose.prod.yml build app

# Start the app
echo "🚀 Starting application..."
docker-compose -f docker-compose.prod.yml up -d app

echo "✅ Deployment completed!"
echo "🌐 Application: http://localhost:3200"
echo "📊 Database: localhost:5433"

# Show status
docker-compose -f docker-compose.prod.yml ps
