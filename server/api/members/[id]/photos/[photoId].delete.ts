import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { deleteFromSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const memberId = Number(getRouterParam(event, 'id'))
  const photoId = Number(getRouterParam(event, 'photoId'))

  const photo = await prisma.memberPhoto.findFirst({
    where: { id: photoId, memberId },
  })

  if (!photo) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy ảnh' })
  }

  // Delete from Supabase Storage
  if (photo.url.includes('supabase')) {
    const path = photo.url.split('/members/')[1]
    if (path) {
      await deleteFromSupabase('members', path)
    }
  }

  // Delete from database
  await prisma.memberPhoto.delete({
    where: { id: photoId },
  })

  return { message: 'Đã xóa ảnh' }
})
