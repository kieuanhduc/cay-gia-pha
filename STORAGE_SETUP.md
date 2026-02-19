# 📦 Supabase Storage Setup - Hướng dẫn chi tiết

## 🎯 Tổng quan

Ứng dụng đã được migrate để upload ảnh lên **Supabase Storage** thay vì local filesystem.

**Lợi ích:**
- ✅ Hoạt động trên Vercel production
- ✅ CDN global (nhanh)
- ✅ FREE 1GB storage
- ✅ Tự động backup cùng database

---

## 📋 Setup Storage Bucket (5 phút)

### Bước 1: Tạo Storage Bucket

```bash
1. Vào Supabase Dashboard
2. Click "Storage" trong menu bên trái
3. Click "Create a new bucket"
4. Điền thông tin:
   - Name: members
   - Public bucket: ✅ YES (checked)
   - File size limit: 5 MB
   - Allowed MIME types: image/*
5. Click "Create bucket"
```

### Bước 2: Setup Policies (Cho phép upload/delete)

```bash
# Trong bucket "members":
1. Click tab "Policies"
2. Click "New Policy"
```

#### Policy 1: Allow Upload (INSERT)
```sql
-- Policy name: "Allow authenticated uploads"
-- Allowed operation: INSERT
-- Policy definition:

true  -- Allow all authenticated users
```

Hoặc SQL:
```sql
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'members');
```

#### Policy 2: Allow Read (SELECT)
```sql
-- Policy name: "Public read access"
-- Allowed operation: SELECT
-- Policy definition:

true  -- Allow everyone to read
```

Hoặc SQL:
```sql
CREATE POLICY "Public read access" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'members');
```

#### Policy 3: Allow Delete (DELETE)
```sql
-- Policy name: "Allow authenticated delete"
-- Allowed operation: DELETE
-- Policy definition:

true  -- Allow authenticated users
```

Hoặc SQL:
```sql
CREATE POLICY "Allow authenticated delete" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'members');
```

---

### Bước 3: Get Service Role Key

```bash
1. Supabase Dashboard
2. Settings > API
3. Scroll xuống "Service Role" section
4. Click "Reveal" để show Service Role key
5. Click icon 📋 để copy
```

⚠️ **QUAN TRỌNG**: Service Role key là **SECRET**, không public!

### Bước 4: Update .env

Thêm vào file `.env`:

```env
# ... existing vars ...

# Supabase Storage (Service Role Key)
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
```

### Bước 5: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## ✅ Test Upload

### Test Avatar Upload
```bash
1. npm run dev
2. Login: admin / admin123
3. Vào Admin > Thành viên
4. Click vào một thành viên
5. Upload ảnh đại diện
6. ✔️ Check ảnh hiển thị từ Supabase URL
```

URL sẽ có dạng:
```
https://abcdefgh.supabase.co/storage/v1/object/public/members/avatars/1-1234567890.jpg
```

---

## 🗂️ Folder Structure trong Storage

```
Bucket: members/
├── avatars/
│   ├── 1-1234567890.jpg
│   ├── 2-1234567891.jpg
│   └── ...
├── photos/
│   ├── 1-1234567892.jpg
│   ├── 2-1234567893.jpg
│   └── ...
└── covers/
    ├── post-1-1234567894.jpg
    ├── post-2-1234567895.jpg
    └── ...
```

---

## 🔐 Environment Variables Checklist

Cần có trong `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres.xxx:pass@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Supabase Storage
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."

# JWT
JWT_SECRET="your-secret-key"
```

Và trong **Vercel** khi deploy:
- ✅ Copy tất cả env vars từ .env
- ✅ Đặc biệt là `SUPABASE_SERVICE_KEY`

---

## 🎨 Image Transformations (Bonus)

Supabase Storage hỗ trợ transform ảnh on-the-fly:

```typescript
// Resize image
const url = `${baseUrl}?width=300&height=300`

// Optimize
const url = `${baseUrl}?quality=80`

// Both
const url = `${baseUrl}?width=300&height=300&quality=80`
```

Ví dụ trong component:
```vue
<img 
  :src="`${member.avatarUrl}?width=200&height=200&quality=85`"
  alt="Avatar"
/>
```

---

## 📊 Storage Usage Monitoring

```bash
# Supabase Dashboard > Storage > Settings
→ Xem usage: X MB / 1000 MB
→ Xem số files
→ Xem bandwidth used
```

---

## 🆘 Troubleshooting

### Error: "SUPABASE_SERVICE_KEY is required"
```bash
# Kiểm tra .env
cat .env | grep SUPABASE_SERVICE_KEY

# Nếu thiếu, thêm vào:
echo 'SUPABASE_SERVICE_KEY="your-service-key"' >> .env
```

### Error: "Bucket 'members' not found"
```bash
# Tạo bucket trong Supabase Dashboard
# Storage > New bucket > Name: "members"
# Public: YES
```

### Error: "new row violates row-level security policy"
```bash
# Chưa setup policies
# Xem lại Bước 2 ở trên
```

### Upload slow
```bash
# Do network latency
# Bình thường với Supabase Singapore region
# ~1-2s cho ảnh 1-2MB
```

---

## 🎯 Migration Checklist

- [x] Install @supabase/supabase-js
- [x] Create Supabase client utility
- [x] Update avatar upload API
- [x] Update photos upload API  
- [x] Update cover upload API
- [x] Update photo delete API
- [ ] **TODO: Tạo Storage bucket "members"**
- [ ] **TODO: Setup Storage policies**
- [ ] **TODO: Add SUPABASE_SERVICE_KEY to .env**
- [ ] **TODO: Test upload locally**
- [ ] **TODO: Add to Vercel env vars khi deploy**

---

## 📚 Resources

- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
- **Storage Policies**: https://supabase.com/docs/guides/storage/security/access-control
- **Image Transformations**: https://supabase.com/docs/guides/storage/serving/image-transformations

---

Happy uploading! 📸
