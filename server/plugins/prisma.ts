import prisma from '~/server/utils/prisma'

// Pre-connect khi server khởi động để request đầu tiên không bị chậm
export default defineNitroPlugin(async () => {
  try {
    await prisma.$connect()
    console.log('✓ Prisma connected to database')
  } catch (e) {
    console.error('✗ Prisma connection failed:', e)
  }

  // Đóng kết nối sạch khi server tắt
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
})
