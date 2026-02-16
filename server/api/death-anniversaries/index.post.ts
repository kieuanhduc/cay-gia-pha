import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const body = await readBody(event)

  if (!body.fullName?.trim()) {
    throw createError({ statusCode: 400, message: 'Vui lòng nhập họ tên' })
  }
  if (!body.lunarDate?.trim()) {
    throw createError({ statusCode: 400, message: 'Vui lòng nhập ngày giỗ âm lịch' })
  }

  // Validate lunarDate format: DD/MM
  const dateMatch = body.lunarDate.trim().match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!dateMatch) {
    throw createError({ statusCode: 400, message: 'Ngày giỗ không đúng định dạng (VD: 15/07)' })
  }

  const day = Number(dateMatch[1])
  const month = Number(dateMatch[2])
  if (day < 1 || day > 30 || month < 1 || month > 12) {
    throw createError({ statusCode: 400, message: 'Ngày hoặc tháng không hợp lệ' })
  }

  const created = await prisma.deathAnniversary.create({
    data: {
      fullName: body.fullName.trim(),
      lunarDate: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`,
      note: body.note?.trim() || null,
      familyLineId: body.familyLineId ? Number(body.familyLineId) : null,
      memberId: body.memberId ? Number(body.memberId) : null,
    },
  })

  return created
})
