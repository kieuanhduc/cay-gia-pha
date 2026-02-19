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
    ageDistributionRaw,
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
    // Compute age distribution at DB level instead of fetching all rows
    // Column is camelCase "birthDate" (no @map in schema)
    prisma.$queryRaw<{ range: string; count: bigint }[]>`
      SELECT
        CASE
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthDate")) <= 20 THEN '0-20'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthDate")) <= 40 THEN '21-40'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthDate")) <= 60 THEN '41-60'
          WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, "birthDate")) <= 80 THEN '61-80'
          ELSE '80+'
        END as range,
        COUNT(*) as count
      FROM members
      WHERE "birthDate" IS NOT NULL
      GROUP BY 1
    `,
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

  // Map raw age distribution result (preserve fixed order)
  const bucketOrder = ['0-20', '21-40', '41-60', '61-80', '80+']
  const bucketMap = new Map(ageDistributionRaw.map((r) => [r.range, Number(r.count)]))
  const ageDistribution = bucketOrder.map((range) => ({
    range,
    count: bucketMap.get(range) ?? 0,
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
