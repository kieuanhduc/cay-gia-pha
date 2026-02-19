# ⚡ Quick Setup - Supabase Storage (3 phút)

## 🚀 3 bước nhanh:

### 1️⃣ Tạo Storage Bucket (1 phút)

```
Supabase Dashboard
→ Click "Storage" (menu trái)
→ Click "New bucket"
→ Name: members
→ Public: ✅ YES
→ Create bucket
```

### 2️⃣ Setup Policies (1 phút)

```
Trong bucket "members"
→ Tab "Policies"  
→ Click "New policy"
→ Template: "Allow all operations for authenticated users only"
→ Use this policy
```

Hoặc manual:
```sql
-- Allow uploads
CREATE POLICY "uploads" ON storage.objects 
FOR ALL TO authenticated 
USING (bucket_id = 'members');

-- Allow public read
CREATE POLICY "public_read" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'members');
```

### 3️⃣ Add Service Key to .env (1 phút)

```bash
# 1. Supabase > Settings > API
# 2. Scroll to "Service Role" 
# 3. Click "Reveal" > Copy key

# 4. Add to .env:
echo 'SUPABASE_SERVICE_KEY="eyJhbGci..."' >> .env

# 5. Restart server
npm run dev
```

---

## ✅ Test Upload

```
1. Login: admin / Kieuanhduc2722000@
2. Admin > Thành viên > Click member
3. Upload avatar
4. ✔️ Ảnh sẽ upload lên Supabase!
```

URL format:
```
https://xxx.supabase.co/storage/v1/object/public/members/avatars/1-xxx.jpg
```

---

## 🔑 Get Service Role Key

**Screenshot guide:**

```
Supabase Dashboard
├── Settings (⚙️ icon, góc dưới trái)
│   └── API
│       └── "Project API keys"
│           └── "service_role" section
│               └── Click "Reveal"
│               └── Click 📋 Copy
```

---

## 🎁 Xong rồi!

Upload ảnh giờ sẽ:
- ✅ Lưu trên Supabase Storage
- ✅ CDN global (fast)
- ✅ Hoạt động trên Vercel
- ✅ Tự động optimize

Chi tiết: Xem **STORAGE_SETUP.md**

---

Happy uploading! 📸
