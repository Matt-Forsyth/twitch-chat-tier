#!/bin/bash

# Twitch Tier List Extension - Quick Start Script
# This script helps you set up and run the project quickly

echo "🎯 Twitch Tier List Extension - Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check if MongoDB is running
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  MongoDB client not found. You'll need MongoDB to run this project."
    echo "   Install: brew install mongodb-community (macOS)"
    echo "   Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
else
    echo "✅ MongoDB client found"
fi

echo ""
echo "📦 Checking dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Dependencies not fully installed. Running npm install..."
    npm install
    cd backend && npm install && cd ..
    cd frontend && npm install && cd ..
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "⚠️  Backend .env file not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env with your Twitch credentials!"
    echo "   1. Go to https://dev.twitch.tv/console"
    echo "   2. Create an Extension and get credentials"
    echo "   3. Update backend/.env with your values"
    echo ""
fi

echo ""
echo "🚀 Ready to start!"
echo ""
echo "Available commands:"
echo "  npm run dev              - Start both backend and frontend"
echo "  npm run dev:backend      - Start backend only (port 8081)"
echo "  npm run dev:frontend     - Start frontend only (port 3000)"
echo "  npm run build            - Build for production"
echo ""
echo "📖 Documentation:"
echo "  README.md                - Complete documentation"
echo "  SETUP_GUIDE.md          - Quick setup guide"
echo "  API_DOCUMENTATION.md    - API reference"
echo "  PROJECT_SUMMARY.md      - Project overview"
echo ""

# Ask user if they want to start the dev servers
read -p "Start development servers now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🎬 Starting development servers..."
    echo "   Backend: http://localhost:8081"
    echo "   Frontend: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    npm run dev
fi
