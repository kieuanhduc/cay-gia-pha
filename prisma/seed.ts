import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'Quản trị viên',
      role: 'admin',
    },
  })
  console.log('Admin user created: admin / admin123')

  // Create sample family line
  const familyLine = await prisma.familyLine.create({
    data: {
      name: 'Dòng họ Nguyễn - Hà Nội',
      description: 'Gia phả dòng họ Nguyễn tại Hà Nội, ghi chép từ đời thứ nhất.',
      originPlace: 'Hà Nội, Việt Nam',
    },
  })

  // Create sample members - 4 generations
  const ongCo = await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Nguyễn Văn Tổ',
      gender: 'male',
      birthDate: new Date('1900-01-15'),
      deathDate: new Date('1975-06-20'),
      isAlive: false,
      birthPlace: 'Hà Nội',
      bio: 'Cụ tổ đời thứ nhất của dòng họ Nguyễn.',
      generation: 1,
      birthOrder: 1,
    },
  })

  const baCo = await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Trần Thị Huệ',
      gender: 'female',
      birthDate: new Date('1905-03-10'),
      deathDate: new Date('1980-12-01'),
      isAlive: false,
      birthPlace: 'Hà Nam',
      bio: 'Vợ cụ Nguyễn Văn Tổ.',
      generation: 1,
      birthOrder: 1,
    },
  })

  // Spouse relationship
  await prisma.spouse.create({
    data: { memberAId: ongCo.id, memberBId: baCo.id },
  })

  // Generation 2
  const ongNoi = await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Nguyễn Văn Đức',
      gender: 'male',
      birthDate: new Date('1930-05-20'),
      deathDate: new Date('2005-08-15'),
      isAlive: false,
      birthPlace: 'Hà Nội',
      bio: 'Con trai trưởng của cụ Nguyễn Văn Tổ.',
      generation: 2,
      birthOrder: 1,
      fatherId: ongCo.id,
      motherId: baCo.id,
    },
  })

  const baNoi = await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Lê Thị Mai',
      gender: 'female',
      birthDate: new Date('1935-09-12'),
      isAlive: false,
      deathDate: new Date('2018-03-05'),
      birthPlace: 'Hải Dương',
      generation: 2,
      birthOrder: 1,
    },
  })

  await prisma.spouse.create({
    data: { memberAId: ongNoi.id, memberBId: baNoi.id },
  })

  const chuHai = await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Nguyễn Văn Hải',
      gender: 'male',
      birthDate: new Date('1933-11-08'),
      deathDate: new Date('2010-04-22'),
      isAlive: false,
      birthPlace: 'Hà Nội',
      bio: 'Con trai thứ hai của cụ Nguyễn Văn Tổ.',
      generation: 2,
      birthOrder: 2,
      fatherId: ongCo.id,
      motherId: baCo.id,
    },
  })

  // Generation 3
  const boBinh = await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Nguyễn Văn Bình',
      gender: 'male',
      birthDate: new Date('1960-02-14'),
      isAlive: true,
      birthPlace: 'Hà Nội',
      bio: 'Con trai trưởng của ông Nguyễn Văn Đức.',
      generation: 3,
      birthOrder: 1,
      fatherId: ongNoi.id,
      motherId: baNoi.id,
    },
  })

  const meBinh = await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Phạm Thị Lan',
      gender: 'female',
      birthDate: new Date('1963-07-25'),
      isAlive: true,
      birthPlace: 'Nam Định',
      generation: 3,
      birthOrder: 1,
    },
  })

  await prisma.spouse.create({
    data: { memberAId: boBinh.id, memberBId: meBinh.id },
  })

  const coNga = await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Nguyễn Thị Nga',
      gender: 'female',
      birthDate: new Date('1965-04-30'),
      isAlive: true,
      birthPlace: 'Hà Nội',
      generation: 3,
      birthOrder: 2,
      fatherId: ongNoi.id,
      motherId: baNoi.id,
    },
  })

  // Generation 4
  await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Nguyễn Minh Tuấn',
      gender: 'male',
      birthDate: new Date('1990-08-12'),
      isAlive: true,
      birthPlace: 'Hà Nội',
      generation: 4,
      birthOrder: 1,
      fatherId: boBinh.id,
      motherId: meBinh.id,
    },
  })

  await prisma.member.create({
    data: {
      familyLineId: familyLine.id,
      fullName: 'Nguyễn Thị Hương',
      gender: 'female',
      birthDate: new Date('1993-12-05'),
      isAlive: true,
      birthPlace: 'Hà Nội',
      generation: 4,
      birthOrder: 2,
      fatherId: boBinh.id,
      motherId: meBinh.id,
    },
  })

  console.log('Sample family line and members created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
