import { solarToLunar } from '~/server/utils/lunarCalendar'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const date = String(query.date || '')

  // Expected format: YYYY-MM-DD
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    throw createError({ statusCode: 400, message: 'Invalid date format. Use YYYY-MM-DD' })
  }

  const year = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const day = parseInt(match[3], 10)

  const lunar = solarToLunar(year, month, day)

  return {
    lunarDay: lunar.lunarDay,
    lunarMonth: lunar.lunarMonth,
    lunarYear: lunar.lunarYear,
    isLeapMonth: lunar.isLeapMonth,
  }
})
