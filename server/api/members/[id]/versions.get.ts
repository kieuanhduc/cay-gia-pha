import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const memberId = Number(getRouterParam(event, 'id'))

  const versions = await prisma.memberVersion.findMany({
    where: { memberId },
    orderBy: { version: 'desc' },
  })

  return versions
})
