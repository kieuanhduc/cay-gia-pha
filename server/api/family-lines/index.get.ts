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
      // Fetch only 1 member with highest generation instead of all members
      members: {
        select: { generation: true },
        orderBy: { generation: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return familyLines.map((fl) => {
    return {
      ...fl,
      memberCount: fl._count.members,
      maxGeneration: fl.members[0]?.generation ?? 0,
      _count: undefined,
      members: undefined,
    }
  })
})
