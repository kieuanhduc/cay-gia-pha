#!/usr/bin/env bash
# Xoá toàn bộ dữ liệu bảng activity_logs (Nhật ký hoạt động)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."

# Xác nhận trước khi xoá
read -r -p "⚠️  Bạn có chắc muốn xoá toàn bộ Nhật ký hoạt động? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "🚫 Đã huỷ."
  exit 0
fi

# Chạy Node script để xoá qua Prisma
node --input-type=module <<'EOF'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  const count = await prisma.activityLog.count()
  console.log(`📋 Đang xoá ${count} bản ghi...`)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE activity_logs RESTART IDENTITY')
  console.log('✅ Đã xoá toàn bộ Nhật ký hoạt động.')
} catch (e) {
  console.error('❌ Lỗi:', e.message)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
EOF
