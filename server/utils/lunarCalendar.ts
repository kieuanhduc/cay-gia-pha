/**
 * Vietnamese Lunar Calendar conversion using Julian Day Number (JD).
 *
 * Based on the well-known algorithm by Ho Ngoc Duc, widely used in
 * Vietnamese applications. Accurate for the range 1900-2100.
 *
 * References:
 *   - https://www.informatik.uni-leipzig.de/~duc/amlich/
 *   - Astronomical Algorithms by Jean Meeus
 */

const PI = Math.PI

/* ------------------------------------------------------------------ */
/*  Low-level astronomical helpers                                     */
/* ------------------------------------------------------------------ */

/** Convert a Gregorian calendar date to Julian Day Number. */
function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  if (jd < 2299161) {
    jd =
      dd +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      32083
  }
  return jd
}

/** Convert a Julian Day Number back to Gregorian calendar date. */
function jdToDate(jd: number): { day: number; month: number; year: number } {
  let a: number, b: number, c: number
  if (jd > 2299160) {
    a = jd + 32044
    b = Math.floor((4 * a + 3) / 146097)
    c = a - Math.floor((146097 * b) / 4)
  } else {
    b = 0
    c = jd + 32082
  }
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  const day = e - Math.floor((153 * m + 2) / 5) + 1
  const month = m + 3 - 12 * Math.floor(m / 10)
  const year = 100 * b + d - 4800 + Math.floor(m / 10)
  return { day, month, year }
}

/**
 * Compute the Julian Day Number of the k-th new moon after
 * the new moon of January 1900. Uses the Meeus algorithm.
 */
function newMoon(k: number): number {
  const T = k / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const dr = PI / 180
  let Jd1 =
    2415020.75933 +
    29.53058868 * k +
    0.0001178 * T2 -
    0.000000155 * T3
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr)
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M)
  C1 =
    C1 -
    0.4068 * Math.sin(Mpr * dr) +
    0.0161 * Math.sin(dr * 2 * Mpr)
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr)
  C1 =
    C1 +
    0.0104 * Math.sin(dr * 2 * F) -
    0.0051 * Math.sin(dr * (M + Mpr))
  C1 =
    C1 -
    0.0074 * Math.sin(dr * (M - Mpr)) +
    0.0004 * Math.sin(dr * (2 * F + M))
  C1 =
    C1 -
    0.0004 * Math.sin(dr * (2 * F - M)) -
    0.0006 * Math.sin(dr * (2 * F + Mpr))
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M))

  let deltaT: number
  if (T < -11) {
    deltaT = 0.001 + 0.000677 * T + 0.0000325 * T2
  } else {
    deltaT =
      -0.000278 + 0.000265 * T + 0.000262 * T2
  }
  return Jd1 + C1 - deltaT
}

/** Sun longitude at Julian Day jdn (degrees, 0-360). */
function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525
  const T2 = T * T
  const dr = PI / 180
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2
  let DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M)
  DL =
    DL +
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M)
  let L = L0 + DL
  L = L * dr
  L = L - PI * 2 * Math.floor(L / (PI * 2))
  return Math.floor((L / PI) * 6)
}

/** Return the sun longitude sector (0..11) for a new moon JD. */
function getSunLongitude(jd: number): number {
  return sunLongitude(jd)
}

/** Return the Julian Day Number of the k-th new moon. */
function getNewMoonDay(k: number): number {
  return Math.floor(newMoon(k) + 0.5)
}

/**
 * Find the lunar month 11 (the month containing the winter solstice)
 * for a given year. Returns the JD of the new moon starting that month.
 */
function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021
  const k = Math.floor(off / 29.530588853)
  let nm = getNewMoonDay(k)
  const sunLng = getSunLongitude(nm - Math.floor(timeZone / 24))
  if (sunLng >= 9) {
    nm = getNewMoonDay(k - 1)
  }
  return nm
}

/**
 * Determine the index of the leap month in a lunar year
 * that starts after lunar month 11 of year `a11Year`.
 * Returns 0 if there is no leap month.
 */
function getLeapMonthOffset(a11: number, timeZone: number): number {
  let k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5)
  let last: number
  let i = 1
  let arc = getSunLongitude(getNewMoonDay(k + i) - Math.floor(timeZone / 24))
  do {
    last = arc
    i++
    arc = getSunLongitude(getNewMoonDay(k + i) - Math.floor(timeZone / 24))
  } while (arc !== last && i < 14)
  return i - 1
}

