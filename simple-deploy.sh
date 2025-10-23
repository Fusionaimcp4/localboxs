#!/bin/bash

# Simple LocalBoxs Deployment Script

echo "🚀 Starting LocalBoxs Deployment..."

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
echo "⏳ Waiting for PostgreSQL..."
sleep 10

# Check if PostgreSQL is running
if ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL failed to start!"
    exit 1
fi

echo "✅ PostgreSQL is running!"

# Run migrations
echo "🔄 Running database migrations..."
export DATABASE_URL="postgresql://localboxs:${POSTGRES_PASSWORD}@localhost:5433/localboxs"
npx prisma migrate deploy

# Build and start the app
echo "🔨 Building and starting application..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Deployment completed!"
echo "🌐 Application: http://localhost:3200"
echo "📊 Database: localhost:5433"

# Show status
docker-compose -f docker-compose.prod.yml ps
