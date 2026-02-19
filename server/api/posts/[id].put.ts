import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Không tìm thấy bài viết' })

  if (!body.title?.trim()) throw createError({ statusCode: 400, message: 'Vui lòng nhập tiêu đề' })
  if (!body.content?.trim()) throw createError({ statusCode: 400, message: 'Vui lòng nhập nội dung' })

  return prisma.post.update({
    where: { id },
    data: {
      title: body.title.trim(),
      excerpt: body.excerpt?.trim() || null,
      content: body.content,
      published: body.published ?? existing.published,
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      eventPlace: body.eventPlace?.trim() || null,
    },
  })
})
