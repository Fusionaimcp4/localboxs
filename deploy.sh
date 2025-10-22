#!/bin/bash

# LocalBoxs Docker Deployment Script
# This script automates the deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

echo -e "${GREEN}🚀 LocalBoxs Docker Deployment Script${NC}"
echo "=================================="

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
    if [ ! -f "$ENV_FILE" ]; then
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

# Build and start services
deploy() {
    local use_prod=${1:-false}
    local compose_file=$COMPOSE_FILE
    
    if [ "$use_prod" = true ]; then
        compose_file=$PROD_COMPOSE_FILE
        print_status "Using production configuration"
    fi
    
    print_status "Building and starting services..."
    
    # Stop existing services
    docker-compose -f $compose_file down 2>/dev/null || true
    
    # Build and start
    docker-compose -f $compose_file up -d --build
    
    print_status "Services started successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    docker-compose exec -T app npx prisma migrate deploy || {
        print_warning "Migration failed, trying db push..."
        docker-compose exec -T app npx prisma db push
    }
    
    print_status "Database migrations completed"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for services to start
    sleep 15
    
    # Check application health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Application is healthy"
    else
        print_error "Application health check failed"
        print_warning "Check logs with: docker-compose logs -f app"
        return 1
    fi
    
    # Check database health
    if docker-compose exec -T postgres pg_isready -U localboxs > /dev/null 2>&1; then
        print_status "Database is healthy"
    else
        print_error "Database health check failed"
        return 1
    fi
}

# Show deployment info
show_info() {
    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo "========================"
    echo ""
    echo "Application URL: http://localhost:3000"
    echo "Health Check: http://localhost:3000/api/health"
    echo ""
    echo "Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart: docker-compose restart"
    echo "  Database access: docker-compose exec postgres psql -U localboxs -d localboxs"
    echo ""
}

# Main deployment function
main() {
    local mode=${1:-"dev"}
    
    case $mode in
        "dev")
            echo "Deploying in development mode..."
            check_docker
            check_env
            generate_encryption_key
            deploy false
            run_migrations
            health_check && show_info
            ;;
        "prod")
            echo "Deploying in production mode..."
            check_docker
            check_env
            generate_encryption_key
            deploy true
            run_migrations
            health_check && show_info
            ;;
        "update")
            echo "Updating existing deployment..."
            check_docker
            deploy false
            run_migrations
            health_check && show_info
            ;;
        *)
            echo "Usage: $0 [dev|prod|update]"
            echo "  dev   - Deploy in development mode (default)"
            echo "  prod  - Deploy in production mode"
            echo "  update - Update existing deployment"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"