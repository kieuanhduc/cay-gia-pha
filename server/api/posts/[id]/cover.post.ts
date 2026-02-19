import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import { extname } from 'path'
import { uploadToSupabase, deleteFromSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Không tìm thấy bài viết' })

  // Parse form
  const form = formidable({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ mimetype }) => !!mimetype?.startsWith('image/'),
  })

  const [, files] = await form.parse(event.node.req)
  const file = files.cover?.[0]

  if (!file) throw createError({ statusCode: 400, message: 'Vui lòng chọn ảnh' })

  // Read file buffer
  const fileBuffer = await fs.readFile(file.filepath)
  
  // Generate filename
  const ext = extname(file.originalFilename || '.jpg')
  const filename = `covers/post-${id}-${Date.now()}${ext}`

  // Upload to Supabase
  const coverImage = await uploadToSupabase(
    'members',
    filename,
    fileBuffer,
    file.mimetype || 'image/jpeg'
  )

  // Delete old cover from Supabase if exists
  if (existing.coverImage && existing.coverImage.includes('supabase')) {
    const oldPath = existing.coverImage.split('/members/')[1]
    if (oldPath) {
      await deleteFromSupabase('members', oldPath)
    }
  }

  // Clean up temp file
  await fs.unlink(file.filepath).catch(() => {})

  // Update database
  await prisma.post.update({ where: { id }, data: { coverImage } })

  return { coverImage }
})
