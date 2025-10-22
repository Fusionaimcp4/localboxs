# Production Deployment Script

#!/bin/bash

# LocalBoxs Production Deployment Script
# This script handles the complete deployment process

set -e

echo "🚀 Starting LocalBoxs Production Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy env.example to .env and configure your environment variables."
    exit 1
fi

# Check if required environment variables are set
echo "🔍 Validating environment configuration..."
source .env

required_vars=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "OPENAI_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set!"
        exit 1
    fi
done

echo "✅ Environment validation passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🏗️ Building application..."
npm run build

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

echo "✅ Production deployment completed successfully!"
echo "🎉 LocalBoxs is ready for production!"

# Optional: Start the application
if [ "$1" = "--start" ]; then
    echo "🚀 Starting application..."
    npm start
fi