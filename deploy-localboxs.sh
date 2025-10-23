#!/bin/bash

# LocalBoxs.com Deployment Script
# Specifically configured for localboxs.com with port 3200

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 LocalBoxs.com Deployment Script${NC}"
echo "====================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Please edit .env file with your actual values before continuing."
            print_warning "Run: nano .env"
            exit 1
        else
            print_error "env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
    print_status ".env file found"
}

# Generate encryption key if not set
generate_encryption_key() {
    if ! grep -q "ENCRYPTION_KEY=" .env || grep -q "ENCRYPTION_KEY=$" .env; then
        print_warning "Generating encryption key..."
        if command -v node &> /dev/null; then
            ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
            sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
            print_status "Encryption key generated and added to .env"
        else
            print_warning "Node.js not found. Please set ENCRYPTION_KEY manually in .env file."
        fi
    else
        print_status "Encryption key already set"
    fi
}

# Deploy the application
deploy() {
    print_status "Deploying LocalBoxs for localboxs.com..."
    
    # Stop existing services
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Build and start
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_status "Services started successfully"
}

# Run database setup
setup_database() {
    print_status "Setting up database..."
    
    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    sleep 15
    
    # Run migrations
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy || {
        print_warning "Migration failed, trying db push..."
        docker-compose -f docker-compose.prod.yml exec -T app npx prisma db push
    }
    
    print_status "Database setup completed"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for services to start
    sleep 20
    
    # Check application health
    if curl -f http://localhost:3200/api/health > /dev/null 2>&1; then
        print_status "Application is healthy"
    else
        print_error "Application health check failed"
        print_warning "Check logs with: docker-compose -f docker-compose.prod.yml logs -f app"
        return 1
    fi
    
    # Check database health
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U localboxs > /dev/null 2>&1; then
        print_status "Database is healthy"
    else
        print_error "Database health check failed"
        return 1
    fi
}

# Show deployment info
show_info() {
    echo ""
    echo -e "${GREEN}🎉 LocalBoxs.com Deployment Complete!${NC}"
    echo "====================================="
    echo ""
    echo "Your LocalBoxs application is now running at:"
    echo "  🌐 Main Application: https://localboxs.com"
    echo "  🔧 Admin Panel: https://localboxs.com/admin"
    echo "  ❤️ Health Check: https://localboxs.com/api/health"
    echo ""
    echo "Direct server access:"
    echo "  📡 Application: http://localhost:3200"
    echo "  ❤️ Health Check: http://localhost:3200/api/health"
    echo ""
    echo "Useful commands:"
    echo "  📋 View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  🛑 Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "  🔄 Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "  🗄️ Database access: docker-compose -f docker-compose.prod.yml exec postgres psql -U localboxs -d localboxs"
    echo ""
    echo "Your nginx configuration is already set up for port 3200!"
    echo "The application should be accessible via https://localboxs.com"
    echo ""
}

# Main deployment function
main() {
    check_docker
    check_env
    generate_encryption_key
    deploy
    setup_database
    health_check && show_info
}

# Run main function
main "$@"
