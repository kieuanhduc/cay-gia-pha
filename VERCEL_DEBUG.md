# 🔍 Debug Vercel Deployment Issues

## ❌ Error: 500 Server Error khi login

### Nguyên nhân thường gặp:

1. ❌ Environment variables thiếu hoặc sai
2. ❌ DATABASE_URL không kết nối được
3. ❌ JWT_SECRET thiếu
4. ❌ Prisma Client chưa được generate

---

## ✅ Checklist Fix (làm theo thứ tự):

### 1. **Verify Environment Variables**

```bash
# Vào Vercel Dashboard:
Project > Settings > Environment Variables

# Phải có ĐẦY ĐỦ 3 biến này:
```

#### Required:
```env
DATABASE_URL
├─ Value: postgresql://postgres.xxx:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
├─ Environment: Production, Preview, Development (check tất cả)
└─ ⚠️ KHÔNG có khoảng trắng hoặc xuống dòng!

JWT_SECRET
├─ Value: your-random-secret-key-here
├─ Environment: Production, Preview, Development
└─ ⚠️ Phải giống với local!

SUPABASE_SERVICE_KEY
├─ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
├─ Environment: Production, Preview, Development
└─ ⚠️ Service Role key từ Supabase
```

---

### 2. **Check Vercel Function Logs**

```bash
# Vào Vercel Dashboard:
Project > Deployments > Latest deployment > Function Logs

# Hoặc dùng CLI:
npx vercel logs --follow

# Tìm errors liên quan đến:
- "Can't reach database"
- "JWT"
- "Prisma"
```

---

### 3. **Test Database Connection**

```bash
# Trong Vercel Dashboard > Deployments > Latest
# Click "..." > "View Function Logs"
# Tìm errors có keyword: "database", "prisma", "P1001"

# Common errors:
- P1001: Can't reach database → DATABASE_URL sai
- P1012: Prisma schema invalid → Build issue
- Invalid credentials → Password sai
```

---

### 4. **Redeploy với Force**

```bash
# Option A: From Vercel Dashboard
Deployments > Latest > "..." > Redeploy

# Option B: Empty commit
git commit --allow-empty -m "fix: redeploy with correct env"
git push origin main
```

---

## 🔧 Common Fixes:

### Fix 1: DATABASE_URL có khoảng trắng

```bash
# SAI:
DATABASE_URL = "postgresql://... "
                              ↑ khoảng trắng

# ĐÚNG:
DATABASE_URL="postgresql://..."
```

### Fix 2: Missing JWT_SECRET

```bash
# Add trong Vercel env vars
JWT_SECRET="random-secret-key-at-least-32-chars"

# Generate mới:
openssl rand -base64 32
```

### Fix 3: Prisma Client không sync

```bash
# Add postbuild script trong package.json
{
  "scripts": {
    "postbuild": "prisma generate"
  }
}
```

### Fix 4: Cookie sameSite issue

```bash
# Đã fix trong login.post.ts:
sameSite: isProduction ? 'strict' : 'lax'
```

---

## 🧪 Test Checklist:

Sau khi fix, test theo thứ tự:

- [ ] Vercel deployment thành công (green checkmark)
- [ ] Function logs không có errors
- [ ] Trang chủ load được
- [ ] API health check: https://your-app.vercel.app/api/auth/me
  - Nếu chưa login: 401 "Chưa đăng nhập" ✓
  - Nếu đã login: Return user info ✓
- [ ] Login form submit được
- [ ] Sau login, redirect về trang chủ
- [ ] Cookie được set (check DevTools > Application > Cookies)
- [ ] Các trang admin load được

---

## 🆘 Still not working?

### Debug Steps:

1. **Local vs Production Env Diff**
```bash
# Compare local .env với Vercel env vars
# Đảm bảo DATABASE_URL y hệt nhau
```

2. **Test API directly**
```bash
# Test login API
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt \
  -v

# Check response headers có Set-Cookie không
```

3. **Check Supabase Connection**
```bash
# Verify Supabase database accessible
# Supabase > Project > Settings > Database
# Ensure not paused/sleeping
```

4. **Prisma Client Version**
```bash
# Ensure Prisma Client generated during build
# Check build logs trong Vercel
# Tìm dòng: "Generated Prisma Client"
```

---

## 💡 Quick Fix Summary:

```bash
# 1. Copy .env values CHÍNH XÁC vào Vercel
# 2. Ensure DATABASE_URL không có typo
# 3. Ensure JWT_SECRET giống local
# 4. Add SUPABASE_SERVICE_KEY
# 5. Redeploy
# 6. Check logs
```

---

Bạn:
1. **Screenshot Environment Variables** trong Vercel (hide sensitive values)
2. **Copy function logs** khi login fail
3. Cho tôi xem để debug cụ thể hơn! 🔍