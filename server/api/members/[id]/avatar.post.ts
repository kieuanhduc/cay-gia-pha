import { join, extname } from 'path'
import { promises as fs } from 'fs'
import formidable from 'formidable'
import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const id = Number(getRouterParam(event, 'id'))

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
  await fs.mkdir(uploadDir, { recursive: true })

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    filter: ({ mimetype }) => !!mimetype?.startsWith('image/'),
  })

  const [, files] = await form.parse(event.node.req)
  const file = files.avatar?.[0]

  if (!file) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn ảnh' })
  }

  const ext = extname(file.originalFilename || '.jpg')
  const filename = `${id}-${Date.now()}${ext}`
  const finalPath = join(uploadDir, filename)
  await fs.rename(file.filepath, finalPath)

  const avatarUrl = `/uploads/avatars/${filename}`
  await prisma.member.update({
    where: { id },
    data: { avatarUrl },
  })

  return { avatarUrl }
})
