import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { createMemberSnapshot } from '~/server/utils/memberVersion'
import { logActivity } from '~/server/utils/activityLog'

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin', 'editor')
  const body = await readBody<{ ids: number[] }>(event)

  if (!Array.isArray(body?.ids) || body.ids.length === 0) {
    throw createError({ statusCode: 400, message: 'Danh sách ID không hợp lệ' })
  }

  const ids = body.ids.map(Number).filter((id) => Number.isInteger(id) && id > 0)

  if (ids.length === 0) {
    throw createError({ statusCode: 400, message: 'Danh sách ID không hợp lệ' })
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const members = await tx.member.findMany({ where: { id: { in: ids } } })

    if (members.length === 0) {
      return 0
    }

    // Snapshot + activity log song song cho tất cả member tìm thấy
    await Promise.all(
      members.map((member) =>
        Promise.all([
          createMemberSnapshot(tx, member, auth, 'delete' as any),
          logActivity(tx, {
            action: 'delete',
            entityType: 'member',
            entityId: member.id,
            entityName: member.fullName,
            snapshot: member,
            auth,
          }),
        ])
      )
    )

    const foundIds = members.map((m) => m.id)
    await tx.member.deleteMany({ where: { id: { in: foundIds } } })
    return members.length
  })

  return { message: `Đã xóa ${deleted} thành viên`, deleted }
})
