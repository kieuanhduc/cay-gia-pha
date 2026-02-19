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
      members: { select: { generation: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return familyLines.map((fl) => {
    const generations = fl.members.map((m) => m.generation).filter(Boolean)
    return {
      ...fl,
      memberCount: fl._count.members,
      maxGeneration: generations.length ? Math.max(...generations) : 0,
      _count: undefined,
      members: undefined,
    }
  })
})
