import { join, extname } from 'path'
import { promises as fs } from 'fs'
import formidable from 'formidable'
import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const memberId = Number(getRouterParam(event, 'id'))

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'photos')
  await fs.mkdir(uploadDir, { recursive: true })

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ mimetype }) => !!mimetype?.startsWith('image/'),
  })

  const [fields, files] = await form.parse(event.node.req)
  const file = files.photo?.[0]

  if (!file) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn ảnh' })
  }

  const ext = extname(file.originalFilename || '.jpg')
  const filename = `${memberId}-${Date.now()}${ext}`
  const finalPath = join(uploadDir, filename)
  await fs.rename(file.filepath, finalPath)

  const url = `/uploads/photos/${filename}`
  const caption = fields.caption?.[0] || null
  const takenDate = fields.takenDate?.[0] ? new Date(fields.takenDate[0]) : null

  // Get max sortOrder for this member
  const maxSort = await prisma.memberPhoto.aggregate({
    where: { memberId },
    _max: { sortOrder: true },
  })
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1

  const photo = await prisma.memberPhoto.create({
    data: {
      memberId,
      url,
      caption,
      takenDate,
      sortOrder,
    },
  })

  return photo
})
