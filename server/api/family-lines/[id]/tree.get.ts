import prisma from '~/server/utils/prisma'
import { checkFamilyLineAccess } from '~/server/utils/familyLineAccess'

interface TreeNode {
  id: number
  fullName: string
  gender: string
  birthDate: string | null
  deathDate: string | null
  isAlive: boolean
  birthPlace: string | null
  bio: string | null
  deathAnniversaryLunar: string | null
  deathAnniversaryNote: string | null
  avatarUrl: string | null
  generation: number
  birthOrder: number
  fatherName: string | null
  motherName: string | null
  childrenCount: number
  spouses: {
    id: number
    fullName: string
    avatarUrl: string | null
    gender: string
    birthDate: string | null
    deathDate: string | null
    isAlive: boolean
    bio: string | null
    birthPlace: string | null
    marriedDate: string | null
  }[]
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
            select: { id: true, fullName: true, avatarUrl: true, gender: true, birthDate: true, deathDate: true, isAlive: true, bio: true, birthPlace: true },
          },
        },
      },
      spousesAsB: {
        include: {
          memberA: {
            select: { id: true, fullName: true, avatarUrl: true, gender: true, birthDate: true, deathDate: true, isAlive: true, bio: true, birthPlace: true },
          },
        },
      },
    },
    orderBy: [{ generation: 'asc' }, { birthOrder: 'asc' }],
  })

  // O(1) lookup maps
  const memberMap = new Map<number, typeof members[0]>()
  for (const m of members) memberMap.set(m.id, m)

  const childrenMap = new Map<number, typeof members>()
  for (const m of members) {
    if (m.fatherId) {
      if (!childrenMap.has(m.fatherId)) childrenMap.set(m.fatherId, [])
      childrenMap.get(m.fatherId)!.push(m)
    }
  }

  // Build tree recursively
  function buildNode(member: typeof members[0]): TreeNode {
    const childList = (childrenMap.get(member.id) ?? [])
      .sort((a, b) => a.birthOrder - b.birthOrder)

    const children = childList.map((child) => buildNode(child))

    const spouses = [
      ...member.spousesAsA.map((s) => ({
        id: s.memberB.id,
        fullName: s.memberB.fullName,
        avatarUrl: s.memberB.avatarUrl,
        gender: s.memberB.gender,
        birthDate: s.memberB.birthDate?.toISOString() || null,
        deathDate: s.memberB.deathDate?.toISOString() || null,
        isAlive: s.memberB.isAlive,
        bio: s.memberB.bio || null,
        birthPlace: s.memberB.birthPlace || null,
        marriedDate: s.marriedDate?.toISOString() || null,
      })),
      ...member.spousesAsB.map((s) => ({
        id: s.memberA.id,
        fullName: s.memberA.fullName,
        avatarUrl: s.memberA.avatarUrl,
        gender: s.memberA.gender,
        birthDate: s.memberA.birthDate?.toISOString() || null,
        deathDate: s.memberA.deathDate?.toISOString() || null,
        isAlive: s.memberA.isAlive,
        bio: s.memberA.bio || null,
        birthPlace: s.memberA.birthPlace || null,
        marriedDate: s.marriedDate?.toISOString() || null,
      })),
    ]

    const father = member.fatherId ? memberMap.get(member.fatherId) : null
    const mother = member.motherId ? memberMap.get(member.motherId) : null

    return {
      id: member.id,
      fullName: member.fullName,
      gender: member.gender,
      birthDate: member.birthDate?.toISOString() || null,
      deathDate: member.deathDate?.toISOString() || null,
      isAlive: member.isAlive,
      birthPlace: member.birthPlace || null,
      bio: member.bio || null,
      deathAnniversaryLunar: member.deathAnniversaryLunar || null,
      deathAnniversaryNote: member.deathAnniversaryNote || null,
      avatarUrl: member.avatarUrl,
      generation: member.generation,
      birthOrder: member.birthOrder,
      fatherName: father?.fullName || null,
      motherName: mother?.fullName || null,
      childrenCount: childList.length,
      spouses,
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
