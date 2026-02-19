import { extname } from 'path'
import { promises as fs } from 'fs'
import formidable from 'formidable'
import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'
import { uploadToSupabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  requireRole(event, 'admin', 'editor')
  const memberId = Number(getRouterParam(event, 'id'))

  // Parse form
  const form = formidable({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filter: ({ mimetype }) => !!mimetype?.startsWith('image/'),
  })

  const [fields, files] = await form.parse(event.node.req)
  const file = files.photo?.[0]

  if (!file) {
    throw createError({ statusCode: 400, message: 'Vui lòng chọn ảnh' })
  }

  // Read file buffer
  const fileBuffer = await fs.readFile(file.filepath)
  
  // Generate filename
  const ext = extname(file.originalFilename || '.jpg')
  const filename = `photos/${memberId}-${Date.now()}${ext}`

  // Upload to Supabase
  const url = await uploadToSupabase(
    'members',
    filename,
    fileBuffer,
    file.mimetype || 'image/jpeg'
  )

  // Clean up temp file
  await fs.unlink(file.filepath).catch(() => {})

  // Parse form fields
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
