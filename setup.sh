#!/bin/bash

# AutoTube Setup Script

set -e

echo "🚀 Setting up AutoTube..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Create storage directories
echo "📁 Creating storage directories..."
mkdir -p storage/{videos,voices,images,thumbnails,previews}

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker is available. Would you like to start the database with Docker?"
    read -p "Start PostgreSQL and Redis with Docker? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose up -d postgres redis
        echo "⏳ Waiting for database to be ready..."
        sleep 5
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL and Redis are running"
echo "2. Update .env with your database URL if needed"
echo "3. Run: npx prisma db push"
echo "4. Run: npm run db:seed (optional, creates demo users)"
echo "5. Run: npm run dev"
echo ""
echo "Demo accounts:"
echo "  Admin: admin@autotube.app / admin123"
echo "  User:  demo@autotube.app / demo123"
