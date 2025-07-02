# HomeAlign Next.js MVP

A modern, secure, and scalable Next.js-based healthcare administration platform that serves as an MVP frontend for the Django HomeAlign API backend.

## 🚀 Overview

This application provides a comprehensive healthcare management interface with server-side security, multi-tenant support, and professional-grade features for managing patients, clients, providers, referrals, and services.

## ✨ Key Features

### 🔐 Security First
- **Server-side API Integration**: All Django API calls are handled server-side through Next.js API routes
- **HTTP-only Cookies**: JWT tokens stored securely to prevent XSS attacks
- **Automatic Token Refresh**: Seamless session management with token renewal
- **Authentication Guards**: Protected routes with automatic redirects

### 🏥 Healthcare-Specific Features
- **Multi-tenant Support**: Database switching for different healthcare providers
- **Comprehensive CRUD**: Full management for all healthcare entities
- **Professional UI**: Healthcare-themed interface with medical terminology
- **Bulk Operations**: Efficient batch processing for large datasets
- **Advanced Search**: Real-time search with debounced optimization
- **Data Export**: One-click CSV export with filtering

### 🛠 Developer Experience
- **TypeScript**: Fully typed for better development experience and fewer bugs
- **Modern Architecture**: Next.js 14 with App Router and React Server Components
- **Reusable Components**: Consistent design system with modular architecture
- **Custom Hooks**: Simplified data fetching with built-in loading states
- **Error Handling**: Comprehensive error boundaries and user feedback

### 📱 User Experience
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Loading States**: Proper loading indicators and disabled states
- **Error Messages**: User-friendly error display and recovery
- **Optimistic Updates**: Instant UI feedback with automatic refetching
- **Professional Forms**: Multi-section forms with validation

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Next.js APIs   │    │  Django Backend │
│                 │    │                 │    │                 │
│ • React UI      │◄──►│ • /api/auth/*   │◄──►│ • /token        │
│ • TypeScript    │    │ • /api/data/*   │    │ • /core-api     │
│ • Tailwind CSS  │    │ • Server-side   │    │ • Database      │
│ • Custom Hooks  │    │ • HTTP-only     │    │ • Business      │
│                 │    │   Cookies       │    │   Logic         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚦 Quick Start

### Prerequisites
- Node.js 18.0.0 or later
- Running Django HomeAlign backend (default: http://localhost:8000)

### Installation

1. **Clone and Setup**
   ```bash
   cd /Users/jacksmith/Projects/homealign-nextjs-mvp
   ./setup.sh
   ```

2. **Configure Environment**
   ```bash
   # Edit .env.local with your Django API URL
   nano .env.local
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript compiler check

### Deployment
- `./deploy.sh -e staging` - Deploy to staging environment
- `./deploy.sh -e production` - Deploy to production environment
- `./deploy.sh --build-only` - Build without deployment
- `./setup.sh` - Initial project setup

### Docker
- `docker-compose up -d` - Start with Docker Compose
- `docker-compose -f docker-compose.dev.yml up` - Development with Docker

## 🏥 Application Features

### Patient Management
- Comprehensive patient records with medical information
- Insurance details and emergency contacts
- Search and filter by demographics
- Bulk operations and CSV export

### Client Management
- Healthcare organizations and facilities
- Contact information and service agreements
- Client type categorization
- Status tracking and management

### Provider Network
- Healthcare provider credentials and specialties
- NPI, license, and DEA number management
- Network status and contract management
- Provider type categorization

### Referral Management
- Complete referral workflow management
- Priority levels and status tracking
- Authorization requirements
- Clinical documentation support

### Service Catalog
- Healthcare service definitions
- CPT/HCPCS coding integration
- Pricing and billing management
- Service requirements and restrictions

## 🔧 Configuration

### Environment Variables

#### Required
- `DJANGO_API_URL` - Django backend URL
- `DJANGO_API_BASE_URL` - Django API base URL with /core-api
- `NEXTAUTH_URL` - Next.js application URL
- `NEXTAUTH_SECRET` - Secure random string (32+ characters)

#### Optional
- `NEXT_PUBLIC_APP_NAME` - Application display name
- `NEXT_PUBLIC_APP_VERSION` - Version number
- `NEXT_PUBLIC_SUPPORT_EMAIL` - Support contact email

### Multi-tenant Configuration
The application supports multiple healthcare providers through database selection:
- Core, AllyAlign, Humana, BCBS Arizona, Centene, UHC, AARP, Aetna
- Database selection persisted in user sessions
- Automatic query parameter addition (`?db=<database>`)

## 🚀 Deployment

### Quick Deployment
```bash
# Deploy to staging
./deploy.sh -e staging

# Deploy to production
./deploy.sh -e production
```

### Deployment Options

#### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### 2. Docker
```bash
docker build -t homealign-nextjs .
docker run -p 3000:3000 homealign-nextjs
```

#### 3. Traditional Server
```bash
npm run build:production
npm run start:production
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📊 API Integration

### Server-side Security
All API calls are routed through Next.js API handlers:

```typescript
// Client-side code
const { data, loading, error } = usePatients();

// Automatically calls /api/data/patients
// Which proxies to Django /core-api/patients?db=<database>
```

### Authentication Flow
1. User submits login credentials
2. Next.js API calls Django `/token/`
3. JWT tokens stored in HTTP-only cookies
4. Subsequent requests include authentication automatically
5. Automatic token refresh on expiration

### Data Fetching
```typescript
// Using custom hooks
const { data, loading, error, refetch } = usePatients({
  search: 'john',
  gender: 'f'
});

// Using services directly
const patients = await patientService.getPatients({
  page: 1,
  filters: { gender: 'f' }
});
```

For detailed API documentation, see [DATA_FETCHING.md](DATA_FETCHING.md).

## 🧪 Testing

### Running Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

### Type Checking
```bash
npm run type-check       # TypeScript validation
```

### Linting
```bash
npm run lint             # Check code style
npm run lint:fix         # Fix automatically
```

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
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

### Logging
```bash
# Docker logs
docker-compose logs -f

# PM2 logs
pm2 logs homealign-nextjs

# Application logs
tail -f /var/log/homealign/app.log
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation as needed

## 📚 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Comprehensive deployment guide
- [DATA_FETCHING.md](DATA_FETCHING.md) - API integration details
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

#### API Connection Issues
```bash
# Check Django backend is running
curl http://localhost:8000/ping

# Verify environment variables
cat .env.local
```

#### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Getting Help
1. Check the health endpoint: `/api/health`
2. Review application logs
3. Verify environment configuration
4. Check Django backend connectivity

## 📄 License

This project is proprietary software. All rights reserved.

## 🏥 About HomeAlign

HomeAlign is a comprehensive healthcare service management platform designed to streamline administrative processes for healthcare providers, insurance companies, and service organizations.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**