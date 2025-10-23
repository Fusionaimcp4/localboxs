#!/bin/bash

# Build script that starts database before building

echo "🚀 Starting LocalBoxs build with database..."

# Start PostgreSQL in background
echo "📊 Starting PostgreSQL database..."
docker run -d --name localboxs-build-db \
  -e POSTGRES_DB=localboxs \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Set database URL for build
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/localboxs"

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🔨 Building application..."
npm run build

# Clean up temporary database
echo "🧹 Cleaning up temporary database..."
docker stop localboxs-build-db
docker rm localboxs-build-db

echo "✅ Build completed successfully!"
