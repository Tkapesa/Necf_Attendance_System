#!/bin/bash

# NECF Attendance System - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up NECF Attendance System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and Docker Compose first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create environment files
echo "📝 Setting up environment files..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
else
    echo "⚠️  .env already exists, skipping..."
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from backend/.env.example"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from frontend/.env.example"
else
    echo "⚠️  frontend/.env already exists, skipping..."
fi

# Ask if user wants to install dependencies locally
echo ""
read -p "Do you want to install Node.js dependencies locally? (y/N): " install_deps

if [[ $install_deps =~ ^[Yy]$ ]]; then
    echo "📦 Installing dependencies..."
    
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        echo "Installing backend dependencies..."
        cd backend && npm install && cd ..
        
        echo "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
        
        echo "✅ Dependencies installed successfully"
    else
        echo "⚠️  Node.js or npm not found. Skipping local installation."
        echo "You can still use Docker for development."
    fi
fi

# Start development environment
echo ""
read -p "Do you want to start the development environment now? (Y/n): " start_env

if [[ ! $start_env =~ ^[Nn]$ ]]; then
    echo "🐳 Starting development environment with Docker..."
    docker-compose up -d --build
    
    echo ""
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        echo ""
        echo "🎉 Setup completed successfully!"
        echo ""
        echo "📍 Service URLs:"
        echo "   Frontend:     http://localhost:3000"
        echo "   Backend API:  http://localhost:3001"
        echo "   Database UI:  http://localhost:8080"
        echo "   Health Check: http://localhost:3001/health"
        echo ""
        echo "👤 Default Admin Login:"
        echo "   Email:    admin@necf.org"
        echo "   Password: admin123"
        echo ""
        echo "📝 View logs with: docker-compose logs -f"
        echo "🛑 Stop services with: docker-compose down"
        echo ""
        echo "📖 Check docs/DEVELOPMENT.md for more commands"
    else
        echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    fi
else
    echo ""
    echo "✅ Setup completed!"
    echo ""
    echo "To start the development environment later, run:"
    echo "   docker-compose up -d"
    echo ""
    echo "📖 Check README.md for detailed instructions"
fi
