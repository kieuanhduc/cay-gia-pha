import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Vietnamese name pools
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ']
const maleMiddle = ['Văn', 'Đức', 'Minh', 'Quốc', 'Hữu', 'Thanh', 'Công', 'Đình']
const femaleMiddle = ['Thị', 'Ngọc', 'Thanh', 'Phương']
const maleFirst = ['Hùng', 'Dũng', 'Tuấn', 'Thành', 'Long', 'Phong', 'Quân', 'Đạt', 'Khoa', 'Kiên', 'Hoàng', 'Nam', 'Bảo', 'Trí', 'Huy', 'Sơn', 'Tùng', 'An', 'Vinh', 'Khánh']
const femaleFirst = ['Hoa', 'Lan', 'Mai', 'Hương', 'Linh', 'Trang', 'Ngọc', 'Thu', 'Hà', 'Yến', 'Thanh', 'Phượng', 'Diệu', 'Ánh', 'Thảo', 'Vy', 'Nhi', 'Trinh', 'Duyên', 'Châu']
const places = ['Hà Nội', 'Hải Dương', 'Nam Định', 'Ninh Bình', 'Bắc Ninh', 'Hưng Yên', 'Thái Bình', 'Hà Nam']

let nameIdx = 0
function randomMaleName(surname: string): string {
  const mid = maleMiddle[nameIdx % maleMiddle.length]
  const first = maleFirst[nameIdx % maleFirst.length]
  nameIdx++
  return `${surname} ${mid} ${first}`
}
function randomFemaleName(): string {
  const ln = lastNames[nameIdx % lastNames.length]
  const mid = femaleMiddle[nameIdx % femaleMiddle.length]
  const first = femaleFirst[nameIdx % femaleFirst.length]
  nameIdx++
  return `${ln} ${mid} ${first}`
}
function randomPlace(): string {
  return places[Math.floor(Math.random() * places.length)]
}

