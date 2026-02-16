import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const familyLineId = query.familyLineId ? Number(query.familyLineId) : undefined
  const month = query.month ? Number(query.month) : undefined

  const where: any = {}
  if (familyLineId) where.familyLineId = familyLineId

  // Filter by lunar month from lunarDate field (format: "DD/MM")
  if (month) {
    where.lunarDate = { contains: `/${month.toString().padStart(2, '0')}` }
  }

  const items = await prisma.deathAnniversary.findMany({
    where,
    include: {
      familyLine: { select: { id: true, name: true } },
      member: { select: { id: true, fullName: true, gender: true, generation: true } },
    },
    orderBy: [{ lunarDate: 'asc' }, { fullName: 'asc' }],
  })

  // If month filter, do exact match (the contains might match partial)
  let filtered = items
  if (month) {
    filtered = items.filter((item) => {
      const match = item.lunarDate.match(/(\d{1,2})\/(\d{1,2})/)
      if (match) return Number(match[2]) === month
      return false
    })
  }

  return filtered
})
