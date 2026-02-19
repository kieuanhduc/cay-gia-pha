import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const body = await readBody<{ ids: number[] }>(event)

  if (!Array.isArray(body?.ids) || body.ids.length === 0) {
    throw createError({ statusCode: 400, message: 'Danh sách ID không hợp lệ' })
  }

  const ids = body.ids.map(Number).filter((id) => Number.isInteger(id) && id > 0)

  if (ids.length === 0) {
    throw createError({ statusCode: 400, message: 'Danh sách ID không hợp lệ' })
  }

  const { count } = await prisma.post.deleteMany({ where: { id: { in: ids } } })

  return { message: `Đã xoá ${count} bài viết`, deleted: count }
})
