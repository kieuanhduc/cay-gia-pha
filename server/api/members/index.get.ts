import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 50
  const familyLineId = query.familyLineId ? Number(query.familyLineId) : undefined
  const search = query.search as string | undefined
  const generation = query.generation ? Number(query.generation) : undefined

  const where: any = {}
  if (familyLineId) where.familyLineId = familyLineId
  if (generation) where.generation = generation
  if (search) where.fullName = { contains: search, mode: 'insensitive' }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        familyLine: { select: { id: true, name: true } },
        father: { select: { id: true, fullName: true } },
        mother: { select: { id: true, fullName: true } },
      },
      orderBy: [{ generation: 'asc' }, { birthOrder: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.member.count({ where }),
  ])

  return { members, total, page, limit }
})
