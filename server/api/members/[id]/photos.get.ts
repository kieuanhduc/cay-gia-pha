import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const memberId = Number(getRouterParam(event, 'id'))

  const photos = await prisma.memberPhoto.findMany({
    where: { memberId },
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return photos
})
