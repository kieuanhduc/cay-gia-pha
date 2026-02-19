import { extname } from 'path'
import { promises as fs } from 'fs'
import formidable from 'formidable'
import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { uploadToSupabase, deleteFromSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))

  // Parse form với formidable (temporary local storage)
  const form = formidable({
    maxFileSize: 2 * 1024 * 1024, // 2MB
    filter: ({ mimetype }) => !!mimetype?.startsWith('image/'),
  })

  const [, files] = await form.parse(event.node.req)
  const file = files.avatar?.[0]

  if (!file) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn ảnh' })
  }

  // Read file buffer
  const fileBuffer = await fs.readFile(file.filepath)
  
  // Generate filename
  const ext = extname(file.originalFilename || '.jpg')
  const filename = `avatars/${id}-${Date.now()}${ext}`

  // Get current member to delete old avatar if exists
  const member = await prisma.member.findUnique({
    where: { id },
    select: { avatarUrl: true },
  })

  // Upload to Supabase Storage
  const avatarUrl = await uploadToSupabase(
    'members',
    filename,
    fileBuffer,
    file.mimetype || 'image/jpeg'
  )

  // Delete old avatar from Supabase if exists
  if (member?.avatarUrl && member.avatarUrl.includes('supabase')) {
    const oldPath = member.avatarUrl.split('/members/')[1]
    if (oldPath) {
      await deleteFromSupabase('members', oldPath)
    }
  }

  // Clean up temporary file
  await fs.unlink(file.filepath).catch(() => {})

  // Update database
  await prisma.member.update({
    where: { id },
    data: { avatarUrl },
  })

  return { avatarUrl }
})
