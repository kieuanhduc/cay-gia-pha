import prisma from '~/server/utils/prisma'
import { hashPwd } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.username || !body.password || !body.fullName) {
    throw createError({ statusCode: 400, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' })
  }

  if (body.username.length < 3 || body.username.length > 50) {
    throw createError({ statusCode: 400, message: 'Tên đăng nhập phải từ 3 đến 50 ký tự' })
  }

  if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
    throw createError({ statusCode: 400, message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới' })
  }

  if (body.password.length < 6) {
    throw createError({ statusCode: 400, message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  }

  const existing = await prisma.user.findUnique({ where: { username: body.username } })
  if (existing) {
    throw createError({ statusCode: 409, message: 'Tên đăng nhập đã tồn tại' })
  }

  const hashed = await hashPwd(body.password)

  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: hashed,
      fullName: body.fullName,
      email: body.email || null,
      role: 'viewer',
    },
  })

  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  }
})
