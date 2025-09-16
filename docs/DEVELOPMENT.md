# Development Quick Start

This document provides a quick reference for common development tasks.

## Initial Setup

```bash
# 1. Setup environment files
npm run setup

# 2. Install dependencies (if developing locally)
npm run install:all

# 3. Start development environment with Docker
npm run dev

# 4. View logs
npm run dev:logs
```

## Database Operations

```bash
# Run migrations
npm run migrate

# Seed database
npm run db:seed

# Reset database (development only)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## Code Quality

```bash
# Lint all code
npm run lint

# Format all code
npm run format

# Run all tests
npm run test
```

## Docker Commands

```bash
# Start development environment
npm run dev

# Rebuild and start
npm run dev:build

# Stop all services
npm run dev:down

# Clean up everything (removes volumes)
npm run dev:clean

# Production deployment
npm run prod
```

## Service URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Admin: http://localhost:8080
- Health Check: http://localhost:3001/health

## Default Login

```
Email: admin@necf.org
Password: admin123
```

## Troubleshooting

### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Issues
```bash
# Reset database
npm run db:reset

# Check database logs
docker-compose logs postgres
```

### Container Issues
```bash
# Clean everything
npm run dev:clean

# Rebuild from scratch
npm run dev:build
```
