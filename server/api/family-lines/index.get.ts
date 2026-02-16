import prisma from '~/server/utils/prisma'
import { getAccessibleFamilyLineIds } from '~/server/utils/familyLineAccess'

export default defineEventHandler(async (event) => {
  const accessibleIds = await getAccessibleFamilyLineIds(event)

  const where: any = {}
  if (accessibleIds !== null) {
    // Non-admin: only show accessible family lines
    where.id = { in: accessibleIds }
  }

  const familyLines = await prisma.familyLine.findMany({
    where,
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return familyLines.map((fl) => ({
    ...fl,
    memberCount: fl._count.members,
    _count: undefined,
  }))
})
