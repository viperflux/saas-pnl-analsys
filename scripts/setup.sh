#!/bin/bash

# SaaS Cash Flow & P&L Analyzer - Production Setup Script
set -e

echo "🚀 Setting up SaaS Cash Flow & P&L Analyzer for production..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure your database URL:"
    echo "cp .env.example .env"
    echo "Then edit .env with your PostgreSQL connection string."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env; then
    echo "❌ DATABASE_URL not found in .env file!"
    echo "Please add your PostgreSQL connection string to .env file."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Setting up database..."
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

echo "🏗️ Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start the production server: npm start"
echo "2. Or use PM2 for process management: pm2 start npm --name 'pnl-analyzer' -- start"
echo "3. Access your app at http://localhost:3000"
echo ""
echo "💡 Tips:"
echo "- Use a reverse proxy (nginx) for SSL and custom domain"
echo "- Consider using PM2 for auto-restart and monitoring"
echo "- Set up automatic backups for your PostgreSQL database"
echo ""
echo "📚 Database providers we recommend:"
echo "- Neon (https://neon.tech) - Free tier available"
echo "- Supabase (https://supabase.com) - Free tier available"
echo "- Railway (https://railway.app) - Simple deployment"