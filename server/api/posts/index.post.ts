import prisma from '~/server/utils/prisma'
import { requireRole } from '~/server/utils/auth'

function generateSlug(title: string, id: number): string {
  const base = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
  return `${base}-${id}`
}

export default defineEventHandler(async (event) => {
  const auth = requireRole(event, 'admin', 'editor')
  const body = await readBody(event)

  if (!body.title?.trim()) throw createError({ statusCode: 400, message: 'Vui lòng nhập tiêu đề' })
  if (!body.type || !['news', 'event'].includes(body.type)) {
    throw createError({ statusCode: 400, message: 'Loại bài viết không hợp lệ' })
  }
  if (!body.content?.trim()) throw createError({ statusCode: 400, message: 'Vui lòng nhập nội dung' })

  // Create with temp slug, then update with id
  const post = await prisma.post.create({
    data: {
      type: body.type,
      title: body.title.trim(),
      slug: `temp-${Date.now()}`,
      excerpt: body.excerpt?.trim() || null,
      content: body.content,
      published: body.published ?? false,
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      eventPlace: body.eventPlace?.trim() || null,
      authorName: auth.username,
    },
  })

  const slug = generateSlug(body.title.trim(), post.id)
  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { slug },
  })

  return updated
})
