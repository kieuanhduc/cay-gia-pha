import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'
import * as XLSX from 'xlsx'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const { familyLineId } = getQuery(event)

  const where = familyLineId ? { familyLineId: Number(familyLineId) } : {}

  const members = await prisma.member.findMany({
    where,
    include: {
      familyLine: true,
      father: true,
      mother: true,
      spousesAsA: { include: { memberB: true } },
      spousesAsB: { include: { memberA: true } },
    },
    orderBy: [{ familyLineId: 'asc' }, { generation: 'asc' }, { birthOrder: 'asc' }],
  })

  const rows = members.map((m) => {
    const spouses = [
      ...m.spousesAsA.map((s) => s.memberB.fullName),
      ...m.spousesAsB.map((s) => s.memberA.fullName),
    ]

    return {
      'Dòng họ': m.familyLine.name,
      'Đời': m.generation,
      'Thứ tự': m.birthOrder,
      'Họ tên': m.fullName,
      'Giới tính': m.gender === 'male' ? 'Nam' : 'Nữ',
      'Ngày sinh': m.birthDate ? formatDate(m.birthDate) : '',
      'Ngày mất': m.deathDate ? formatDate(m.deathDate) : '',
      'Còn sống': m.isAlive ? 'Có' : 'Không',
      'Nơi sinh': m.birthPlace || '',
      'Cha': m.father?.fullName || '',
      'Mẹ': m.mother?.fullName || '',
      'Vợ/Chồng': spouses.join(', '),
      'Ngày giỗ (âm lịch)': m.deathAnniversaryLunar || '',
      'Ghi chú giỗ': m.deathAnniversaryNote || '',
      'Tiểu sử': m.bio || '',
    }
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Auto-fit column widths
  const colWidths = Object.keys(rows[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((r) => String((r as any)[key] || '').length)
    )
    return { wch: Math.min(maxLen + 2, 40) }
  })
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Gia phả')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename=gia-pha-${Date.now()}.xlsx`)
  return buf
})

function formatDate(d: Date): string {
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}
