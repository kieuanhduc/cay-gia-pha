import { join } from 'path'
import { promises as fs } from 'fs'
import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

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

  // Delete file from filesystem
  const filePath = join(process.cwd(), 'public', photo.url)
  try {
    await fs.unlink(filePath)
  } catch {
    // File may not exist, continue with DB deletion
  }

  await prisma.memberPhoto.delete({
    where: { id: photoId },
  })

  return { message: 'Đã xóa ảnh' }
})
