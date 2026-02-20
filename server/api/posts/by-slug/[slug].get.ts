import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') as string
  const post = await prisma.post.findFirst({
    where: { slug, published: true },
  })
  if (!post) throw createError({ statusCode: 404, message: 'Không tìm thấy bài viết' })
  return post
})
