import prisma from '~/server/utils/prisma'
import { getTokenFromEvent, verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = getTokenFromEvent(event)
  if (!token) {
    throw createError({ statusCode: 401, message: 'Chưa đăng nhập' })
  }

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, fullName: true, email: true, role: true },
    })

    if (!user) {
      throw createError({ statusCode: 401, message: 'Người dùng không tồn tại' })
    }

    return { user }
  } catch {
    throw createError({ statusCode: 401, message: 'Phiên đăng nhập hết hạn' })
  }
})
