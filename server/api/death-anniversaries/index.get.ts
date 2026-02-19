import prisma from '~/server/utils/prisma'
import { getAccessibleFamilyLineIds } from '~/server/utils/familyLineAccess'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const familyLineId = query.familyLineId ? Number(query.familyLineId) : undefined
  const month = query.month ? Number(query.month) : undefined

  // Admin: null (xem tất cả), non-admin: mảng id được phép xem
  const accessibleIds = await getAccessibleFamilyLineIds(event)

  const where: any = {}

  if (accessibleIds !== null) {
    // Non-admin: chỉ xem ngày giỗ thuộc dòng họ được gán
    where.familyLineId = { in: accessibleIds }
  }

  if (familyLineId) {
    // Nếu user chọn filter thêm 1 dòng họ cụ thể
    if (accessibleIds !== null && !accessibleIds.includes(familyLineId)) {
      return [] // không có quyền xem dòng họ đó
    }
    where.familyLineId = familyLineId
  }

  if (month) {
    where.lunarDate = { contains: `/${month.toString().padStart(2, '0')}` }
  }

  const items = await prisma.deathAnniversary.findMany({
    where,
    include: {
      familyLine: { select: { id: true, name: true } },
      member: { select: { id: true, fullName: true, gender: true, generation: true } },
    },
    orderBy: [{ lunarDate: 'asc' }, { fullName: 'asc' }],
  })

  // Exact match cho tháng âm lịch (contains có thể match partial)
  let filtered = items
  if (month) {
    filtered = items.filter((item) => {
      const match = item.lunarDate.match(/(\d{1,2})\/(\d{1,2})/)
      if (match) return Number(match[2]) === month
      return false
    })
  }

  return filtered
})
