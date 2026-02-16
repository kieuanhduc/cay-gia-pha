import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 30
  const entityType = query.entityType as string | undefined

  const where: any = {}
  if (entityType) where.entityType = entityType

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ])

  return { logs, total, page, limit }
})
