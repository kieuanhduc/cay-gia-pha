#!/bin/bash
# Xóa toàn bộ data các bảng, chỉ giữ lại bảng users (tài khoản)

echo "⚠️  Sắp xóa toàn bộ data (giữ lại accounts)..."
read -p "Chắc chắn chưa? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Đã hủy."
  exit 0
fi

npx tsx -e "
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Xóa theo thứ tự tránh FK constraint
  await prisma.shareAccessLog.deleteMany()
  await prisma.userFamilyLine.deleteMany()
  await prisma.deathAnniversary.deleteMany()
  await prisma.memberPhoto.deleteMany()
  await prisma.memberVersion.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.spouse.deleteMany()
  await prisma.member.deleteMany()
  await prisma.familyLine.deleteMany()
  await prisma.post.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.siteContent.deleteMany()

  console.log('✅ Đã xóa xong. Bảng users giữ nguyên.')
}

main().finally(() => prisma.\$disconnect())
" 2>&1
