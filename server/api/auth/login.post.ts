import prisma from '~/server/utils/prisma'
import { verifyPassword, signToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.username || !body.password) {
    throw createError({ statusCode: 400, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' })
  }

  const user = await prisma.user.findUnique({
    where: { username: body.username },
  })

  if (!user || !(await verifyPassword(body.password, user.password))) {
    throw createError({ statusCode: 401, message: 'Tên đăng nhập hoặc mật khẩu không đúng' })
  }

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    },
    token,
  }
})
