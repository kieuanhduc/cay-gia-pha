import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin')

  const query = getQuery(event)
  const familyLineId = query.familyLineId ? Number(query.familyLineId) : undefined
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 50

  const where: any = {}
  if (familyLineId) where.familyLineId = familyLineId

  const [logs, total] = await Promise.all([
    prisma.shareAccessLog.findMany({
      where,
      include: {
        familyLine: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shareAccessLog.count({ where }),
  ])

  return { logs, total, page, limit }
})
