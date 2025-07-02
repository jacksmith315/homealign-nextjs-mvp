# Deployment Guide

This guide covers various deployment options for the HomeAlign Next.js MVP application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development](#local-development)
4. [Docker Deployment](#docker-deployment)
5. [Vercel Deployment](#vercel-deployment)
6. [Production Deployment](#production-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Health Checks](#monitoring--health-checks)

## Prerequisites

### Required Software
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **npm**: Comes with Node.js
- **Docker**: For containerized deployment ([docker.com](https://www.docker.com/))
- **Git**: For version control

### Required Services
- **Django Backend**: HomeAlign Django API running on port 8000
- **Database**: PostgreSQL or configured database for Django
- **Redis** (Optional): For session storage and caching

## Environment Configuration

### 1. Copy Environment Files
```bash
# For development
cp .env.example .env.local

# For staging
cp .env.staging.example .env.staging

# For production
cp .env.production.example .env.production
```

### 2. Update Environment Variables

#### Required Variables
- `DJANGO_API_URL`: URL of your Django backend
- `DJANGO_API_BASE_URL`: Django API base URL with /core-api
- `NEXTAUTH_URL`: URL where your Next.js app will be hosted
- `NEXTAUTH_SECRET`: Secure random string (minimum 32 characters)

#### Generate NextAuth Secret
```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Local Development

### Quick Start
```bash
# Run the setup script
./setup.sh

# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

### Manual Setup
```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Start development server
npm run dev
```

### Development with Docker
```bash
# Build and start development container
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Docker Deployment

### Using Deployment Script
```bash
# Deploy to staging
./deploy.sh -e staging

# Deploy to production
./deploy.sh -e production

# Build only (no deployment)
./deploy.sh --build-only

# Skip tests
./deploy.sh -e staging --skip-tests
```

### Manual Docker Deployment

#### 1. Build the Application
```bash
npm run build:production
```

#### 2. Build Docker Image
```bash
docker build -t homealign-nextjs:latest .
```

#### 3. Run with Docker Compose
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 4. Health Check
```bash
curl http://localhost:3000/api/health
```

### Docker Environment Variables
Create a `.env` file for Docker Compose:
```env
# Docker environment
COMPOSE_PROJECT_NAME=homealign
NEXTAUTH_SECRET=your-production-secret-key
DJANGO_API_URL=http://django-api:8000
POSTGRES_DB=homealign
POSTGRES_USER=user
POSTGRES_PASSWORD=secure-password
```

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Environment Variables
```bash
# Set production environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add DJANGO_API_URL production
vercel env add DJANGO_API_BASE_URL production
```

### 4. Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 5. Configure Custom Domain (Optional)
```bash
vercel domains add your-domain.com
```

## Production Deployment

### Server Requirements
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB+ SSD
- **Network**: HTTPS certificate (Let's Encrypt recommended)

### Using PM2 (Process Manager)

#### 1. Install PM2
```bash
npm install -g pm2
```

#### 2. Build Application
```bash
npm run build:production
```

#### 3. Create PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'homealign-nextjs',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/homealign-nextjs-mvp',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    }
  }]
};
```

#### 4. Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/homealign`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/homealign /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## CI/CD Pipeline

### GitHub Actions
The repository includes a comprehensive CI/CD pipeline that:

1. **Quality Checks**: TypeScript, ESLint, Tests
2. **Build**: Creates production builds
3. **Docker**: Builds and pushes container images
4. **Deploy**: Automatic deployment to staging/production

### Setup GitHub Secrets
```bash
# Required secrets in GitHub repository settings:
NEXTAUTH_SECRET=your-secure-secret-key
DJANGO_API_URL=https://api.yourdomain.com
DJANGO_API_BASE_URL=https://api.yourdomain.com/core-api
```

### Workflow Triggers
- **Push to main**: Deploy to production
- **Push to staging**: Deploy to staging
- **Pull requests**: Run quality checks and builds

## Monitoring & Health Checks

### Health Check Endpoint
```bash
# Check application health
curl https://your-domain.com/api/health

# Response format:
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "nextjs": true,
    "database": true,
    "djangoApi": true
  }
}
```

### Monitoring Setup

#### Uptime Monitoring
- **UptimeRobot**: Free service for basic monitoring
- **Pingdom**: Professional monitoring service
- **DataDog**: Comprehensive monitoring solution

#### Application Monitoring
- **Vercel Analytics**: Built-in for Vercel deployments
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking and performance monitoring

#### Custom Monitoring Script
```bash
#!/bin/bash
# monitor.sh
URL="https://your-domain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Application is healthy"
else
    echo "❌ Application is down (HTTP $RESPONSE)"
    # Send alert (email, Slack, etc.)
fi
```

### Log Management

#### View Docker Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nextjs-app

# Last 100 lines
docker-compose logs --tail=100 nextjs-app
```

#### Log Rotation
Add to `/etc/logrotate.d/homealign`:
```
/var/log/homealign/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0644 www-data www-data
    postrotate
        docker-compose restart nextjs-app
    endscript
}
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Docker Issues
```bash
# Clean Docker system
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check container logs
docker-compose logs nextjs-app
```

#### Environment Variables
```bash
# Verify environment variables are loaded
docker-compose exec nextjs-app env | grep DJANGO

# Test API connectivity
docker-compose exec nextjs-app curl $DJANGO_API_URL/ping
```

### Performance Optimization

#### Enable Production Optimizations
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
};
```

#### Database Connection Pooling
Configure your Django backend to use connection pooling for better performance with multiple Next.js instances.

### Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Headers**: Configure security headers in your reverse proxy
4. **Updates**: Keep dependencies updated with `npm audit`
5. **Monitoring**: Set up alerts for failed health checks

For additional support, check the application logs and health check endpoint first, then refer to the main README.md for project-specific information.