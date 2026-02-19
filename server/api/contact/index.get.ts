import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const query = getQuery(event)
  const isRead = query.isRead !== undefined ? query.isRead === 'true' : undefined
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20

  const where: any = {}
  if (isRead !== undefined) where.isRead = isRead

  const [items, total, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ])

  return { items, total, unreadCount, page, limit }
})
