# ⚡ Quick Start - Deploy trong 10 phút

## 🎯 TL;DR - 3 bước siêu nhanh

### 1. **Setup Supabase** (3 phút)
```bash
# Vào https://supabase.com
# Create project > Copy connection string
```

### 2. **Setup Local** (2 phút)
```bash
./scripts/migrate-to-supabase.sh
# Paste connection string > Chọn option 2
npm run dev
```

### 3. **Deploy Vercel** (5 phút)
```bash
git push origin main
# Vào vercel.com > Import > Add env vars > Deploy
```

---

## 📚 Chi tiết

### Option A: Dùng Script Tự động (KHUYẾN NGHỊ) ⚡
```bash
# Chạy 1 script xong mọi thứ
./scripts/migrate-to-supabase.sh
```

Script sẽ:
- ✅ Hỏi Supabase connection string
- ✅ Tự động generate JWT_SECRET
- ✅ Tạo file .env
- ✅ Push schema lên Supabase
- ✅ Seed admin user + sample content

### Option B: Manual Setup
Xem chi tiết trong: **[SUPABASE.md](SUPABASE.md)**

---

## 🎁 FREE Stack

| Service | Free Tier | Đủ cho |
|---------|-----------|--------|
| **Vercel** | 100GB bandwidth/tháng | ~10k visitors |
| **Supabase** | 500MB database | ~1000 members |
| **Total** | **$0/tháng** | Perfect! |

---

## 🔑 Default Credentials

```
Username: admin
Password: Kieuanhduc2722000@
```

⚠️ **QUAN TRỌNG**: Đổi password sau khi deploy!

---

## 📖 More Docs

- **Full Supabase Guide**: [SUPABASE.md](SUPABASE.md)
- **Deployment Guide**: [DEPLOY.md](DEPLOY.md)
- **Main README**: [readme.md](readme.md)

---

Happy coding! 🚀
