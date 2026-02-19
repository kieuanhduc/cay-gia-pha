import prisma from '~/server/utils/prisma'
import { verifyPwd } from '~/server/utils/auth'

interface TreeNode {
  id: number
  fullName: string
  gender: string
  birthDate: string | null
  deathDate: string | null
  isAlive: boolean
  avatarUrl: string | null
  generation: number
  birthOrder: number
  spouses: { id: number; fullName: string; avatarUrl: string | null; gender: string; birthDate: string | null; deathDate: string | null; isAlive: boolean }[]
  children: TreeNode[]
}

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, message: 'Token không hợp lệ' })
  }

  const familyLine = await prisma.familyLine.findUnique({
    where: { shareToken: token },
  })

  if (!familyLine || !familyLine.isPublic) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy hoặc chưa được chia sẻ' })
  }

  // Check password if required
  if (familyLine.sharePassword) {
    const query = getQuery(event)
    const password = query.password as string | undefined

    if (!password) {
      return {
        requiresPassword: true,
        familyLineName: familyLine.name,
      }
    }

    const isValid = await verifyPwd(password, familyLine.sharePassword)
    if (!isValid) {
      throw createError({ statusCode: 403, message: 'Mật khẩu không đúng' })
    }
  }

  // Log access
  const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || ''
  const userAgent = getHeader(event, 'user-agent') || ''
  const referer = getHeader(event, 'referer') || ''
  prisma.shareAccessLog.create({
    data: {
      familyLineId: familyLine.id,
      ip: ip.slice(0, 100),
      userAgent: userAgent.slice(0, 500),
      referer: referer.slice(0, 500),
    },
  }).catch(() => {}) // fire-and-forget, don't block response

  // Build tree data (reuse pattern from tree.get.ts)
  const members = await prisma.member.findMany({
    where: { familyLineId: familyLine.id },
    include: {
      spousesAsA: {
        include: {
          memberB: {
            select: { id: true, fullName: true, avatarUrl: true, gender: true, birthDate: true, deathDate: true, isAlive: true },
          },
        },
      },
      spousesAsB: {
        include: {
          memberA: {
            select: { id: true, fullName: true, avatarUrl: true, gender: true, birthDate: true, deathDate: true, isAlive: true },
          },
        },
      },
    },
    orderBy: [{ generation: 'asc' }, { birthOrder: 'asc' }],
  })

  function buildNode(member: typeof members[0]): TreeNode {
    const children = members
      .filter((m) => m.fatherId === member.id)
      .sort((a, b) => a.birthOrder - b.birthOrder)
      .map((child) => buildNode(child))

    const spouses = [
      ...member.spousesAsA.map((s) => s.memberB),
      ...member.spousesAsB.map((s) => s.memberA),
    ]

    return {
      id: member.id,
      fullName: member.fullName,
      gender: member.gender,
      birthDate: member.birthDate?.toISOString() || null,
      deathDate: member.deathDate?.toISOString() || null,
      isAlive: member.isAlive,
      avatarUrl: member.avatarUrl,
      generation: member.generation,
      birthOrder: member.birthOrder,
      spouses: spouses as any,
      children,
    }
  }

  // Find roots: males with no fatherId (patriarchs)
  const roots = members.filter((m) => !m.fatherId && m.gender === 'male')

  // If no male roots, fallback to anyone without a father
  const treeRoots = roots.length > 0 ? roots : members.filter((m) => !m.fatherId)

  const tree = treeRoots.map((root) => buildNode(root))

  return {
    familyLine: {
      id: familyLine.id,
      name: familyLine.name,
      description: familyLine.description,
      originPlace: familyLine.originPlace,
    },
    tree,
    totalMembers: members.length,
  }
})
