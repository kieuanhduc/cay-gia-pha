# Cây Gia Phả - Ứng dụng Quản lý Gia phả

Ứng dụng web quản lý cây gia phả trực tuyến, được xây dựng với Nuxt 3, hỗ trợ trực quan hóa cây gia phả bằng D3.js.

## Công nghệ sử dụng

- **Frontend:** Nuxt 3, Vue 3, Tailwind CSS, D3.js
- **Backend:** Nitro Server (Nuxt built-in)
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** JWT (HTTP-only cookie)
- **Icons:** Phosphor Icons (@nuxt/icon)
- **Deployment:** Vercel (Free tier)

## Yêu cầu hệ thống

### Development:
- **Node.js** >= 18
- **npm** (đi kèm Node.js)

### Production:
- **Supabase** account (FREE - https://supabase.com)
- **Vercel** account (FREE - https://vercel.com)

## Hướng dẫn cài đặt từng bước

### Bước 1: Clone project

```bash
git clone <repository-url>
cd cay-gia-pha
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

Lệnh này sẽ tự động chạy `nuxt prepare` và `prisma generate` sau khi cài xong (postinstall).

### Bước 3: Setup Database với Supabase (FREE)

#### 3.1. Tạo Supabase Project (2 phút)
```bash
# 1. Vào https://supabase.com
# 2. Sign up (FREE, không cần credit card)
# 3. Create new project:
#    - Name: cay-gia-pha
#    - Database password: <tạo-password-mạnh> (LƯU LẠI!)
#    - Region: Southeast Asia (Singapore)
# 4. Chờ 2 phút để project khởi tạo
```

#### 3.2. Lấy connection string
```bash
# Trong Supabase Dashboard:
# Settings > Database > Connection string > URI
# Copy và thay [YOUR-PASSWORD] bằng password của bạn
```

#### 3.3. Tạo file .env
```bash
# Copy template
cp env.supabase.template .env

# Edit .env và paste connection string
```

Nội dung file `.env`:

```env
DATABASE_URL="postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
JWT_SECRET="change-this-to-a-strong-secret"
```

- `DATABASE_URL`: Connection string PostgreSQL từ Supabase
- `JWT_SECRET`: Khóa bí mật để tạo JWT token (generate: `openssl rand -base64 32`)

### Bước 4: Migrate database schema

```bash
# Push schema lên Supabase
npx prisma db push
```

Lệnh này sẽ tạo tất cả bảng trong Supabase PostgreSQL theo schema định nghĩa trong `prisma/schema.prisma`.

### Bước 5: Tạo dữ liệu mẫu

```bash
npm run db:seed
```

Seed sẽ tạo:
- Tài khoản admin: **Username:** `admin`, **Password:** `admin123`

Tạo sample content (tin tức, sự kiện, giới thiệu):
```bash
npm run seed:content
```

### Bước 6: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

### ⚡ Quick Start - Dùng script tự động

```bash
# Chạy script migration tự động
./scripts/migrate-to-supabase.sh
# Nhập connection string từ Supabase
# Chọn option 2 (seed admin + content)
# Done!
```

### Tóm tắt toàn bộ lệnh (Manual)

```bash
# Clone & install
git clone <repository-url>
cd cay-gia-pha
npm install

# Setup Supabase (xem bước 3 ở trên)
cp env.supabase.template .env
# Edit .env với connection string

# Migrate & seed
npx prisma db push
npm run db:seed
npm run seed:content

# Run
npm run dev
```

## Các lệnh hữu ích

| Lệnh | Mô tả |
|-------|--------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build production |
| `npm run db:migrate` | Chạy Prisma migration |
| `npm run db:seed` | Seed dữ liệu mẫu |
| `npx prisma studio` | Mở Prisma Studio (GUI xem database) |
| `docker compose up -d` | Khởi động MySQL |
| `docker compose down` | Dừng MySQL |
| `docker compose down -v` | Dừng MySQL + xóa dữ liệu |

## Tính năng

### Cây gia phả tương tác

- Trực quan hóa cây gia phả dạng sơ đồ với D3.js (hỗ trợ dọc/ngang)
- Zoom in/out, kéo thả, tự động căn chỉnh vừa màn hình
- Tìm kiếm thành viên trực tiếp trên cây với highlight và di chuyển đến vị trí
- Click vào thành viên để xem chi tiết trong panel bên cạnh
- Tìm mối quan hệ giữa hai thành viên bất kỳ

### Quản lý dòng họ

- Tạo và quản lý nhiều dòng họ riêng biệt
- Thông tin dòng họ: tên, mô tả, quê quán gốc
- Hiển thị số lượng thành viên mỗi dòng họ

### Quản lý thành viên

- Thêm, sửa, xóa thành viên với đầy đủ thông tin (họ tên, giới tính, ngày sinh/mất, nơi sinh, tiểu sử)
- Upload ảnh đại diện (tối đa 2MB)
- Quản lý quan hệ cha - con, mẹ, vợ/chồng
- Tự động tính số đời (thế hệ) và thứ tự trong gia đình
- Vợ/chồng hiển thị bên cạnh thành viên trên cây (không tạo nhánh riêng)

### Thư viện ảnh

- Upload nhiều ảnh cho mỗi thành viên
- Thêm chú thích và ngày cho từng ảnh
- Sắp xếp thứ tự ảnh tùy chỉnh
- Xem ảnh phóng to (lightbox)

### Lịch sử phiên bản

- Ghi lại mọi thay đổi thông tin thành viên
- Xem các phiên bản trước của dữ liệu
- Khôi phục về phiên bản cũ khi cần

### Ngày giỗ (Âm lịch)

- Quản lý ngày giỗ theo lịch âm (ngày/tháng)
- Tự do nhập tên và ngày giỗ (không bắt buộc liên kết thành viên)
- Lọc theo dòng họ và tháng âm lịch
- Widget hiển thị ngày giỗ sắp tới trên trang quản trị

### Chia sẻ công khai

- Tạo link chia sẻ cây gia phả với token riêng
- Bảo vệ link bằng mật khẩu (tùy chọn)
- Nút chia sẻ nhanh trực tiếp trên trang cây
- Người xem qua link có thể click xem chi tiết thành viên
- Ghi log admin/editor nào đã bật chia sẻ

### Theo dõi lượt xem chia sẻ

- Log lại mỗi lượt truy cập qua link chia sẻ
- Thống kê: địa chỉ IP, thiết bị/trình duyệt, nguồn truy cập, thời gian
- Xem lượt xem gần đây ngay trong dialog chia sẻ
- Trang quản trị riêng cho lượt xem chia sẻ

### Phân quyền tài khoản

- **Admin:** Xem và quản lý tất cả dòng họ
- **Editor:** Chỉ xem và chỉnh sửa dòng họ được admin gán
- **Viewer:** Chỉ xem dòng họ được gán
- Khách (chưa đăng nhập): Xem trang chủ, tin tức, sự kiện. Cần login để xem cây gia phả
- Gán quyền xem gia phả cho từng tài khoản qua giao diện quản trị

### Quản lý tài khoản

- Tạo, sửa, xóa tài khoản người dùng
- Phân vai trò (admin, editor, viewer)
- Gán dòng họ được phép xem cho mỗi tài khoản

### Tìm kiếm nâng cao

- Tìm kiếm thành viên trên toàn bộ dòng họ
- Lọc theo nhiều tiêu chí: giới tính, số đời, năm sinh, nơi sinh, còn sống/đã mất, dòng họ
- Phân trang kết quả tìm kiếm

### Thống kê

- Tổng số thành viên, phân bố theo đời
- Tỷ lệ giới tính (nam/nữ)
- Biểu đồ phân bố tuổi
- Biểu đồ thành viên theo dòng họ
- Thống kê còn sống / đã mất

### Xuất / Nhập dữ liệu

- Xuất cây gia phả dạng ảnh PNG
- Xuất cây gia phả dạng PDF
- Xuất dữ liệu dòng họ ra JSON
- Xuất toàn bộ dữ liệu ra Excel (.xlsx)
- Nhập dữ liệu từ file JSON
- Sao lưu toàn bộ database (SQL)
- Khôi phục database từ bản sao lưu

### Nhật ký hoạt động

- Ghi lại mọi thao tác: tạo, sửa, xóa, chia sẻ, hủy chia sẻ
- Lọc theo loại đối tượng (thành viên, dòng họ)
- Khôi phục dữ liệu đã xóa từ bản snapshot
- Hiển thị chi tiết: ai thực hiện, thời gian, nội dung thay đổi

## Cấu trúc thư mục chính

```
├── components/          # Vue components
│   ├── tree/            # Cây gia phả (FamilyTree, TreeControls, ExportDialog...)
│   ├── share/           # Chia sẻ (ShareDialog)
│   ├── member/          # Thành viên (MemberCard, MemberForm, MemberGallery...)
│   ├── search/          # Tìm kiếm (SearchFilters, SearchResults)
│   └── stats/           # Biểu đồ thống kê
├── pages/
│   ├── admin/           # Trang quản trị
│   ├── tree/            # Trang xem cây gia phả
│   ├── share/           # Trang xem chia sẻ công khai
│   └── login.vue        # Trang đăng nhập
├── server/
│   ├── api/             # API endpoints (Nitro)
│   └── utils/           # Utilities (auth, prisma, activityLog...)
├── composables/         # Vue composables (useAuth, useTreeExport...)
├── middleware/           # Nuxt route middleware
├── prisma/
│   └── schema.prisma    # Database schema
└── public/uploads/      # File uploads (avatars, photos)
```
