import prisma from '~/server/utils/prisma'
import { requireRole, hashPassword } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')
  const body = await readBody(event)

  if (!body.username?.trim()) {
    throw createError({ statusCode: 400, message: 'Tên đăng nhập không được để trống' })
  }
  if (!body.password?.trim()) {
    throw createError({ statusCode: 400, message: 'Mật khẩu không được để trống' })
  }
  if (!body.fullName?.trim()) {
    throw createError({ statusCode: 400, message: 'Họ tên không được để trống' })
  }
  if (!body.role || !['admin', 'editor', 'viewer'].includes(body.role)) {
    throw createError({ statusCode: 400, message: 'Vai trò không hợp lệ' })
  }

  const existing = await prisma.user.findUnique({
    where: { username: body.username.trim() },
  })
  if (existing) {
    throw createError({ statusCode: 400, message: 'Tên đăng nhập đã tồn tại' })
  }

  const hashedPassword = await hashPassword(body.password)

  const user = await prisma.user.create({
    data: {
      username: body.username.trim(),
      password: hashedPassword,
      fullName: body.fullName.trim(),
      role: body.role,
    },
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
})
