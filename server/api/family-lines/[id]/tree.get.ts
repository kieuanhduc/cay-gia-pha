import prisma from '~/server/utils/prisma'
import { checkFamilyLineAccess } from '~/server/utils/familyLineAccess'

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
  const familyLineId = Number(getRouterParam(event, 'id'))

  await checkFamilyLineAccess(event, familyLineId)

  const familyLine = await prisma.familyLine.findUnique({
    where: { id: familyLineId },
    select: { id: true, name: true, isPublic: true, shareToken: true },
  })

  if (!familyLine) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy dòng họ' })
  }

  const members = await prisma.member.findMany({
    where: { familyLineId },
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

  // Build tree recursively
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

  return { familyLine, tree, totalMembers: members.length }
})
