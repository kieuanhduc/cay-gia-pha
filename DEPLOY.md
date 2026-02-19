# 🚀 Deployment Guide - Vercel + Supabase (100% FREE)

## 📋 Quick Summary

**Stack:**
- **Frontend + API**: Vercel (FREE)
- **Database**: Supabase PostgreSQL (FREE - 500MB)
- **Total Cost**: **$0/tháng** 🎉

**Giới hạn FREE tier:**
- Vercel: 100GB bandwidth/tháng (~10k visitors)
- Supabase: 500MB database (~500-1000 members)

---

## 🚀 Deployment Steps

### Step 1: Setup Supabase (3 phút)

#### 1.1. Tạo project
```bash
1. Vào https://supabase.com
2. Sign up (FREE - no credit card)
3. New project:
   - Name: cay-gia-pha
   - Password: <tạo-password-mạnh> (SAVE IT!)
   - Region: Southeast Asia (Singapore)
4. Wait 2 minutes...
```

#### 1.2. Get connection string
```bash
Settings > Database > Connection string
Tab: URI
Copy: postgresql://postgres.[ref]:[YOUR-PASSWORD]@...
```

#### 1.3. Push schema & seed
```bash
# Local setup
cp env.supabase.template .env
# Edit .env: paste connection string

# Migrate
npx prisma db push

# Seed data
npm run db:seed
npm run seed:content

# Test local
npm run dev
```

---

### Step 2: Push to GitHub (1 phút)

```bash
git add .
git commit -m "feat: ready for production with Supabase"
git push origin main
```

---

### Step 3: Deploy to Vercel (5 phút)

#### 3.1. Import project
```
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import "cay-gia-pha" repository
5. Framework: Nuxt.js (auto-detected)
```

#### 3.2. Configure Environment Variables

Click "Environment Variables" và thêm:

```bash
# Database
DATABASE_URL = postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# JWT Secret (generate: openssl rand -base64 32)
JWT_SECRET = <your-random-secret-key>

# SMTP (Optional - leave empty if not using email)
SMTP_HOST = 
SMTP_PORT = 587
SMTP_USER = 
SMTP_PASS = 
SMTP_FROM = Cây Gia Phả <noreply@example.com>
```

⚠️ **Lưu ý**: Dùng connection string có **port 6543** (connection pooling)

#### 3.3. Deploy!
```
Click "Deploy"
Wait 2-3 minutes...
✅ Your app is live!
```

---

## ✅ Post-Deployment Checklist

### Security
- [ ] Đăng nhập vào production site
- [ ] Đổi password admin (từ `admin123` sang password mạnh)
- [ ] Xóa hoặc disable user test
- [ ] Enable 2FA cho Supabase account
- [ ] Enable 2FA cho Vercel account

### Testing
- [ ] Test login/logout
- [ ] Tạo dòng họ mới
- [ ] Thêm thành viên
- [ ] Upload ảnh đại diện
- [ ] Test trên mobile
- [ ] Test các API endpoints
- [ ] Xem tin tức/sự kiện
- [ ] Test form liên hệ

### Optimization
- [ ] Enable Vercel Analytics (free)
- [ ] Check Supabase performance
- [ ] Optimize images (nếu có)
- [ ] Test loading speed

---

## 🔧 Useful Commands

### Vercel CLI
```bash
# Install
npm i -g vercel

# Login
vercel login

# Deploy from terminal
vercel

# Pull env vars
vercel env pull .env.local

# View logs
vercel logs
```

### Database Management
```bash
# View schema
npx prisma studio

# Backup (from local)
pg_dump -h aws-0-ap-southeast-1.pooler.supabase.com \
  -U postgres.[ref] \
  -d postgres \
  -f backup.sql

# Restore
psql -h aws-0-ap-southeast-1.pooler.supabase.com \
  -U postgres.[ref] \
  -d postgres \
  -f backup.sql
```

---

## 🌐 Custom Domain (Optional)

### Setup với Vercel
```bash
1. Vercel Dashboard > Project > Settings > Domains
2. Add domain: giapha.yourdomain.com
3. Update DNS records (theo hướng dẫn Vercel):
   - Type: A
   - Name: giapha
   - Value: 76.76.21.21
4. Wait for propagation (5-30 phút)
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics (FREE)
```
Project Settings > Analytics
Enable: Web Analytics
→ See visitors, pageviews, performance
```

### Supabase Monitoring
```
Dashboard > Reports
→ Database health
→ API usage
→ Active connections
```

---

## 🆘 Troubleshooting

### Build fails on Vercel
```bash
# 1. Check build logs
# 2. Verify env vars
# 3. Test build locally:
npm run build

# 4. Check Node version (Vercel uses 18.x)
node -v
```

### Database connection timeout
```bash
# 1. Check DATABASE_URL format
# 2. Ensure using pooling port (6543)
# 3. Check Supabase project status
# 4. Increase timeout in vercel.json
```

### 500 Internal Server Error
```bash
# 1. Check Vercel Function logs
# 2. Verify all env vars set
# 3. Check database connection
# 4. Look for missing dependencies
```

---

## 💡 Pro Tips

### 1. Preview Deployments
```bash
# Mỗi Pull Request tự động tạo preview
# Test trước khi merge vào main
```

### 2. Edge Functions
```bash
# Vercel Edge Functions: Nhanh hơn serverless
# Nếu cần, add vercel.json:
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 3. Cache Control
```bash
# Add headers cho static assets
# nuxt.config.ts:
export default defineNuxtConfig({
  nitro: {
    compressPublicAssets: true,
  }
})
```

### 4. Database Connection Pooling
```bash
# Supabase pooling URL (port 6543):
# ✅ Dùng cho production
# ✅ Tránh "too many connections"

# Direct URL (port 5432):
# ⚠️ Chỉ dùng cho migrations
```

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Nuxt Deployment**: https://nuxt.com/deploy/vercel
- **Prisma + Supabase**: https://www.prisma.io/docs/guides/database/supabase

---

## 🎯 Next Steps

1. **Setup monitoring**: Vercel Analytics, Sentry
2. **Setup CDN**: Cloudinary cho images
3. **Add sitemap**: SEO optimization
4. **Setup email**: Resend.com (free 100 emails/day)
5. **Add error tracking**: Sentry (free tier)

---

Happy deploying! 🚀
