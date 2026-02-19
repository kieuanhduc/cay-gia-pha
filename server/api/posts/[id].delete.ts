import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))
  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Không tìm thấy bài viết' })
  await prisma.post.delete({ where: { id } })
  return { success: true }
})
