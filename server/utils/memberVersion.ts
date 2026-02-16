import type { Member } from '@prisma/client'

type TxClient = Parameters<Parameters<typeof import('~/server/utils/prisma').default.$transaction>[0]>[0]

export async function createMemberSnapshot(
  tx: TxClient,
  member: Member,
  auth: { userId: number; username: string },
  changeType: 'create' | 'update' | 'revert' = 'update'
) {
  const lastVersion = await tx.memberVersion.findFirst({
    where: { memberId: member.id },
    orderBy: { version: 'desc' },
    select: { version: true },
  })

  return tx.memberVersion.create({
    data: {
      memberId: member.id,
      version: (lastVersion?.version ?? 0) + 1,
      fullName: member.fullName,
      gender: member.gender,
      birthDate: member.birthDate,
      deathDate: member.deathDate,
      isAlive: member.isAlive,
      birthPlace: member.birthPlace,
      avatarUrl: member.avatarUrl,
      bio: member.bio,
      generation: member.generation,
      birthOrder: member.birthOrder,
      fatherId: member.fatherId,
      motherId: member.motherId,
      changedBy: auth.userId,
      changedByName: auth.username,
      changeType,
    },
  })
}
