import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin')
  const id = Number(getRouterParam(event, 'id'))

  if (auth.userId === id) {
    throw createError({ statusCode: 400, message: 'Không thể xóa chính tài khoản đang đăng nhập' })
  }

  await prisma.user.delete({ where: { id } })

  return { message: 'Đã xóa tài khoản' }
})
