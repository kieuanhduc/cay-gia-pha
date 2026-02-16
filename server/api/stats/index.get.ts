import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const [
    byGeneration,
    byGender,
    familyLines,
    aliveCount,
    deceasedCount,
    total,
    membersWithBirth,
  ] = await Promise.all([
    prisma.member.groupBy({
      by: ['generation'],
      _count: true,
      orderBy: { generation: 'asc' },
    }),
    prisma.member.groupBy({
      by: ['gender'],
      _count: true,
    }),
    prisma.familyLine.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.member.count({ where: { isAlive: true } }),
    prisma.member.count({ where: { isAlive: false } }),
    prisma.member.count(),
    prisma.member.findMany({
      where: { birthDate: { not: null } },
      select: { birthDate: true },
    }),
  ])

  // Build byFamilyLine
  const byFamilyLine = familyLines.map((fl) => ({
    id: fl.id,
    name: fl.name,
    count: fl._count.members,
  }))

  // Build byAlive
  const byAlive = { alive: aliveCount, deceased: deceasedCount }

  // Build byGender mapped
  const genderMap: Record<string, number> = {}
  for (const g of byGender) {
    genderMap[g.gender] = g._count
  }

  // Build age distribution
  const now = new Date()
  const buckets: Record<string, number> = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '80+': 0,
  }

  for (const m of membersWithBirth) {
    if (!m.birthDate) continue
    const birth = new Date(m.birthDate)
    let age = now.getFullYear() - birth.getFullYear()
    const monthDiff = now.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--
    }
    if (age <= 20) buckets['0-20']++
    else if (age <= 40) buckets['21-40']++
    else if (age <= 60) buckets['41-60']++
    else if (age <= 80) buckets['61-80']++
    else buckets['80+']++
  }

  const ageDistribution = Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
  }))

  return {
    total,
    byGeneration: byGeneration.map((g) => ({
      generation: g.generation,
      count: g._count,
    })),
    byGender: {
      male: genderMap['male'] || 0,
      female: genderMap['female'] || 0,
    },
    byFamilyLine,
    byAlive,
    ageDistribution,
  }
})
