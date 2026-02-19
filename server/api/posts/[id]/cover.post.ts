import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import { join, extname } from 'path'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Không tìm thấy bài viết' })

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'covers')
  await fs.mkdir(uploadDir, { recursive: true })

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    filter: ({ mimetype }) => !!mimetype?.startsWith('image/'),
  })

  const [, files] = await form.parse(event.node.req)
  const file = files.cover?.[0]

  if (!file) throw createError({ statusCode: 400, message: 'Vui lòng chọn ảnh' })

  const ext = extname(file.originalFilename || '.jpg')
  const filename = `cover-${id}-${Date.now()}${ext}`
  const finalPath = join(uploadDir, filename)
  await fs.rename(file.filepath, finalPath)

  // Xoá ảnh cũ nếu có
  if (existing.coverImage) {
    const oldPath = join(process.cwd(), 'public', existing.coverImage)
    await fs.unlink(oldPath).catch(() => {})
  }

  const coverImage = `/uploads/covers/${filename}`
  await prisma.post.update({ where: { id }, data: { coverImage } })

  return { coverImage }
})
