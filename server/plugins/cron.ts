import prisma from '~/server/utils/prisma'
import { sendMail, isMailConfigured } from '~/server/utils/mailer'
import { getNextLunarAnniversary, solarToLunar } from '~/server/utils/lunarCalendar'

interface UpcomingAnniversary {
  fullName: string
  lunarDate: string
  solarDate: string
  daysUntil: number
  familyLineName: string
  note?: string | null
}

function parseLunarDate(lunarStr: string): { day: number; month: number } | null {
  const match = lunarStr.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  if (day < 1 || day > 30 || month < 1 || month > 12) return null
  return { day, month }
}

async function getAnniversariesInDays(targetDays: number): Promise<UpcomingAnniversary[]> {
  const results: UpcomingAnniversary[] = []
  const seenMemberIds = new Set<number>()

  // Source 1: Members
  const members = await prisma.member.findMany({
    where: {
      isAlive: false,
      OR: [
        { deathAnniversaryLunar: { not: null } },
        { deathDate: { not: null } },
      ],
    },
    select: {
      id: true,
      fullName: true,
      deathAnniversaryLunar: true,
      deathDate: true,
      familyLine: { select: { name: true } },
    },
  })

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
      if (daysUntil === targetDays) {
        seenMemberIds.add(member.id)
        results.push({
          fullName: member.fullName,
          lunarDate: lunarDateStr,
          solarDate: solarDateStr,
          daysUntil,
          familyLineName: member.familyLine.name,
        })
      }
    } catch {
      continue
    }
  }

  // Source 2: DeathAnniversary table
  const anniversaries = await prisma.deathAnniversary.findMany({
    include: {
      familyLine: { select: { name: true } },
      member: { select: { id: true } },
    },
  })

  for (const anniv of anniversaries) {
    if (anniv.memberId && seenMemberIds.has(anniv.memberId)) continue

    const parsed = parseLunarDate(anniv.lunarDate)
    if (!parsed) continue

    try {
      const { solarDateStr, daysUntil } = getNextLunarAnniversary(parsed.day, parsed.month)
      if (daysUntil === targetDays) {
        results.push({
          fullName: anniv.fullName,
          lunarDate: anniv.lunarDate,
          solarDate: solarDateStr,
          daysUntil,
          familyLineName: anniv.familyLine?.name || '',
          note: anniv.note,
        })
      }
    } catch {
      continue
    }
  }

  return results
}

function formatSolarDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function buildEmailHtml(anniversaries: UpcomingAnniversary[]): string {
  const rows = anniversaries.map((a) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-weight: 600;">${a.fullName}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">${a.lunarDate} (âm lịch)</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">${formatSolarDate(a.solarDate)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">${a.familyLineName}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #666; font-style: italic;">${a.note || ''}</td>
    </tr>
  `).join('')

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #2d5a87); padding: 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: #fff; margin: 0; font-size: 20px;">🕯️ Nhắc nhở ngày giỗ</h2>
        <p style="color: #b8d4e8; margin: 8px 0 0; font-size: 14px;">Còn 3 ngày nữa là đến ngày giỗ</p>
      </div>
      <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #374151;">Họ tên</th>
              <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #374151;">Ngày giỗ</th>
              <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #374151;">Dương lịch</th>
              <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #374151;">Dòng họ</th>
              <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #374151;">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="margin-top: 20px; font-size: 13px; color: #9ca3af; text-align: center;">
          Email tự động từ hệ thống Cây Gia Phả
        </p>
      </div>
    </div>
  `
}

async function checkAndNotify() {
  if (!isMailConfigured()) return

  try {
    const anniversaries = await getAnniversariesInDays(3)
    if (!anniversaries.length) {
      console.log('[Cron] Không có ngày giỗ nào trong 3 ngày tới')
      return
    }

    console.log(`[Cron] Tìm thấy ${anniversaries.length} ngày giỗ trong 3 ngày tới`)

    // Get all users with email
    const users = await prisma.user.findMany({
      where: {
        email: { not: null },
      },
      select: { email: true, fullName: true },
    })

    if (!users.length) {
      console.log('[Cron] Không có user nào có email để gửi thông báo')
      return
    }

    const html = buildEmailHtml(anniversaries)
    const subject = `🕯️ Nhắc nhở: ${anniversaries.length} ngày giỗ sắp tới (còn 3 ngày)`

    for (const user of users) {
      if (!user.email) continue
      try {
        await sendMail(user.email, subject, html)
        console.log(`[Cron] Đã gửi email nhắc ngày giỗ đến ${user.email}`)
      } catch (err) {
        console.error(`[Cron] Lỗi gửi email đến ${user.email}:`, err)
      }
    }
  } catch (err) {
    console.error('[Cron] Lỗi kiểm tra ngày giỗ:', err)
  }
}

export default defineNitroPlugin((nitroApp) => {
  // Run check daily at 8:00 AM Vietnam time (1:00 AM UTC)
  const INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

  function getDelayUntilNextRun(): number {
    const now = new Date()
    // Target: 8:00 AM Vietnam (UTC+7) = 1:00 AM UTC
    const target = new Date(now)
    target.setUTCHours(1, 0, 0, 0)

    if (target.getTime() <= now.getTime()) {
      // Already past 8AM VN today, schedule for tomorrow
      target.setUTCDate(target.getUTCDate() + 1)
    }

    return target.getTime() - now.getTime()
  }

  function scheduleNext() {
    const delay = getDelayUntilNextRun()
    const hours = Math.round(delay / (1000 * 60 * 60) * 10) / 10
    console.log(`[Cron] Lần kiểm tra ngày giỗ tiếp theo sau ${hours} giờ`)

    setTimeout(async () => {
      await checkAndNotify()
      // Schedule next run in 24h
      setInterval(checkAndNotify, INTERVAL_MS)
    }, delay)
  }

  // Also export for manual trigger
  nitroApp.hooks.hook('anniversary:check', checkAndNotify)

  scheduleNext()
  console.log('[Cron] Đã khởi tạo cron kiểm tra ngày giỗ (8:00 sáng hàng ngày)')
})
