import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const memberId = Number(getRouterParam(event, 'id'))
  const photoId = Number(getRouterParam(event, 'photoId'))

  const body = await readBody(event)

  const existing = await prisma.memberPhoto.findFirst({
    where: { id: photoId, memberId },
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy ảnh' })
  }

  const photo = await prisma.memberPhoto.update({
    where: { id: photoId },
    data: {
      caption: body.caption ?? existing.caption,
      takenDate: body.takenDate !== undefined
        ? (body.takenDate ? new Date(body.takenDate) : null)
        : existing.takenDate,
    },
  })

  return photo
})
