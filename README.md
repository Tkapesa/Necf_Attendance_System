# NECF Church Attendance System

A comprehensive church attendance management system built with modern web technologies.

## 🏗️ Tech Stack

- **Backend**: Node.js 18, Express.js, TypeScript
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Database**: PostgreSQL 14
- **ORM**: Prisma
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose
- **Code Quality**: ESLint, Prettier, Husky

## 📁 Project Structure

```
Attendance_System_NECF/
├── backend/                 # Backend API server
│   ├── src/                # Source code
│   ├── prisma/             # Database schema and migrations
│   ├── Dockerfile          # Backend container configuration
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend application
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   ├── Dockerfile          # Frontend container configuration
│   └── package.json        # Frontend dependencies
├── docs/                   # Documentation
├── docker-compose.yml      # Multi-service container orchestration
├── docker-compose.override.yml # Development overrides
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v18+) and **npm** (v9+) for local development
- **Git** for version control

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd Attendance_System_NECF
\`\`\`

### 2. Environment Setup

\`\`\`bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your specific configuration
\`\`\`

### 3. Docker Development Setup (Recommended)

\`\`\`bash
# Start all services in development mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
\`\`\`

### 4. Local Development Setup (Alternative)

#### Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Set up database
npm run migrate

# Generate Prisma client
npm run db:generate

# Seed database with sample data
npm run db:seed

# Start development server
npm run dev
\`\`\`

#### Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React application |
| Backend | 3001 | Express API server |
| PostgreSQL | 5432 | Database server |
| Adminer | 8080 | Database administration |
| Redis | 6379 | Cache and session store |

### Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database Admin**: http://localhost:8080
- **API Documentation**: http://localhost:3001/docs (when implemented)

## 🛠️ Development Commands

### Backend Commands

\`\`\`bash
cd backend

# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run migrate         # Run database migrations
npm run migrate:deploy  # Deploy migrations (production)
npm run db:generate     # Generate Prisma client
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data
npm run db:reset        # Reset database and reseed

# Code Quality
npm run lint            # Check code quality
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run type-check      # Check TypeScript types

# Testing
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
\`\`\`

### Frontend Commands

\`\`\`bash
cd frontend

# Development
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Check code quality
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run type-check      # Check TypeScript types

# Testing
npm test                # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage
\`\`\`

### Docker Commands

\`\`\`bash
# Development
docker-compose up -d                    # Start all services
docker-compose up -d --build           # Rebuild and start
docker-compose logs -f [service]       # View logs
docker-compose down                     # Stop all services
docker-compose down -v                  # Stop and remove volumes

# Production
NODE_ENV=production docker-compose -f docker-compose.yml up -d

# Individual services
docker-compose up -d postgres          # Start only database
docker-compose up -d backend           # Start only backend
docker-compose up -d frontend          # Start only frontend

# Database operations
docker-compose exec backend npm run migrate
docker-compose exec backend npm run db:seed
docker-compose exec postgres psql -U postgres -d necf_attendance
\`\`\`

## 🗃️ Database Management

### Prisma Commands

\`\`\`bash
# Generate client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Pull database schema
npx prisma db pull
\`\`\`

### Database Connection

**Development:**
- Host: localhost
- Port: 5432
- Database: necf_attendance
- Username: postgres
- Password: postgres

**Adminer Access:**
- URL: http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: postgres
- Password: postgres
- Database: necf_attendance

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

\`\`\`bash
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/necf_attendance

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis
REDIS_URL=redis://:redis123@redis:6379
\`\`\`

### Default Users

After running the seed script, you can login with:

\`\`\`
Super Admin:
Email: admin@necf.org
Password: admin123

Pastor:
Email: pastor@necf.org
Password: pastor123

Member:
Email: member1@example.com
Password: member123
\`\`\`

## 🧪 Testing

### Backend Testing

\`\`\`bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- user.test.ts
\`\`\`

### Frontend Testing

\`\`\`bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
\`\`\`

## 📦 Deployment

### Production Build

\`\`\`bash
# Set environment to production
export NODE_ENV=production

# Build and start with Docker Compose
docker-compose -f docker-compose.yml up -d --build

# Or build manually
cd backend && npm run build
cd ../frontend && npm run build
\`\`\`

### Health Checks

All services include health checks:

\`\`\`bash
# Check service health
docker-compose ps

# Backend health check
curl http://localhost:3001/health

# Frontend health check
curl http://localhost:3000/health
\`\`\`

## 🔍 Monitoring and Logging

### View Logs

\`\`\`bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Tail logs
docker-compose logs -f --tail=100 backend
\`\`\`

### Application Logs

Backend logs are stored in:
- Development: Console output
- Production: \`./backend/logs/app.log\`

## 🛡️ Security

### Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Helmet.js security headers
- Rate limiting
- Input validation
- SQL injection protection (Prisma)

### Security Checklist

- [ ] Change default passwords
- [ ] Update JWT secret
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Enable database SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts

## 🤝 Contributing

### Code Style

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **TypeScript**: Type safety

### Commit Convention

Follow conventional commits:

\`\`\`
feat: add user authentication
fix: resolve database connection issue
docs: update README
style: format code with prettier
refactor: restructure user service
test: add user registration tests
\`\`\`

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Update documentation
7. Submit a pull request

## 📚 API Documentation

### Authentication Endpoints

\`\`\`
POST /auth/login       - User login
POST /auth/register    - User registration
POST /auth/logout      - User logout
POST /auth/refresh     - Refresh token
\`\`\`

### User Endpoints

\`\`\`
GET  /users           - Get all users
GET  /users/:id       - Get user by ID
PUT  /users/:id       - Update user
DELETE /users/:id     - Delete user
\`\`\`

### Event Endpoints

\`\`\`
GET  /events          - Get all events
POST /events          - Create event
GET  /events/:id      - Get event by ID
PUT  /events/:id      - Update event
DELETE /events/:id    - Delete event
\`\`\`

### Attendance Endpoints

\`\`\`
GET  /attendance      - Get attendance records
POST /attendance      - Mark attendance
PUT  /attendance/:id  - Update attendance
\`\`\`

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Error

\`\`\`bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
\`\`\`

#### Port Already in Use

\`\`\`bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different ports in .env file
\`\`\`

#### Permission Denied

\`\`\`bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
\`\`\`

#### Docker Build Issues

\`\`\`bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Remove volumes and rebuild
docker-compose down -v
docker-compose up -d --build
\`\`\`

### Getting Help

- Check logs: \`docker-compose logs -f\`
- Verify environment variables
- Ensure all required services are running
- Check network connectivity between containers
- Review Docker and Docker Compose documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in the \`/docs\` folder

---

**NECF Development Team** - Building technology solutions for the church community.
