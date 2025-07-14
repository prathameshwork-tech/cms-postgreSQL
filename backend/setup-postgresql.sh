#!/bin/bash

echo "🚀 Setting up PostgreSQL for CMS Migration..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
else
    echo "✅ PostgreSQL is already installed"
fi

# Start PostgreSQL service
echo "🔧 Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
echo "🗄️ Setting up database and user..."
sudo -u postgres psql -c "CREATE DATABASE cms_db;" 2>/dev/null || echo "Database cms_db already exists"
sudo -u postgres psql -c "CREATE DATABASE cms_test_db;" 2>/dev/null || echo "Database cms_test_db already exists"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null || echo "Password already set"

echo "✅ PostgreSQL setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with PostgreSQL credentials:"
echo "   DB_USER=postgres"
echo "   DB_PASSWORD=postgres"
echo "   DB_NAME=cms_db"
echo "   DB_HOST=127.0.0.1"
echo "   DB_PORT=5432"
echo ""
echo "2. Run database migrations:"
echo "   npm run db:migrate"
echo ""
echo "3. Seed the database:"
echo "   npm run db:seed"
echo ""
echo "4. Start the server:"
echo "   npm run dev" 