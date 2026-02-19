import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name?.trim()) throw createError({ statusCode: 400, message: 'Vui lòng nhập họ tên' })
  if (!body.email?.trim()) throw createError({ statusCode: 400, message: 'Vui lòng nhập email' })
  if (!body.subject?.trim()) throw createError({ statusCode: 400, message: 'Vui lòng nhập tiêu đề' })
  if (!body.message?.trim()) throw createError({ statusCode: 400, message: 'Vui lòng nhập nội dung' })

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email.trim())) {
    throw createError({ statusCode: 400, message: 'Email không hợp lệ' })
  }

  const msg = await prisma.contactMessage.create({
    data: {
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || null,
      subject: body.subject.trim(),
      message: body.message.trim(),
    },
  })

  return { success: true, id: msg.id }
})
