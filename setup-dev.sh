#!/bin/bash

# HOTNOTCLUB Development Environment Setup Script

echo "🔥 HOTNOTCLUB Development Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ npm $(npm --version)${NC}"
echo ""

# Create backend .env file
echo "Setting up backend environment..."

if [ ! -f "backend/.env" ]; then
    cat > backend/.env << 'EOF'
# Server
PORT=3000
NODE_ENV=development

# Database (Supabase) - REPLACE WITH YOUR VALUES
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase - REPLACE WITH YOUR VALUES
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Stripe - REPLACE WITH YOUR TEST KEYS
STRIPE_SECRET_KEY=sk_test_[YOUR-SECRET-KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR-WEBHOOK-SECRET]
STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR-PUBLISHABLE-KEY]

# Storage
SUPABASE_STORAGE_BUCKET=competition-photos

# App URLs
FRONTEND_URL=http://localhost:8081
BACKEND_URL=http://localhost:3000

# Competition Settings
ENTRY_PRICE_ONE_TIME=1.99
ENTRY_PRICE_SUBSCRIPTION=1.50
JACKPOT_PERCENTAGE=0.5
EOF
    echo -e "${YELLOW}⚠️  Created backend/.env - YOU MUST UPDATE IT WITH YOUR CREDENTIALS${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Create mobile .env file
echo "Setting up mobile environment..."

if [ ! -f "mobile/.env" ]; then
    cat > mobile/.env << 'EOF'
# Supabase - REPLACE WITH YOUR VALUES
EXPO_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# Backend API
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EOF
    echo -e "${YELLOW}⚠️  Created mobile/.env - YOU MUST UPDATE IT WITH YOUR CREDENTIALS${NC}"
else
    echo -e "${GREEN}✓ mobile/.env already exists${NC}"
fi

echo ""
echo -e "${GREEN}✓ Environment files created!${NC}"
echo ""

# Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  CREATE SUPABASE PROJECT"
echo "   • Go to https://supabase.com/dashboard"
echo "   • Create a new project"
echo "   • Go to Settings > API to get your keys"
echo "   • Go to Settings > Database to get your connection string"
echo ""
echo "2️⃣  UPDATE ENVIRONMENT VARIABLES"
echo "   • Edit backend/.env with your Supabase credentials"
echo "   • Edit mobile/.env with your Supabase credentials"
echo ""
echo "3️⃣  CREATE STRIPE TEST ACCOUNT"
echo "   • Go to https://dashboard.stripe.com/register"
echo "   • Toggle 'Test mode' in the dashboard"
echo "   • Go to Developers > API keys to get your test keys"
echo "   • Update backend/.env with your Stripe test keys"
echo ""
echo "4️⃣  INITIALIZE DATABASE"
echo "   • Run: cd backend && npm run db:push"
echo ""
echo "5️⃣  START DEVELOPMENT SERVERS"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd mobile && npm start"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📝 For detailed instructions, see README.md${NC}"
echo ""
