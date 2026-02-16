import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Tên dòng họ không được để trống' })
  }

  return prisma.familyLine.update({
    where: { id },
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      originPlace: body.originPlace?.trim() || null,
    },
  })
})
