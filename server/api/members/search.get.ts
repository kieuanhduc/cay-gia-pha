import { requireAuth } from '~/server/utils/auth'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const q = (query.q as string)?.trim() || ''
  const gender = query.gender as string | undefined
  const generation = query.generation ? Number(query.generation) : undefined
  const birthYearFrom = query.birthYearFrom ? Number(query.birthYearFrom) : undefined
  const birthYearTo = query.birthYearTo ? Number(query.birthYearTo) : undefined
  const birthPlace = (query.birthPlace as string)?.trim() || ''
  const isAlive = query.isAlive as string | undefined
  const familyLineId = query.familyLineId ? Number(query.familyLineId) : undefined
  const hasAnniversary = query.hasAnniversary as string | undefined

  const where: any = {}

  if (q) {
    where.fullName = { contains: q }
  }

  if (gender === 'male' || gender === 'female') {
    where.gender = gender
  }

  if (generation) {
    where.generation = generation
  }

  if (birthYearFrom || birthYearTo) {
    where.birthDate = {}
    if (birthYearFrom) {
      where.birthDate.gte = new Date(`${birthYearFrom}-01-01`)
    }
    if (birthYearTo) {
      where.birthDate.lte = new Date(`${birthYearTo}-12-31`)
    }
  }

  if (birthPlace) {
    where.birthPlace = { contains: birthPlace }
  }

  if (isAlive === 'true') {
    where.isAlive = true
  } else if (isAlive === 'false') {
    where.isAlive = false
  }

  if (familyLineId) {
    where.familyLineId = familyLineId
  }

  if (hasAnniversary === 'true') {
    where.deathAnniversaryLunar = { not: null }
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        familyLine: { select: { id: true, name: true } },
        spousesAsA: {
          include: {
            memberB: { select: { id: true, fullName: true, gender: true } },
          },
        },
        spousesAsB: {
          include: {
            memberA: { select: { id: true, fullName: true, gender: true } },
          },
        },
      },
      orderBy: [{ generation: 'asc' }, { birthOrder: 'asc' }, { fullName: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.member.count({ where }),
  ])

  const result = members.map((m) => {
    const spouses = [
      ...m.spousesAsA.map((s) => s.memberB),
      ...m.spousesAsB.map((s) => s.memberA),
    ]
    const { spousesAsA, spousesAsB, ...rest } = m
    return { ...rest, spouses }
  })

  return { members: result, total, page, limit }
})
