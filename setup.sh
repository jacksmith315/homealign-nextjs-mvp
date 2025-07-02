#!/bin/bash

# =============================================================================
# HomeAlign Next.js Setup Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Welcome message
echo "=============================================="
echo "   HomeAlign Next.js MVP Setup Script"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 18+ and try again."
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
    error "Node.js version 18 or higher is required. Current version: $(node -v)"
fi

success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install npm and try again."
fi

success "npm version: $(npm -v)"

# Create environment file if it doesn't exist
if [[ ! -f ".env.local" ]]; then
    log "Creating .env.local file..."
    cp .env.example .env.local
    
    # Generate a random NextAuth secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    
    # Update the secret in .env.local
    if command -v sed &> /dev/null; then
        sed -i.bak "s/your-nextauth-secret-key-here-change-in-production/$NEXTAUTH_SECRET/" .env.local
        rm .env.local.bak
    fi
    
    success "Created .env.local with generated NextAuth secret"
    warning "Please review and update .env.local with your Django API URL"
else
    log ".env.local already exists, skipping creation"
fi

# Install dependencies
log "Installing npm dependencies..."
npm install

success "Dependencies installed successfully"

# Run type check
log "Running TypeScript type check..."
npm run type-check

success "Type check passed"

# Run linting
log "Running ESLint..."
npm run lint

success "Linting passed"

# Check if Django API is accessible (optional)
log "Checking Django API connectivity..."
DJANGO_URL=$(grep DJANGO_API_URL .env.local | cut -d'=' -f2)

if command -v curl &> /dev/null; then
    if curl -f "$DJANGO_URL/ping" >/dev/null 2>&1; then
        success "Django API is accessible at $DJANGO_URL"
    else
        warning "Django API is not accessible at $DJANGO_URL"
        warning "Make sure your Django backend is running"
    fi
else
    warning "curl not available, skipping API connectivity check"
fi

# Setup complete
echo ""
echo "=============================================="
echo "          Setup Complete! 🎉"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Review and update .env.local with your API settings"
echo "2. Make sure your Django backend is running"
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run lint         - Run linting"
echo "  npm run type-check   - Check TypeScript types"
echo "  ./deploy.sh -e dev   - Deploy with Docker"
echo ""
echo "Application will be available at:"
echo "  http://localhost:3000"
echo ""
echo "Documentation:"
echo "  README.md           - General documentation"
echo "  DATA_FETCHING.md    - API integration guide"
echo ""