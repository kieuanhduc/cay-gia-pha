  # 1. Start MySQL container
  docker compose up -d

  # 2. Đợi ~10s cho MySQL sẵn sàng, rồi migrate
  npx prisma migrate dev --name init

  # 3. Seed dữ liệu mẫu
  npm run db:seed

  # 4. Chạy app
  npm run dev

# cay-gia-pha
