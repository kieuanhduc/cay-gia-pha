import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import { getAccessibleFamilyLineIds } from '~/server/utils/familyLineAccess'
import { lunarToSolar, solarToLunar } from '~/server/utils/lunarCalendar'

export interface CalendarAnniversaryItem {
  solarDay: number
  memberId: number | null
  fullName: string
  generation: number | null
  familyLineName: string
  lunarDate: string
  note?: string | null
  source: 'member' | 'anniversary'
  avatarUrl?: string | null
}

export interface CalendarResponse {
  items: CalendarAnniversaryItem[]
  lunarGrid: Record<number, string>
}

function parseLunarDate(lunarStr: string): { day: number; month: number } | null {
  const match = lunarStr.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  if (day < 1 || day > 30 || month < 1 || month > 12) return null
  return { day, month }
}

/**
 * Try to find the solar date (in the given solar year/month) for a
 * recurring lunar anniversary (lunarDay/lunarMonth).
 * We probe 3 candidate lunar years because the solar and lunar year
 * boundaries don't align.
 */
function findSolarDayInMonth(
  lunarDay: number,
  lunarMonth: number,
  targetSolarYear: number,
  targetSolarMonth: number,
): number | null {
  for (let lyOffset = -1; lyOffset <= 1; lyOffset++) {
    const tryLunarYear = targetSolarYear + lyOffset
    try {
      const solar = lunarToSolar(tryLunarYear, lunarMonth, lunarDay)
      if (solar.year === targetSolarYear && solar.month === targetSolarMonth) {
        return solar.day
      }
    } catch {
      continue
    }
  }
  return null
}

export default defineEventHandler(async (event): Promise<CalendarResponse> => {
  requireAuth(event)

  const query = getQuery(event)
  const now = new Date()
  const targetYear = query.year ? Number(query.year) : now.getFullYear()
  const targetMonth = query.month ? Number(query.month) : now.getMonth() + 1
  const familyLineId = query.familyLineId ? Number(query.familyLineId) : undefined

  const accessibleIds = await getAccessibleFamilyLineIds(event)

  const results: CalendarAnniversaryItem[] = []
  const seen = new Set<string>() // deduplicate

  // --- Source 1: Members ---
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
    if (accessibleIds !== null && !accessibleIds.includes(familyLineId)) return []
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
      avatarUrl: true,
      familyLine: { select: { name: true } },
    },
  })

  const memberIdsAdded = new Set<number>()

  for (const member of members) {
    try {
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

      const solarDay = findSolarDayInMonth(lunarDay, lunarMonth, targetYear, targetMonth)
      if (solarDay === null) continue

      const key = `member-${member.id}`
      if (seen.has(key)) continue
      seen.add(key)
      memberIdsAdded.add(member.id)

      results.push({
        solarDay,
        memberId: member.id,
        fullName: member.fullName,
        generation: member.generation,
        familyLineName: member.familyLine.name,
        lunarDate: lunarDateStr,
        source: 'member',
        avatarUrl: member.avatarUrl,
      })
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
    if (anniv.memberId && memberIdsAdded.has(anniv.memberId)) continue

    const parsed = parseLunarDate(anniv.lunarDate)
    if (!parsed) continue

    try {
      const solarDay = findSolarDayInMonth(parsed.day, parsed.month, targetYear, targetMonth)
      if (solarDay === null) continue

      const key = `anniv-${anniv.id}`
      if (seen.has(key)) continue
      seen.add(key)

      results.push({
        solarDay,
        memberId: anniv.memberId || null,
        fullName: anniv.fullName,
        generation: anniv.member?.generation || null,
        familyLineName: anniv.familyLine?.name || '',
        lunarDate: anniv.lunarDate,
        note: anniv.note,
        source: 'anniversary',
      })
    } catch {
      continue
    }
  }

  results.sort((a, b) => a.solarDay - b.solarDay || a.fullName.localeCompare(b.fullName))

  // Build lunar grid: map each solar day → lunar date string
  const totalDays = new Date(targetYear, targetMonth, 0).getDate()
  const lunarGrid: Record<number, string> = {}
  for (let d = 1; d <= totalDays; d++) {
    const lunar = solarToLunar(targetYear, targetMonth, d)
    lunarGrid[d] = `${lunar.lunarDay}${lunar.lunarDay === 1 ? `/T${lunar.lunarMonth}` : ''}`
  }

  return { items: results, lunarGrid }
})
