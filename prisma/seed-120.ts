/**
 * Seed ~120 members across 5 generations để test layout xuất cây gia phả.
 * Run: npx tsx prisma/seed-120.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function rndDate(year: number): Date {
  return new Date(`${year}-${String(rnd(1, 12)).padStart(2, '0')}-${String(rnd(1, 28)).padStart(2, '0')}`)
}
function pick<T>(arr: T[]): T {
  return arr[rnd(0, arr.length - 1)]
}

const maleNames = [
  'Văn An', 'Văn Bình', 'Văn Cường', 'Hữu Dũng', 'Quốc Em',
  'Văn Phong', 'Hữu Giang', 'Quốc Hùng', 'Văn Kiên', 'Đức Long',
  'Văn Minh', 'Quốc Nam', 'Hữu Phúc', 'Văn Quang', 'Đức Sơn',
  'Văn Thành', 'Hữu Tiến', 'Quốc Tùng', 'Văn Vinh', 'Đức Nghĩa',
  'Bá Đức', 'Trọng Nhân', 'Công Mạnh', 'Thế Tài', 'Bá Quý',
  'Văn Tân', 'Hữu Thiện', 'Quốc Thắng', 'Đức Tuấn', 'Thế Hào',
]
const femaleNames = [
  'Thị Hoa', 'Thị Lan', 'Thị Mai', 'Thị Ngọc', 'Thị Oanh',
  'Thị Phương', 'Thị Quỳnh', 'Thị Sen', 'Thị Thúy', 'Thị Uyên',
  'Thị Vân', 'Thị Xuân', 'Thị Yến', 'Thị Ánh', 'Thị Bích',
  'Thị Chi', 'Thị Duyên', 'Thị Giang', 'Thị Hương', 'Thị Linh',
  'Thị Lệ', 'Thị My', 'Thị Nhung', 'Thị Nhi', 'Thị Nga',
  'Thị Loan', 'Thị Kim', 'Thị Hiền', 'Thị Hạnh', 'Thị Dung',
]
const wifeLastNames = [
  'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi',
  'Đỗ', 'Ngô', 'Dương', 'Hồ', 'Đinh', 'Mai', 'Cao', 'Võ',
  'Châu', 'Tô', 'Hà', 'Nguyễn',
]
const places = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Ninh Bình',
  'Nam Định', 'Thái Bình', 'Hưng Yên', 'Hải Dương', 'Thanh Hóa',
  'Nghệ An', 'Huế', 'Bình Định', 'Đồng Nai', 'Bắc Ninh',
  'Quảng Ninh', 'Hà Nam', 'Vĩnh Phúc', 'Bắc Giang', 'Thái Nguyên',
]
const bios = [
  'Người có công lớn trong việc gây dựng gia nghiệp.',
  'Cả đời cần cù, chịu khó, được hàng xóm kính trọng.',
  'Người con hiếu thảo, luôn chăm lo cho gia đình.',
  'Có học thức cao, đóng góp nhiều cho địa phương.',
  'Người dũng cảm, từng tham gia kháng chiến bảo vệ đất nước.',
  'Nổi tiếng là người tốt bụng, hay giúp đỡ bà con.',
  'Giỏi nghề nông, có tiếng trong vùng về kinh nghiệm canh tác.',
  'Thầy giáo làng, dạy chữ cho nhiều thế hệ con em trong xóm.',
  'Người phụ nữ tần tảo, một mình nuôi dạy các con nên người.',
  'Trưởng họ nhiều năm, có uy tín và được mọi người tin tưởng.',
]

const usedMaleNames = new Set<string>()
function getMaleName(): string {
  let name: string
  let tries = 0
  do {
    name = pick(maleNames)
    tries++
  } while (usedMaleNames.has(name) && tries < 50)
  usedMaleNames.add(name)
  return name
}

const usedFemaleNames = new Set<string>()
function getFemaleName(lastName: string): string {
  let fname: string
  let tries = 0
  do {
    fname = pick(femaleNames)
    tries++
  } while (usedFemaleNames.has(lastName + fname) && tries < 50)
  usedFemaleNames.add(lastName + fname)
  return `${lastName} ${fname}`
}

async function createMale(
  familyLineId: number,
  gen: number,
  order: number,
  birthYear: number,
  isAlive: boolean,
  fatherId?: number,
  motherId?: number,
): Promise<number> {
  const member = await prisma.member.create({
    data: {
      familyLineId,
      fullName: `Lý ${getMaleName()}`,
      gender: 'male',
      birthDate: rndDate(birthYear),
      deathDate: isAlive ? null : rndDate(birthYear + rnd(55, 80)),
      isAlive,
      birthPlace: pick(places),
      bio: Math.random() > 0.4 ? pick(bios) : null,
      deathAnniversaryLunar: isAlive ? null : `${rnd(1, 29)}/${rnd(1, 12)}`,
      deathAnniversaryNote: !isAlive && Math.random() > 0.6 ? 'Cúng giỗ tại nhà thờ họ' : null,
      generation: gen,
      birthOrder: order,
      fatherId: fatherId ?? null,
      motherId: motherId ?? null,
    },
  })
  return member.id
}

async function createWife(
  familyLineId: number,
  gen: number,
  order: number,
  birthYear: number,
  isAlive: boolean,
  husbandId: number,
  marriedYear: number,
): Promise<void> {
  const lastName = pick(wifeLastNames)
  const wife = await prisma.member.create({
    data: {
      familyLineId,
      fullName: getFemaleName(lastName),
      gender: 'female',
      birthDate: rndDate(birthYear),
      deathDate: isAlive ? null : rndDate(birthYear + rnd(55, 80)),
      isAlive,
      birthPlace: pick(places),
      bio: Math.random() > 0.5 ? pick(bios) : null,
      deathAnniversaryLunar: isAlive ? null : `${rnd(1, 29)}/${rnd(1, 12)}`,
      generation: gen,
      birthOrder: order,
    },
  })

  await prisma.spouse.create({
    data: {
      memberAId: husbandId,
      memberBId: wife.id,
      marriedDate: rndDate(marriedYear),
      isActive: true,
    },
  })
}

async function main() {
  console.log('Tạo dòng họ test 120 người...')

  const familyLine = await prisma.familyLine.create({
    data: {
      name: 'Dòng họ Lý - Thanh Hóa (Test 120)',
      description: 'Dữ liệu test layout 5 đời, ~120 thành viên.',
      originPlace: 'Thanh Hóa, Việt Nam',
      isPublic: true,
    },
  })
  const flId = familyLine.id

  // ── ĐỜI 1 ────────────────────────────────────────────────────────────────
  const g1 = await createMale(flId, 1, 1, 1890, false)
  await createWife(flId, 1, 1, 1893, false, g1, 1912)
  console.log('Đời 1: 1 nam + 1 vợ')

  // ── ĐỜI 2 (5 con trai của g1) ─────────────────────────────────────────────
  const g2: number[] = []
  for (let i = 0; i < 5; i++) {
    const id = await createMale(flId, 2, i + 1, 1915 + rnd(-3, 5), false, g1)
    await createWife(flId, 2, i + 1, 1918 + rnd(-3, 5), false, id, 1938 + rnd(0, 5))
    g2.push(id)
  }
  console.log('Đời 2: 5 nam + 5 vợ')

  // ── ĐỜI 3 (4 con trai cho mỗi người đời 2 = 20) ──────────────────────────
  const g3: number[] = []
  for (let p = 0; p < g2.length; p++) {
    for (let i = 0; i < 4; i++) {
      const id = await createMale(flId, 3, i + 1, 1943 + rnd(-3, 5), false, g2[p])
      await createWife(flId, 3, i + 1, 1945 + rnd(-3, 5), false, id, 1965 + rnd(0, 7))
      g3.push(id)
    }
  }
  console.log('Đời 3: 20 nam + 20 vợ')

  // ── ĐỜI 4 (g3[0-9] có 2 con, g3[10-19] có 1 con = 30) ───────────────────
  const g4: number[] = []
  for (let p = 0; p < g3.length; p++) {
    const numSons = p < 10 ? 2 : 1
    for (let i = 0; i < numSons; i++) {
      const id = await createMale(flId, 4, i + 1, 1968 + rnd(-3, 5), true, g3[p])
      // 26 trong 30 người có vợ
      if (g4.length < 26) {
        await createWife(flId, 4, i + 1, 1970 + rnd(-3, 5), true, id, 1993 + rnd(0, 8))
      }
      g4.push(id)
    }
  }
  console.log(`Đời 4: ${g4.length} nam + 26 vợ`)

  // ── ĐỜI 5 (g4[0-7] mỗi người 1 con trai = 8) ────────────────────────────
  const g5: number[] = []
  for (let p = 0; p < 8; p++) {
    const id = await createMale(flId, 5, 1, 1998 + rnd(-3, 5), true, g4[p])
    // 4 người đầu đã có vợ
    if (p < 4) {
      await createWife(flId, 5, 1, 2000 + rnd(-3, 5), true, id, 2022 + rnd(0, 3))
    }
    g5.push(id)
  }
  console.log('Đời 5: 8 nam + 4 vợ')

  // ── Tổng kết ──────────────────────────────────────────────────────────────
  const total = await prisma.member.count({ where: { familyLineId: flId } })
  const spouseCount = await prisma.spouse.count({
    where: { memberA: { familyLineId: flId } },
  })
  console.log(`\nHoàn tất! Family line ID: ${flId}`)
  console.log(`Tổng thành viên: ${total} | Cặp vợ chồng: ${spouseCount}`)
  console.log(`URL: http://localhost:3000/tree/${flId}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
