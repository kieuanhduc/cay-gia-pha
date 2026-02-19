# 🚀 Deploy với Supabase (PostgreSQL)

## TL;DR - 3 bước siêu nhanh (5 phút)

### 1️⃣ Tạo Supabase Project
```bash
# 1. Vào https://supabase.com (FREE, không cần credit card)
# 2. Sign up > Create new project
# 3. Project name: "cay-gia-pha"
# 4. Database password: Tạo password mạnh (save lại) @XZPAt9?saHJrmd
# 5. Region: Southeast Asia (Singapore)
# 6. Wait 2 phút để project khởi tạo
```

### 2️⃣ Setup Local & Migrate
```bash
# Chạy script tự động
./scripts/migrate-to-supabase.sh
# Script sẽ tự động:
# - Copy connection string từ Supabase
# - Update .env
# - Push schema
# - Seed data
```

### 3️⃣ Deploy Vercel
```bash
git push origin main
# Vào vercel.com > Import project
# Add env vars > Deploy!
```

---

## 📋 Chi tiết từng bước

### Bước 1: Tạo Supabase Project (2 phút)

#### 1.1. Đăng ký & Tạo project
```bash
1. Truy cập: https://supabase.com
2. Click "Start your project" (Free tier)
3. Sign up with GitHub/Google/Email
4. Click "New project"
```

#### 1.2. Cấu hình project
```
Project name: cay-gia-pha
Database password: <tạo-password-mạnh>  # LƯU LẠI!
Region: Southeast Asia (Singapore)
Pricing Plan: Free (mặc định)
```

#### 1.3. Lấy connection strings
```bash
# Sau khi project ready (2 phút):
# 1. Click Settings (icon gear) > Database
# 2. Scroll xuống "Connection string"
# 3. Copy 2 strings:

# Connection pooling (for Prisma)
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

⚠️ **Quan trọng**: Thay `[YOUR-PASSWORD]` bằng password bạn tạo ở bước 1.2!

---

### Bước 2: Setup Local (3 phút)

#### 2.1. Backup database cũ (nếu có)
```bash
# Nếu đang dùng MySQL local
mysqldump -u root -p cay_gia_pha > backup_$(date +%Y%m%d).sql
```

#### 2.2. Update .env
```bash
# Copy template
cp env.supabase.template .env

# Hoặc tạo .env mới:
cat > .env << 'EOF'
# Supabase Database (Connection Pooling)
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Supabase Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this"

# SMTP (optional)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="Cây Gia Phả <noreply@example.com>"
EOF
```

#### 2.3. Generate Prisma Client
```bash
npx prisma generate
```

#### 2.4. Push schema to Supabase
```bash
# Push schema (sử dụng DIRECT_URL)
npx prisma db push

# Output:
# ✔ Generated Prisma Client
# ✔ The database is now in sync with your Prisma schema
```

#### 2.5. Seed data
```bash
# Tạo user admin
npm run db:seed

# Tạo sample content
npm run seed:content
```

---

### Bước 3: Test Local (1 phút)

```bash
# Start dev server
npm run dev

# Test:
# ✅ Login với admin/admin123
# ✅ Tạo dòng họ
# ✅ Thêm thành viên
# ✅ Upload ảnh
```

---

### Bước 4: Deploy Vercel (5 phút)

#### 4.1. Push code
```bash
git add .
git commit -m "feat: migrate to Supabase PostgreSQL"
git push origin main
```

#### 4.2. Import vào Vercel
```
1. Vào https://vercel.com
2. Click "Add New Project"
3. Import repository từ GitHub
4. Framework: Nuxt.js (auto-detect)
```

#### 4.3. Environment Variables
Trong Vercel Project Settings > Environment Variables:

```bash
# Database (Connection Pooling)
DATABASE_URL = postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Direct Connection (for migrations - optional)
DIRECT_URL = postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# JWT Secret (tạo random: openssl rand -base64 32)
JWT_SECRET = <random-secret-key>

