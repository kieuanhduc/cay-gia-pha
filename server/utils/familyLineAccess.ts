import type { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

/**
 * Kiểm tra user hiện tại có quyền xem family line không.
 * Admin: luôn có quyền.
 * Editor/Viewer: phải có trong bảng UserFamilyLine.
 * Throw 403 nếu không có quyền.
 */
export async function checkFamilyLineAccess(event: H3Event, familyLineId: number) {
  const auth = requireAuth(event)

  if (auth.role === 'admin') return auth

  const access = await prisma.userFamilyLine.findUnique({
    where: {
      userId_familyLineId: {
        userId: auth.userId,
        familyLineId,
      },
    },
  })

  if (!access) {
    throw createError({ statusCode: 403, message: 'Bạn không có quyền xem gia phả này' })
  }

  return auth
}

/**
 * Lấy danh sách familyLineId mà user được phép xem.
 * Admin: trả về null (nghĩa là xem tất cả).
 */
export async function getAccessibleFamilyLineIds(event: H3Event): Promise<number[] | null> {
  const auth = requireAuth(event)

  if (auth.role === 'admin') return null

  const records = await prisma.userFamilyLine.findMany({
    where: { userId: auth.userId },
    select: { familyLineId: true },
  })

  return records.map((r) => r.familyLineId)
}
