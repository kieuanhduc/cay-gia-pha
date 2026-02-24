import prisma from '~/server/utils/prisma'
import { hashPwd } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.username || !body.newPassword) {
    throw createError({ statusCode: 400, message: 'Vui lòng điền đầy đủ thông tin' })
  }

  if (body.newPassword.length < 6) {
    throw createError({ statusCode: 400, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  }

  const user = await prisma.user.findUnique({ where: { username: body.username } })

  if (!user) {
    throw createError({ statusCode: 404, message: 'Tên đăng nhập không tồn tại' })
  }

  const hashed = await hashPwd(body.newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

  return { message: 'Đổi mật khẩu thành công' }
})
