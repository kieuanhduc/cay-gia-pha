import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { getAccessibleFamilyLineIds } from '~/server/utils/familyLineAccess'
import { getNextLunarAnniversary, solarToLunar } from '~/server/utils/lunarCalendar'

interface AnniversaryItem {
  memberId: number | null
  fullName: string
  generation: number | null
  familyLineName: string
  lunarDate: string
  solarDate: string
  daysUntil: number
  note?: string | null
  source: 'member' | 'anniversary'
}

function parseLunarDate(lunarStr: string): { day: number; month: number } | null {
  const match = lunarStr.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  if (day < 1 || day > 30 || month < 1 || month > 12) return null
  return { day, month }
}

export default defineEventHandler(async (event): Promise<AnniversaryItem[]> => {
  requireAuth(event)

  const query = getQuery(event)
  const days = Math.min(Number(query.days) || 30, 365)
  const familyLineId = query.familyLineId ? Number(query.familyLineId) : undefined

  // Admin: null (xem tất cả), non-admin: mảng id được phép xem
  const accessibleIds = await getAccessibleFamilyLineIds(event)

  const results: AnniversaryItem[] = []

  // --- Source 1: Members with deathAnniversaryLunar or deathDate ---
  const memberWhere: any = {
    isAlive: false,
    OR: [
      { deathAnniversaryLunar: { not: null } },
      { deathDate: { not: null } },
    ],
  }

  if (accessibleIds !== null) {
    memberWhere.familyLineId = { in: accessibleIds }
  }

  if (familyLineId) {
    if (accessibleIds !== null && !accessibleIds.includes(familyLineId)) {
      return []
    }
    memberWhere.familyLineId = familyLineId
  }

  const members = await prisma.member.findMany({
    where: memberWhere,
    select: {
      id: true,
      fullName: true,
      generation: true,
      deathAnniversaryLunar: true,
      deathDate: true,
      familyLine: {
        select: { name: true },
      },
    },
  })

  // Track member IDs that already have anniversaries from Members table
  const memberIdsFromMembers = new Set<number>()

  for (const member of members) {
    let lunarDay: number
    let lunarMonth: number
    let lunarDateStr: string

    if (member.deathAnniversaryLunar) {
      const parsed = parseLunarDate(member.deathAnniversaryLunar)
      if (!parsed) continue
      lunarDay = parsed.day
      lunarMonth = parsed.month
      lunarDateStr = member.deathAnniversaryLunar
    } else if (member.deathDate) {
      const d = new Date(member.deathDate)
      const converted = solarToLunar(d.getFullYear(), d.getMonth() + 1, d.getDate())
      lunarDay = converted.lunarDay
      lunarMonth = converted.lunarMonth
      lunarDateStr = `${String(lunarDay).padStart(2, '0')}/${String(lunarMonth).padStart(2, '0')}`
    } else {
      continue
    }

    try {
      const { solarDateStr, daysUntil } = getNextLunarAnniversary(lunarDay, lunarMonth)

      if (daysUntil <= days) {
        memberIdsFromMembers.add(member.id)
        results.push({
          memberId: member.id,
          fullName: member.fullName,
          generation: member.generation,
          familyLineName: member.familyLine.name,
          lunarDate: lunarDateStr,
          solarDate: solarDateStr,
          daysUntil,
          source: 'member',
        })
      }
    } catch {
      continue
    }
  }

  // --- Source 2: DeathAnniversary table ---
  const annivWhere: any = {}

  if (accessibleIds !== null) {
    annivWhere.familyLineId = { in: accessibleIds }
  }

  if (familyLineId) {
    annivWhere.familyLineId = familyLineId
  }

  const anniversaries = await prisma.deathAnniversary.findMany({
    where: annivWhere,
    include: {
      familyLine: { select: { name: true } },
      member: { select: { id: true, generation: true } },
    },
  })

  for (const anniv of anniversaries) {
    // Skip if this member's anniversary already added from Members table
    if (anniv.memberId && memberIdsFromMembers.has(anniv.memberId)) {
      continue
    }

    const parsed = parseLunarDate(anniv.lunarDate)
    if (!parsed) continue

    try {
      const { solarDateStr, daysUntil } = getNextLunarAnniversary(parsed.day, parsed.month)

      if (daysUntil <= days) {
        results.push({
          memberId: anniv.memberId || null,
          fullName: anniv.fullName,
          generation: anniv.member?.generation || null,
          familyLineName: anniv.familyLine?.name || '',
          lunarDate: anniv.lunarDate,
          solarDate: solarDateStr,
          daysUntil,
          note: anniv.note,
          source: 'anniversary',
        })
      }
    } catch {
      continue
    }
  }

  results.sort((a, b) => a.daysUntil - b.daysUntil)

  return results
})
