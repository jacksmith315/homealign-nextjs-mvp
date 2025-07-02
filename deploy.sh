#!/bin/bash

# =============================================================================
# HomeAlign Next.js Deployment Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
BUILD_ONLY=false
SKIP_TESTS=false
DOCKER_TAG="latest"

# Functions
print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  -e, --environment    Environment to deploy (development|staging|production)"
    echo "  -b, --build-only     Only build, don't deploy"
    echo "  -s, --skip-tests     Skip running tests"
    echo "  -t, --tag           Docker tag to use (default: latest)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e staging"
    echo "  $0 -e production -t v1.2.3"
    echo "  $0 --build-only --skip-tests"
}

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -t|--tag)
            DOCKER_TAG="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            error "Unknown option $1"
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be development, staging, or production."
fi

log "Starting deployment for environment: $ENVIRONMENT"

# Check if required files exist
if [[ ! -f "package.json" ]]; then
    error "package.json not found. Are you in the project root?"
fi

if [[ ! -f "Dockerfile" ]]; then
    error "Dockerfile not found. Are you in the project root?"
fi

# Check for environment file
ENV_FILE=".env.$ENVIRONMENT"
if [[ "$ENVIRONMENT" != "development" && ! -f "$ENV_FILE" ]]; then
    warning "Environment file $ENV_FILE not found. Using defaults."
fi

# Install dependencies
log "Installing dependencies..."
npm ci

# Type checking
log "Running TypeScript type check..."
npm run type-check || error "Type check failed"

# Linting
log "Running ESLint..."
npm run lint || error "Linting failed"

# Tests (if not skipped)
if [[ "$SKIP_TESTS" != true ]]; then
    log "Running tests..."
    npm test || error "Tests failed"
fi

# Build application
log "Building Next.js application for $ENVIRONMENT..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    npm run build:production
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    npm run build:staging
else
    npm run build
fi

success "Build completed successfully"

# Exit early if build-only
if [[ "$BUILD_ONLY" == true ]]; then
    success "Build-only mode: deployment skipped"
    exit 0
fi

# Docker operations
log "Building Docker image..."
docker build -t "homealign-nextjs:$DOCKER_TAG" .

success "Docker image built successfully"

# Environment-specific deployment
case $ENVIRONMENT in
    development)
        log "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d
        ;;
    staging)
        log "Deploying to staging..."
        docker-compose -f docker-compose.yml up -d
        ;;
    production)
        log "Deploying to production..."
        # Add production-specific deployment commands here
        docker-compose -f docker-compose.yml up -d
        ;;
esac

# Health check
log "Waiting for application to start..."
sleep 10

# Check if the application is responding
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    success "Application is running and healthy"
else
    warning "Application may not be fully ready yet. Check logs with: docker-compose logs"
fi

success "Deployment completed for environment: $ENVIRONMENT"
log "Application URL: http://localhost:3000"
log "View logs: docker-compose logs -f"
log "Stop services: docker-compose down"