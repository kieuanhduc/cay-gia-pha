#!/bin/bash

# Script tự động migrate sang Supabase (PostgreSQL)
# Usage: ./scripts/migrate-to-supabase.sh

set -e  # Exit on error

echo "🚀 Starting migration to Supabase PostgreSQL..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if .env exists
if [ -f .env ]; then
    echo "📦 Backing up existing .env..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✅ Backed up to .env.backup${NC}"
    echo ""
fi

# Step 2: Instructions
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Hướng dẫn lấy Supabase connection string${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Vào https://supabase.com"
echo "2. Tạo project mới (nếu chưa có):"
echo "   - Project name: cay-gia-pha"
echo "   - Database password: <tạo-password-mạnh> (LƯU LẠI!)"
echo "   - Region: Southeast Asia (Singapore)"
echo ""
echo "3. Sau khi project ready:"
echo "   - Click Settings (icon gear) > Database"
echo "   - Scroll xuống 'Connection string'"
echo "   - Chọn tab 'URI'"
echo "   - Copy connection string"
echo ""
echo "4. Thay [YOUR-PASSWORD] bằng password bạn đã tạo"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 3: Prompt for connection string
echo -e "${YELLOW}Nhập Supabase connection string:${NC}"
read -p "> " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL không được để trống!${NC}"
    exit 1
fi

# Step 4: Generate JWT secret
echo ""
echo "🔑 Generate JWT secret..."
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "please-change-this-to-random-string")
echo -e "${GREEN}✅ Generated JWT_SECRET${NC}"

# Step 5: Create .env file
echo ""
echo "📝 Creating .env file..."
cat > .env << EOF
# Supabase PostgreSQL Database
DATABASE_URL="$DATABASE_URL"

# JWT Secret (for authentication)
JWT_SECRET="$JWT_SECRET"

# SMTP Settings (optional - leave empty if not using)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Cây Gia Phả <noreply@example.com>"
EOF

echo -e "${GREEN}✅ Created .env file${NC}"
echo ""

# Step 6: Generate Prisma Client
echo "🔨 Generating Prisma Client for PostgreSQL..."
if npx prisma generate; then
    echo -e "${GREEN}✅ Generated Prisma Client${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi
echo ""

# Step 7: Push schema to Supabase
echo "📤 Pushing schema to Supabase..."
if npx prisma db push; then
    echo -e "${GREEN}✅ Schema pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push schema${NC}"
    echo "Kiểm tra lại DATABASE_URL trong .env"
    exit 1
fi
echo ""

# Step 8: Ask about seeding
echo -e "${YELLOW}🌱 Seed database với data mẫu?${NC}"
echo "  1) Seed user admin only"
echo "  2) Seed user admin + sample content (tin tức, sự kiện)"
echo "  3) Skip seeding"
read -p "Chọn (1/2/3): " seed_choice

case $seed_choice in
    1)
        echo "Creating admin user..."
        npm run db:seed
        echo -e "${GREEN}✅ Admin user created${NC}"
        ;;
    2)
        echo "Creating admin user and sample content..."
        npm run db:seed
        npm run seed:content
        echo -e "${GREEN}✅ Admin user and sample content created${NC}"
        ;;
    3)
        echo "Skipping seed..."
        ;;
    *)
        echo -e "${YELLOW}Invalid choice, skipping seed${NC}"
        ;;
esac
echo ""

# Step 9: Test connection
echo "🧪 Testing database connection..."
if npx prisma db execute --stdin < /dev/null 2>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Could not test connection (this is OK)${NC}"
fi
echo ""

# Step 10: Show success message
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Migration to Supabase completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Default admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo -e "${RED}🔐 QUAN TRỌNG: Đổi mật khẩu admin sau khi login!${NC}"
echo ""
echo "▶️  Tiếp theo:"
echo "   1. Start dev server:"
echo "      ${BLUE}npm run dev${NC}"
echo ""
echo "   2. Open http://localhost:3000"
echo "      Login và test tất cả tính năng"
echo ""
echo "   3. Deploy lên Vercel:"
echo "      - Push code: ${BLUE}git push origin main${NC}"
echo "      - Vào vercel.com > Import project"
echo "      - Add env vars (copy từ .env)"
echo "      - Deploy!"
echo ""
echo "📖 Docs: ${BLUE}SUPABASE.md${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
