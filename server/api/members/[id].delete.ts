import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { createMemberSnapshot } from '~/server/utils/memberVersion'
import { logActivity } from '~/server/utils/activityLog'

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))

  await prisma.$transaction(async (tx) => {
    const member = await tx.member.findUnique({ where: { id } })
    if (!member) {
      throw createError({ statusCode: 404, message: 'Không tìm thấy thành viên' })
    }

    // Lưu snapshot vào MemberVersion
    await createMemberSnapshot(tx, member, auth, 'delete' as any)

    // Ghi activity log với snapshot đầy đủ để có thể restore
    await logActivity(tx, {
      action: 'delete',
      entityType: 'member',
      entityId: member.id,
      entityName: member.fullName,
      snapshot: member,
      auth,
    })

    await tx.member.delete({ where: { id } })
  })

  return { message: 'Đã xóa thành viên' }
})
