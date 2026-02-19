import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding content data...')

  // 1. Seed Tin tức (News)
  const newsData = [
    {
      type: 'news' as const,
      title: 'Lễ Tổng kết năm 2025 họ Nguyễn',
      slug: 'le-tong-ket-nam-2025-ho-nguyen',
      excerpt: 'Tổng kết một năm hoạt động của dòng họ, vinh danh con em có thành tích xuất sắc trong học tập và công tác.',
      content: `
        <h2>Lễ Tổng kết năm 2025</h2>
        <p>Ngày 28/12/2025, tại Nhà văn hóa xã, dòng họ Nguyễn đã tổ chức buổi lễ tổng kết năm 2025 với sự tham gia của hơn 200 thành viên trong dòng họ.</p>
        
        <h3>Nội dung chương trình</h3>
        <ul>
          <li>Báo cáo tổng kết hoạt động năm 2025</li>
          <li>Vinh danh học sinh, sinh viên có thành tích xuất sắc</li>
          <li>Trao học bổng cho con em nghèo vượt khó</li>
          <li>Văn nghệ, giao lưu</li>
        </ul>

        <p>Chương trình đã diễn ra thành công tốt đẹp, tạo không khí đoàn kết, gắn bó trong dòng họ.</p>
      `,
      published: true,
      authorName: 'Ban Tổ chức',
    },
    {
      type: 'news' as const,
      title: 'Khởi công xây dựng Nhà thờ tổ dòng họ Nguyễn',
      slug: 'khoi-cong-xay-dung-nha-tho-to',
      excerpt: 'Sau nhiều năm vận động, dòng họ đã quyên góp đủ kinh phí để khởi công xây dựng Nhà thờ tổ.',
      content: `
        <h2>Khởi công Nhà thờ tổ</h2>
        <p>Sáng ngày 15/11/2025, trong không khí trang trọng, dòng họ Nguyễn đã tổ chức lễ khởi công xây dựng Nhà thờ tổ tại quê nhà Bắc Ninh.</p>

        <h3>Quy mô công trình</h3>
        <ul>
          <li>Diện tích: 500m²</li>
          <li>Kiến trúc truyền thống kết hợp hiện đại</li>
          <li>Tổng kinh phí: 5 tỷ đồng</li>
          <li>Dự kiến hoàn thành: Tết Nguyên đán 2026</li>
        </ul>

        <p>Đây là công trình ý nghĩa, thể hiện lòng hiếu thảo của con cháu đối với tổ tiên.</p>
      `,
      published: true,
      authorName: 'Ban Xây dựng',
    },
    {
      type: 'news' as const,
      title: 'Ra mắt website Cây Gia Phả điện tử',
      slug: 'ra-mat-website-cay-gia-pha-dien-tu',
      excerpt: 'Dòng họ chính thức ra mắt website quản lý gia phả hiện đại, giúp con cháu dễ dàng tra cứu thông tin tổ tiên.',
      content: `
        <h2>Website Cây Gia Phả</h2>
        <p>Ngày 01/10/2025, dòng họ Nguyễn chính thức ra mắt website Cây Gia Phả điện tử, đánh dấu bước chuyển mình trong việc ứng dụng công nghệ vào công tác gìn giữ truyền thống gia đình.</p>

        <h3>Tính năng nổi bật</h3>
        <ul>
          <li>Hiển thị cây gia phả trực quan, dễ tra cứu</li>
          <li>Quản lý thông tin thành viên đầy đủ</li>
          <li>Nhắc nhở ngày giỗ theo âm lịch</li>
          <li>Tin tức, sự kiện dòng họ</li>
          <li>Album ảnh kỷ niệm</li>
        </ul>

        <p>Website là nơi kết nối các thế hệ, giúp con cháu dù ở xa vẫn có thể tìm hiểu về cội nguồn của mình.</p>
      `,
      published: true,
      authorName: 'Ban Biên tập',
    },
  ]

  for (const news of newsData) {
    await prisma.post.upsert({
      where: { slug: news.slug },
      update: news,
      create: news,
    })
  }
  console.log(`✅ Created ${newsData.length} news posts`)

  // 2. Seed Sự kiện (Events)
  const eventsData = [
    {
      type: 'event' as const,
      title: 'Lễ Giỗ Tổ năm 2026',
      slug: 'le-gio-to-nam-2026',
      excerpt: 'Lễ Giỗ Tổ truyền thống của dòng họ, diễn ra vào ngày 10 tháng 3 âm lịch hàng năm.',
      content: `
        <h2>Lễ Giỗ Tổ năm 2026</h2>
        <p>Kính mời toàn thể con cháu trong dòng họ về dự Lễ Giỗ Tổ năm 2026.</p>

        <h3>Thời gian & Địa điểm</h3>
        <ul>
          <li><strong>Thời gian:</strong> 10/3 âm lịch (08/04/2026 dương lịch)</li>
          <li><strong>Địa điểm:</strong> Nhà thờ tổ, thôn Đông Ngàn, xã Phù Lưu, huyện Từ Sơn, tỉnh Bắc Ninh</li>
        </ul>

        <h3>Chương trình</h3>
        <ul>
          <li>7h00: Đón tiếp con cháu</li>
          <li>8h00: Lễ dâng hương, tế lễ</li>
          <li>9h30: Dùng cơm chay</li>
          <li>11h00: Họp dòng họ, bàn công việc chung</li>
        </ul>

        <p>Rất mong sự có mặt của quý vị!</p>
      `,
      eventDate: new Date('2026-04-08'),
      eventPlace: 'Nhà thờ tổ, Bắc Ninh',
      published: true,
      authorName: 'Ban Tổ chức',
    },
    {
      type: 'event' as const,
      title: 'Họp mặt đầu xuân Bính Ngọ 2026',
      slug: 'hop-mat-dau-xuan-binh-ngo-2026',
      excerpt: 'Gặp gỡ, chúc Tết đầu năm mới, trao học bổng cho con em có thành tích xuất sắc.',
      content: `
        <h2>Họp mặt đầu xuân</h2>
        <p>Dòng họ Nguyễn tổ chức buổi họp mặt đầu xuân Bính Ngọ 2026, chúc Tết và trao học bổng.</p>

        <h3>Thông tin</h3>
        <ul>
          <li><strong>Thời gian:</strong> Mùng 5 Tết Nguyên đán (02/02/2026)</li>
          <li><strong>Địa điểm:</strong> Nhà văn hóa xã Phù Lưu</li>
          <li><strong>Đối tượng:</strong> Toàn thể con cháu trong dòng họ</li>
        </ul>

        <h3>Nội dung</h3>
        <ul>
          <li>Gặp mặt, chúc Tết đầu năm</li>
          <li>Trao 20 suất học bổng cho học sinh nghèo vượt khó</li>
          <li>Văn nghệ, trò chơi dân gian</li>
          <li>Tiệc liên hoan</li>
        </ul>
      `,
      eventDate: new Date('2026-02-02'),
      eventPlace: 'Nhà văn hóa xã Phù Lưu',
      published: true,
      authorName: 'Ban Tổ chức',
    },
    {
      type: 'event' as const,
      title: 'Đại hội dòng họ lần thứ V',
      slug: 'dai-hoi-dong-ho-lan-thu-v',
      excerpt: 'Đại hội 5 năm một lần, bầu Ban Chấp hành nhiệm kỳ mới, thông qua điều lệ và phương hướng hoạt động.',
      content: `
        <h2>Đại hội dòng họ lần thứ V</h2>
        <p>Sau 5 năm hoạt động, dòng họ tổ chức Đại hội lần thứ V để tổng kết và định hướng cho nhiệm kỳ mới.</p>

        <h3>Thời gian & Địa điểm</h3>
        <ul>
          <li><strong>Thời gian:</strong> 15/05/2026</li>
          <li><strong>Địa điểm:</strong> Hội trường UBND xã Phù Lưu</li>
        </ul>

        <h3>Nội dung Đại hội</h3>
        <ul>
          <li>Báo cáo tổng kết nhiệm kỳ 2021-2026</li>
          <li>Phương hướng hoạt động nhiệm kỳ 2026-2031</li>
          <li>Thông qua điều lệ dòng họ (sửa đổi, bổ sung)</li>
          <li>Bầu Ban Chấp hành nhiệm kỳ mới</li>
        </ul>

        <p>Kính mời các đại biểu tham dự đúng giờ!</p>
      `,
      eventDate: new Date('2026-05-15'),
      eventPlace: 'Hội trường UBND xã Phù Lưu',
      published: true,
      authorName: 'Ban Tổ chức',
    },
  ]

  for (const event of eventsData) {
    await prisma.post.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    })
  }
  console.log(`✅ Created ${eventsData.length} event posts`)

  // 3. Seed Nội dung Giới thiệu
  const aboutContent = `
    <h2>Về dòng họ Nguyễn</h2>
    <p>Dòng họ Nguyễn có nguồn gốc từ làng Đông Ngàn, xã Phù Lưu, huyện Từ Sơn, tỉnh Bắc Ninh. Qua hơn 15 đời, dòng họ đã phát triển với hơn 500 thành viên sinh sống khắp cả nước.</p>

    <h3>Lịch sử dòng họ</h3>
    <p>Tổ tiên dòng họ là cụ Nguyễn Văn Thành, sinh năm Canh Thìn (1760), mất năm Ất Mùi (1835). Cụ là người có công khai khẩn đất đai, xây dựng làng mạc, được dân làng suy tôn.</p>
    
    <p>Qua các thế hệ, con cháu cụ luôn giữ gìn truyền thống hiếu học, cần cù, đoàn kết. Nhiều thế hệ con em đã trở thành những con người có ích cho xã hội.</p>

    <h3>Tổ chức dòng họ</h3>
    <p>Dòng họ có cơ cấu tổ chức gồm:</p>
    <ul>
      <li><strong>Hội đồng Tộc trưởng:</strong> Gồm các bậc cao niên, có uy tín trong dòng họ</li>
      <li><strong>Ban Chấp hành:</strong> Do Đại hội bầu, nhiệm kỳ 5 năm</li>
      <li><strong>Các ban chuyên môn:</strong> Ban Tổ chức, Ban Văn hóa, Ban Tài chính...</li>
    </ul>

    <h3>Hoạt động chính</h3>
    <ul>
      <li>Tổ chức lễ giỗ tổ hàng năm (10/3 âm lịch)</li>
      <li>Họp mặt đầu xuân, trao học bổng</li>
      <li>Hỗ trợ con em nghèo vượt khó</li>
      <li>Xây dựng, tu bổ nhà thờ tổ</li>
      <li>Biên soạn, cập nhật gia phả</li>
    </ul>

    <h3>Truyền thống gia đình</h3>
    <blockquote>
      "Hiếu thân, kính tổ, đoàn kết, tương thân tương ái"
    </blockquote>
    <p>Đó là phương châm sống mà các thế hệ trong dòng họ luôn ghi nhớ và thực hiện.</p>
  `

  await prisma.siteContent.upsert({
    where: { key: 'about' },
    update: { content: aboutContent },
    create: { key: 'about', content: aboutContent },
  })
  console.log('✅ Created About page content')

  // 4. Seed Thông tin Liên hệ
  const contactInfo = {
    address: 'Thôn Đông Ngàn, xã Phù Lưu, huyện Từ Sơn, tỉnh Bắc Ninh',
    phone: '024 3826 xxxx',
    email: 'dongho.nguyen@example.com',
    hours: 'Thứ 2 - Thứ 6: 8:00 - 17:00\nThứ 7 - Chủ nhật: 8:00 - 12:00',
  }

  await prisma.siteContent.upsert({
    where: { key: 'contact_info' },
    update: { content: JSON.stringify(contactInfo) },
    create: { key: 'contact_info', content: JSON.stringify(contactInfo) },
  })
  console.log('✅ Created Contact info')

  console.log('\n🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