# SMTP (nếu có)
SMTP_HOST = 
SMTP_PORT = 587
SMTP_USER = 
SMTP_PASS = 
```

#### 4.4. Deploy
```
Click "Deploy"
Wait 2-3 phút
✅ Live!
```

---

## 🎁 Bonus Features với Supabase

### 1. **Supabase Dashboard**
```
Settings > Database > Tables
→ Xem trực tiếp tables, data
→ Run SQL queries
→ Monitor performance
```

### 2. **Auto Backups**
```
Database > Backups
→ Daily backups (FREE plan)
→ Point-in-time recovery
```

### 3. **PostgreSQL Extensions**
```sql
-- Enable extensions nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Full-text search
```

### 4. **Database Migrations**
```bash
# Với Prisma
npx prisma migrate dev --name init
npx prisma migrate deploy  # Production
```

---

## ✅ Verification Checklist

- [ ] Project created trên Supabase
- [ ] Connection strings copied
- [ ] .env updated
- [ ] `npx prisma db push` thành công
- [ ] Seed data completed
- [ ] Test local works
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Production site works
- [ ] Changed admin password

---

## 📊 Supabase Free Tier

**FREE Forever includes:**
- ✅ **500 MB** database storage
- ✅ **1 GB** file storage
- ✅ **2 GB** bandwidth/tháng
- ✅ **50,000** monthly active users
- ✅ **500 MB** Edge Functions
- ✅ **Unlimited** API requests
- ✅ **Daily** backups (7 days retention)
- ✅ **Community** support

→ Đủ cho ~**500-1000 members** trong gia phả!

---

## 🔐 Security Best Practices

### 1. Row Level Security (RLS)
```sql
-- Supabase có RLS built-in
-- Nhưng app này dùng JWT auth nên không cần enable RLS
```

### 2. Environment Variables
```bash
# KHÔNG commit .env vào Git
# Đã có .gitignore

# Verify:
git status  # .env không xuất hiện
```

### 3. Database Password
```bash
# Đổi password trong Supabase Dashboard:
# Settings > Database > Database Password > Reset
```

### 4. API Keys
```bash
# Supabase cung cấp:
# - anon key (public)
# - service_role key (secret - KHÔNG dùng client-side)

# App này dùng JWT auth riêng, không cần Supabase Auth
```

---

## 🆘 Troubleshooting

### Error: "Can't reach database"
```bash
# Check connection strings
cat .env | grep DATABASE_URL

# Test connection
npx prisma db execute --stdin < /dev/null
```

### Error: "SSL required"
```bash
# Supabase requires SSL
# Connection string phải có: ?sslmode=require
# Đã included trong template
```

### Vercel build fails
```bash
# 1. Check env vars
# 2. Ensure DATABASE_URL format đúng
# 3. Check build logs
# 4. Try: vercel env pull .env.local
```

### Slow queries
```sql
-- Enable pg_stat_statements
-- Dashboard > Database > Extensions > pg_stat_statements

-- View slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

---

## 🎯 Next Steps

### 1. **Optimize Indexes**
```sql
-- Prisma tự tạo indexes
-- Check trong Supabase Dashboard > Database > Indexes
```

### 2. **Setup File Storage**
```bash
# Option A: Supabase Storage (FREE 1GB)
# Settings > Storage > Create bucket

# Option B: Cloudinary (FREE 25 credits)
# https://cloudinary.com
```

### 3. **Monitor Performance**
```
Dashboard > Reports
→ Database health
→ API usage
→ Slow queries
```

### 4. **Backup Strategy**
```bash
# Auto backups: 7 days retention (FREE)
# Manual backup:
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_$(date +%Y%m%d).sql
```

---

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Prisma + Supabase**: https://www.prisma.io/docs/guides/database/supabase
- **Vercel Docs**: https://vercel.com/docs
- **Migration Script**: `scripts/migrate-to-supabase.sh`

---

## 💡 Pro Tips

### 1. **Connection Pooling**
```
Supabase cung cấp 2 connection strings:
- Pooled (port 6543): Dùng cho app
- Direct (port 5432): Dùng cho migrations

→ App đã config đúng trong schema.prisma
```

### 2. **Performance**
```
- Enable pg_trgm cho full-text search
- Use connection pooling
- Index foreign keys (đã có)
```

### 3. **Cost Optimization**
```
Free tier rất generous
Chỉ cần upgrade khi:
- > 500MB database
- > 50k active users/tháng
- Cần longer backup retention
```

---

Happy coding with Supabase! 🎉