async function main() {
  // Clean existing data
  await prisma.spouse.deleteMany()
  await prisma.member.deleteMany()
  await prisma.familyLine.deleteMany()

  // Ensure admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword, fullName: 'Quản trị viên', role: 'admin' },
  })

  const familyLine = await prisma.familyLine.create({
    data: {
      name: 'Dòng họ Nguyễn Đức - Hà Nội',
      description: 'Gia phả dòng họ Nguyễn Đức, ghi chép 7 đời từ thế kỷ 19.',
      originPlace: 'Hà Nội, Việt Nam',
    },
  })

  const flId = familyLine.id
  const surname = 'Nguyễn'

  // Helper to create member + spouse
  async function createCouple(
    maleName: string, gen: number, birthOrder: number,
    birthYear: number, fatherId?: number, motherId?: number,
    maleAlive = false, femaleAlive = false,
  ) {
    const male = await prisma.member.create({
      data: {
        familyLineId: flId, fullName: maleName, gender: 'male',
        birthDate: new Date(`${birthYear}-${String(Math.ceil(Math.random() * 12)).padStart(2, '0')}-${String(Math.ceil(Math.random() * 28)).padStart(2, '0')}`),
        deathDate: maleAlive ? null : new Date(`${birthYear + 55 + Math.floor(Math.random() * 25)}-01-01`),
        isAlive: maleAlive, birthPlace: randomPlace(), generation: gen, birthOrder,
        fatherId: fatherId || undefined, motherId: motherId || undefined,
      },
    })
    const femaleName = randomFemaleName()
    const female = await prisma.member.create({
      data: {
        familyLineId: flId, fullName: femaleName, gender: 'female',
        birthDate: new Date(`${birthYear + 2}-01-01`),
        deathDate: femaleAlive ? null : new Date(`${birthYear + 60 + Math.floor(Math.random() * 20)}-01-01`),
        isAlive: femaleAlive, birthPlace: randomPlace(), generation: gen, birthOrder: 1,
      },
    })
    await prisma.spouse.create({ data: { memberAId: male.id, memberBId: female.id } })
    return { male, female }
  }

  // Also create single males (no spouse)
  async function createSingleMale(
    maleName: string, gen: number, birthOrder: number,
    birthYear: number, fatherId: number, motherId: number,
    alive = false,
  ) {
    return prisma.member.create({
      data: {
        familyLineId: flId, fullName: maleName, gender: 'male',
        birthDate: new Date(`${birthYear}-06-15`),
        deathDate: alive ? null : new Date(`${birthYear + 60}-01-01`),
        isAlive: alive, birthPlace: randomPlace(), generation: gen, birthOrder,
        fatherId, motherId,
      },
    })
  }

  // Create single females
  async function createSingleFemale(
    gen: number, birthOrder: number,
    birthYear: number, fatherId: number, motherId: number,
    alive = false,
  ) {
    return prisma.member.create({
      data: {
        familyLineId: flId, fullName: randomFemaleName(), gender: 'female',
        birthDate: new Date(`${birthYear}-03-10`),
        deathDate: alive ? null : new Date(`${birthYear + 65}-01-01`),
        isAlive: alive, birthPlace: randomPlace(), generation: gen, birthOrder,
        fatherId, motherId,
      },
    })
  }

  console.log('Creating 7-generation family tree...')

  // ===== ĐỜI 1 =====
  const doi1 = await createCouple(randomMaleName(surname), 1, 1, 1850)

  // ===== ĐỜI 2 (3 con trai) =====
  const doi2a = await createCouple(randomMaleName(surname), 2, 1, 1880, doi1.male.id, doi1.female.id)
  const doi2b = await createCouple(randomMaleName(surname), 2, 2, 1883, doi1.male.id, doi1.female.id)
  const doi2c = await createCouple(randomMaleName(surname), 2, 3, 1886, doi1.male.id, doi1.female.id)

  // ===== ĐỜI 3 =====
  // Nhánh 2a: 4 con (3 trai 1 gái)
  const doi3a1 = await createCouple(randomMaleName(surname), 3, 1, 1908, doi2a.male.id, doi2a.female.id)
  const doi3a2 = await createCouple(randomMaleName(surname), 3, 2, 1911, doi2a.male.id, doi2a.female.id)
  const doi3a3 = await createSingleMale(randomMaleName(surname), 3, 3, 1914, doi2a.male.id, doi2a.female.id)
  await createSingleFemale(3, 4, 1916, doi2a.male.id, doi2a.female.id)

  // Nhánh 2b: 3 con (2 trai 1 gái)
  const doi3b1 = await createCouple(randomMaleName(surname), 3, 1, 1910, doi2b.male.id, doi2b.female.id)
  const doi3b2 = await createCouple(randomMaleName(surname), 3, 2, 1913, doi2b.male.id, doi2b.female.id)
  await createSingleFemale(3, 3, 1915, doi2b.male.id, doi2b.female.id)

  // Nhánh 2c: 2 con trai
  const doi3c1 = await createCouple(randomMaleName(surname), 3, 1, 1912, doi2c.male.id, doi2c.female.id)
  const doi3c2 = await createCouple(randomMaleName(surname), 3, 2, 1915, doi2c.male.id, doi2c.female.id)

  // ===== ĐỜI 4 =====
  // Từ doi3a1: 3 con
  const doi4a1 = await createCouple(randomMaleName(surname), 4, 1, 1935, doi3a1.male.id, doi3a1.female.id)
  const doi4a2 = await createCouple(randomMaleName(surname), 4, 2, 1938, doi3a1.male.id, doi3a1.female.id)
  await createSingleFemale(4, 3, 1940, doi3a1.male.id, doi3a1.female.id)

  // Từ doi3a2: 2 con
  const doi4a3 = await createCouple(randomMaleName(surname), 4, 1, 1938, doi3a2.male.id, doi3a2.female.id)
  await createSingleMale(randomMaleName(surname), 4, 2, 1941, doi3a2.male.id, doi3a2.female.id)

  // Từ doi3b1: 3 con
  const doi4b1 = await createCouple(randomMaleName(surname), 4, 1, 1937, doi3b1.male.id, doi3b1.female.id)
  const doi4b2 = await createCouple(randomMaleName(surname), 4, 2, 1940, doi3b1.male.id, doi3b1.female.id)
  await createSingleFemale(4, 3, 1942, doi3b1.male.id, doi3b1.female.id)

  // Từ doi3b2: 2 con
  const doi4b3 = await createCouple(randomMaleName(surname), 4, 1, 1940, doi3b2.male.id, doi3b2.female.id)

  // Từ doi3c1: 2 con
  const doi4c1 = await createCouple(randomMaleName(surname), 4, 1, 1939, doi3c1.male.id, doi3c1.female.id)
  const doi4c2 = await createCouple(randomMaleName(surname), 4, 2, 1942, doi3c1.male.id, doi3c1.female.id)

  // Từ doi3c2: 2 con
  const doi4c3 = await createCouple(randomMaleName(surname), 4, 1, 1942, doi3c2.male.id, doi3c2.female.id)

  // ===== ĐỜI 5 =====
  // Từ doi4a1: 2 con
  const doi5a1 = await createCouple(randomMaleName(surname), 5, 1, 1962, doi4a1.male.id, doi4a1.female.id, true, true)
  await createSingleFemale(5, 2, 1965, doi4a1.male.id, doi4a1.female.id, true)

  // Từ doi4a2: 3 con
  const doi5a2 = await createCouple(randomMaleName(surname), 5, 1, 1965, doi4a2.male.id, doi4a2.female.id, true, true)
  const doi5a3 = await createCouple(randomMaleName(surname), 5, 2, 1968, doi4a2.male.id, doi4a2.female.id, true, true)
  await createSingleFemale(5, 3, 1970, doi4a2.male.id, doi4a2.female.id, true)

  // Từ doi4a3: 2 con
  const doi5a4 = await createCouple(randomMaleName(surname), 5, 1, 1966, doi4a3.male.id, doi4a3.female.id, true, true)

  // Từ doi4b1: 2 con
  const doi5b1 = await createCouple(randomMaleName(surname), 5, 1, 1964, doi4b1.male.id, doi4b1.female.id, true, true)
  const doi5b2 = await createCouple(randomMaleName(surname), 5, 2, 1967, doi4b1.male.id, doi4b1.female.id, true, true)

  // Từ doi4b2: 2 con
  const doi5b3 = await createCouple(randomMaleName(surname), 5, 1, 1967, doi4b2.male.id, doi4b2.female.id, true, true)

  // Từ doi4b3: 1 con
  const doi5b4 = await createCouple(randomMaleName(surname), 5, 1, 1968, doi4b3.male.id, doi4b3.female.id, true, true)

  // Từ doi4c1: 2 con
  const doi5c1 = await createCouple(randomMaleName(surname), 5, 1, 1966, doi4c1.male.id, doi4c1.female.id, true, true)
  const doi5c2 = await createCouple(randomMaleName(surname), 5, 2, 1969, doi4c1.male.id, doi4c1.female.id, true, true)

  // Từ doi4c2: 1 con
  const doi5c3 = await createCouple(randomMaleName(surname), 5, 1, 1970, doi4c2.male.id, doi4c2.female.id, true, true)

  // Từ doi4c3: 2 con
  const doi5c4 = await createCouple(randomMaleName(surname), 5, 1, 1969, doi4c3.male.id, doi4c3.female.id, true, true)

  // ===== ĐỜI 6 =====
  const doi6a1 = await createCouple(randomMaleName(surname), 6, 1, 1990, doi5a1.male.id, doi5a1.female.id, true, true)
  await createSingleMale(randomMaleName(surname), 6, 2, 1993, doi5a1.male.id, doi5a1.female.id, true)

  const doi6a2 = await createCouple(randomMaleName(surname), 6, 1, 1992, doi5a2.male.id, doi5a2.female.id, true, true)
  await createSingleFemale(6, 2, 1995, doi5a2.male.id, doi5a2.female.id, true)

  await createCouple(randomMaleName(surname), 6, 1, 1995, doi5a3.male.id, doi5a3.female.id, true, true)

  await createCouple(randomMaleName(surname), 6, 1, 1993, doi5a4.male.id, doi5a4.female.id, true, true)

  const doi6b1 = await createCouple(randomMaleName(surname), 6, 1, 1991, doi5b1.male.id, doi5b1.female.id, true, true)
  await createSingleFemale(6, 2, 1994, doi5b1.male.id, doi5b1.female.id, true)

  await createCouple(randomMaleName(surname), 6, 1, 1994, doi5b2.male.id, doi5b2.female.id, true, true)

  await createCouple(randomMaleName(surname), 6, 1, 1994, doi5b3.male.id, doi5b3.female.id, true, true)
  await createCouple(randomMaleName(surname), 6, 1, 1995, doi5b4.male.id, doi5b4.female.id, true, true)

  await createCouple(randomMaleName(surname), 6, 1, 1993, doi5c1.male.id, doi5c1.female.id, true, true)
  await createCouple(randomMaleName(surname), 6, 1, 1996, doi5c2.male.id, doi5c2.female.id, true, true)
  await createCouple(randomMaleName(surname), 6, 1, 1997, doi5c3.male.id, doi5c3.female.id, true, true)
  await createCouple(randomMaleName(surname), 6, 1, 1996, doi5c4.male.id, doi5c4.female.id, true, true)

  // ===== ĐỜI 7 (thế hệ trẻ nhất) =====
  await prisma.member.create({
    data: {
      familyLineId: flId, fullName: randomMaleName(surname), gender: 'male',
      birthDate: new Date('2018-05-10'), isAlive: true, birthPlace: 'Hà Nội',
      generation: 7, birthOrder: 1, fatherId: doi6a1.male.id, motherId: doi6a1.female.id,
    },
  })
  await prisma.member.create({
    data: {
      familyLineId: flId, fullName: randomFemaleName(), gender: 'female',
      birthDate: new Date('2020-09-22'), isAlive: true, birthPlace: 'Hà Nội',
      generation: 7, birthOrder: 2, fatherId: doi6a1.male.id, motherId: doi6a1.female.id,
    },
  })
  await prisma.member.create({
    data: {
      familyLineId: flId, fullName: randomMaleName(surname), gender: 'male',
      birthDate: new Date('2019-03-15'), isAlive: true, birthPlace: 'Hà Nội',
      generation: 7, birthOrder: 1, fatherId: doi6a2.male.id, motherId: doi6a2.female.id,
    },
  })
  await prisma.member.create({
    data: {
      familyLineId: flId, fullName: randomMaleName(surname), gender: 'male',
      birthDate: new Date('2020-01-08'), isAlive: true, birthPlace: 'Hải Dương',
      generation: 7, birthOrder: 1, fatherId: doi6b1.male.id, motherId: doi6b1.female.id,
    },
  })

  const count = await prisma.member.count({ where: { familyLineId: flId } })
  console.log(`Done! Created ${count} members across 7 generations.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
