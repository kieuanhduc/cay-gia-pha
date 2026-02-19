import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type as string | undefined
  const published = query.published !== undefined ? query.published === 'true' : undefined
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10

  const where: any = {}
  if (type) where.type = type
  if (published !== undefined) where.published = published

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        published: true,
        eventDate: true,
        eventPlace: true,
        authorName: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.post.count({ where }),
  ])

  return { items, total, page, limit }
})