/* ------------------------------------------------------------------ */
/*  Public conversion functions                                        */
/* ------------------------------------------------------------------ */

const TIMEZONE = 7 // Vietnam is UTC+7

export interface LunarDate {
  lunarDay: number
  lunarMonth: number
  lunarYear: number
  isLeapMonth: boolean
}

export interface SolarDate {
  year: number
  month: number
  day: number
}

/**
 * Convert a Gregorian (solar) date to Vietnamese lunar calendar date.
 */
export function solarToLunar(
  year: number,
  month: number,
  day: number,
): LunarDate {
  const dayNumber = jdFromDate(day, month, year)
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853)
  let monthStart = getNewMoonDay(k + 1)
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k)
  }
  let a11 = getLunarMonth11(year, TIMEZONE)
  let b11 = a11
  let lunarYear: number
  if (a11 >= monthStart) {
    lunarYear = year
    a11 = getLunarMonth11(year - 1, TIMEZONE)
  } else {
    lunarYear = year + 1
    b11 = getLunarMonth11(year + 1, TIMEZONE)
  }
  const lunarDay = dayNumber - monthStart + 1
  const diff = Math.floor((monthStart - a11) / 29)
  let isLeapMonth = false
  let lunarMonth = diff + 11
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, TIMEZONE)
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10
      if (diff === leapMonthDiff) {
        isLeapMonth = true
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1
  }
  return { lunarDay, lunarMonth, lunarYear, isLeapMonth }
}

/**
 * Convert a Vietnamese lunar calendar date to Gregorian (solar) date.
 * Assumes the date is NOT in a leap month. For leap month handling,
 * use the optional isLeapMonth parameter.
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean = false,
): SolarDate {
  let a11: number, b11: number
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, TIMEZONE)
    b11 = getLunarMonth11(lunarYear, TIMEZONE)
  } else {
    a11 = getLunarMonth11(lunarYear, TIMEZONE)
    b11 = getLunarMonth11(lunarYear + 1, TIMEZONE)
  }
  const k11 = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853)
  let off = lunarMonth - 11
  if (off < 0) {
    off += 12
  }
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, TIMEZONE)
    let leapMonth = leapOff - 2
    if (leapMonth < 0) {
      leapMonth += 12
    }
    if (isLeapMonth && lunarMonth !== leapMonth) {
      // requested leap month does not exist; treat as normal
      return lunarToSolar(lunarYear, lunarMonth, lunarDay, false)
    } else if (isLeapMonth || (off >= leapOff)) {
      off += 1
    }
  }
  const monthStart = getNewMoonDay(k11 + off)
  return jdToDate(monthStart + lunarDay - 1)
}

/**
 * Given a recurring lunar anniversary (day/month), find the next
 * occurrence in the solar calendar relative to today.
 *
 * Returns the solar date and the number of days until that date.
 */
export function getNextLunarAnniversary(
  lunarDay: number,
  lunarMonth: number,
): { solarDate: Date; daysUntil: number } {
  const now = new Date()
  // Normalize to start of day in Vietnam timezone
  const vietnamNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
  )
  const todayStart = new Date(
    vietnamNow.getFullYear(),
    vietnamNow.getMonth(),
    vietnamNow.getDate(),
  )

  // Get the current lunar year
  const currentLunar = solarToLunar(
    vietnamNow.getFullYear(),
    vietnamNow.getMonth() + 1,
    vietnamNow.getDate(),
  )

  // Try this lunar year first, then next lunar year
  const candidates: SolarDate[] = []
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const tryYear = currentLunar.lunarYear + yearOffset
    const solar = lunarToSolar(tryYear, lunarMonth, lunarDay)
    candidates.push(solar)
  }

  for (const solar of candidates) {
    const solarDate = new Date(solar.year, solar.month - 1, solar.day)
    const diffMs = solarDate.getTime() - todayStart.getTime()
    const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (daysUntil >= 0) {
      return { solarDate, daysUntil }
    }
  }

  // Fallback: next year + 1 (should not normally reach here)
  const fallbackYear = currentLunar.lunarYear + 2
  const solar = lunarToSolar(fallbackYear, lunarMonth, lunarDay)
  const solarDate = new Date(solar.year, solar.month - 1, solar.day)
  const diffMs = solarDate.getTime() - todayStart.getTime()
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return { solarDate, daysUntil }
}
