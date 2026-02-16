import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { getNextLunarAnniversary } from '~/server/utils/lunarCalendar'

interface AnniversaryItem {
  memberId: number
  fullName: string
  generation: number
  familyLineName: string
  lunarDate: string
  solarDate: string
  daysUntil: number
}

export default defineEventHandler(async (event): Promise<AnniversaryItem[]> => {
  requireAuth(event)

  const query = getQuery(event)
  const days = Math.min(Number(query.days) || 30, 365)
  const familyLineId = query.familyLineId ? Number(query.familyLineId) : undefined

  const where: any = {
    isAlive: false,
    deathAnniversaryLunar: { not: null },
  }
  if (familyLineId) {
    where.familyLineId = familyLineId
  }

  const members = await prisma.member.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      generation: true,
      deathAnniversaryLunar: true,
      familyLine: {
        select: { name: true },
      },
    },
  })

  const results: AnniversaryItem[] = []

  for (const member of members) {
    const lunar = member.deathAnniversaryLunar!
    // Expected format: "DD/MM"
    const match = lunar.match(/^(\d{1,2})\/(\d{1,2})$/)
    if (!match) continue

    const lunarDay = parseInt(match[1], 10)
    const lunarMonth = parseInt(match[2], 10)

    if (lunarDay < 1 || lunarDay > 30 || lunarMonth < 1 || lunarMonth > 12) {
      continue
    }

    try {
      const { solarDate, daysUntil } = getNextLunarAnniversary(lunarDay, lunarMonth)

      if (daysUntil <= days) {
        results.push({
          memberId: member.id,
          fullName: member.fullName,
          generation: member.generation,
          familyLineName: member.familyLine.name,
          lunarDate: lunar,
          solarDate: solarDate.toISOString().split('T')[0],
          daysUntil,
        })
      }
    } catch {
      // Skip members with invalid lunar dates
      continue
    }
  }

  results.sort((a, b) => a.daysUntil - b.daysUntil)

  return results
})
