<template>
  <div class="overflow-hidden">
    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl" />
        <div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
        <!-- Subtle pattern overlay -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" />
      </div>

      <div class="relative max-w-6xl mx-auto px-4 py-20 lg:py-32">
        <div class="text-center">
          <!-- Logo -->
          <div class="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 ring-1 ring-white/20">
            <Icon name="ph:tree-structure-bold" class="text-amber-300 text-4xl" />
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span class="block">Cây Gia Phả</span>
            <span class="block text-xl sm:text-2xl lg:text-3xl font-normal text-primary-200 mt-3">
              Giữ gìn cội nguồn — Lưu truyền thế hệ
            </span>
          </h1>

          <p class="text-lg text-primary-200/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Xây dựng, quản lý và chia sẻ cây gia phả dòng họ một cách trực quan.
            Kết nối quá khứ với hiện tại, gìn giữ truyền thống gia đình.
          </p>

          <div class="flex flex-wrap gap-4 justify-center">
            <NuxtLink
              v-if="familyLines?.length"
              :to="`/tree/${familyLines[0].id}`"
              class="inline-flex items-center gap-2 bg-white text-primary-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Icon name="ph:tree-structure-bold" class="text-lg" />
              Xem gia phả
            </NuxtLink>
            <NuxtLink
              v-if="isLoggedIn"
              to="/admin"
              class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-7 py-3.5 rounded-xl font-semibold ring-1 ring-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              <Icon name="ph:gear-bold" class="text-lg" />
              Quản trị
            </NuxtLink>
          </div>
        </div>

        <!-- Stats -->
        <div v-if="familyLines?.length" class="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          <div class="text-center px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl ring-1 ring-white/10">
            <p class="text-2xl sm:text-3xl font-bold text-amber-300">{{ familyLines.length }}</p>
            <p class="text-sm text-primary-300 mt-1">Dòng họ</p>
          </div>
          <div class="text-center px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl ring-1 ring-white/10">
            <p class="text-2xl sm:text-3xl font-bold text-amber-300">{{ totalMembers }}</p>
            <p class="text-sm text-primary-300 mt-1">Thành viên</p>
          </div>
          <div class="hidden sm:block text-center px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl ring-1 ring-white/10">
            <p class="text-2xl sm:text-3xl font-bold text-amber-300">{{ maxGeneration }}</p>
            <p class="text-sm text-primary-300 mt-1">Thế hệ</p>
          </div>
        </div>
      </div>

      <!-- Wave separator -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
          <path d="M0 80V40C240 70 480 20 720 40C960 60 1200 10 1440 40V80H0Z" fill="#f9fafb" />
        </svg>
      </div>
    </section>

    <!-- Family Lines -->
    <section class="max-w-6xl mx-auto px-4 py-16 lg:py-20">
      <div class="text-center mb-10">
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Các dòng họ</h2>
        <p class="text-gray-500 mt-2">Khám phá và tìm hiểu cội nguồn dòng họ</p>
      </div>

      <LoadingSpinner v-if="pending" />

      <div v-else-if="!familyLines?.length" class="text-center py-16">
        <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="ph:users-three" class="text-gray-300 text-4xl" />
        </div>
        <p class="text-gray-500 text-lg">Chưa có dòng họ nào được tạo</p>
        <NuxtLink v-if="isLoggedIn" to="/admin/family-lines" class="btn-primary mt-4 inline-block">
          Tạo dòng họ đầu tiên
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="(fl, index) in familyLines"
          :key="fl.id"
          :to="`/tree/${fl.id}`"
          class="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-primary-900/5 hover:border-primary-200 transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Accent bar -->
          <div
            class="absolute top-0 left-6 right-6 h-1 rounded-b-full transition-all duration-300 group-hover:left-4 group-hover:right-4"
            :class="accentColors[index % accentColors.length]"
          />

          <div class="flex items-start gap-4 mt-2">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
              :class="iconBgColors[index % iconBgColors.length]"
            >
              <Icon name="ph:tree-structure-bold" :class="iconTextColors[index % iconTextColors.length]" class="text-xl" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 text-lg group-hover:text-primary-700 transition-colors">
                {{ fl.name }}
              </h3>
              <p v-if="fl.originPlace" class="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Icon name="ph:map-pin-fill" class="text-primary-400 shrink-0" />
                {{ fl.originPlace }}
              </p>
            </div>
          </div>

          <p v-if="fl.description" class="text-sm text-gray-500 mt-4 line-clamp-2 leading-relaxed">
            {{ fl.description }}
          </p>

          <div class="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
            <span class="text-sm font-medium text-gray-400">
              <Icon name="ph:users-bold" class="mr-1" />{{ fl.memberCount }} thành viên
            </span>
            <span class="text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0 flex items-center gap-1">
              Xem cây
              <Icon name="ph:arrow-right-bold" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Features -->
    <section class="bg-white py-16 lg:py-20 border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Tính năng nổi bật</h2>
          <p class="text-gray-500 mt-2">Mọi thứ bạn cần để quản lý gia phả dòng họ</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          <div v-for="feature in features" :key="feature.title" class="group text-center">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
              :class="feature.bgColor"
            >
              <Icon :name="feature.icon" class="text-2xl" :class="feature.iconColor" />
            </div>
            <h3 class="font-semibold text-gray-900 text-base">{{ feature.title }}</h3>
            <p class="text-sm text-gray-500 mt-2 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section v-if="!isLoggedIn" class="bg-gradient-to-r from-primary-900 to-primary-800 py-16">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-2xl lg:text-3xl font-bold text-white mb-4">
          Bắt đầu xây dựng gia phả
        </h2>
        <p class="text-primary-200 mb-8">
          Đăng nhập để quản lý và chỉnh sửa cây gia phả của dòng họ bạn
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 bg-white text-primary-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Icon name="ph:sign-in-bold" class="text-lg" />
          Đăng nhập
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isLoggedIn } = useAuth()
const { data: familyLines, pending } = await useFetch<any[]>('/api/family-lines')

const totalMembers = computed(() =>
  familyLines.value?.reduce((sum, fl) => sum + (fl.memberCount || 0), 0) || 0
)

const maxGeneration = computed(() => {
  if (!familyLines.value?.length) return 0
  return Math.max(...familyLines.value.map(fl => fl.maxGeneration || 0), 0) || '—'
})

const accentColors = [
  'bg-primary-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
]

const iconBgColors = [
  'bg-primary-100',
  'bg-blue-100',
  'bg-emerald-100',
  'bg-violet-100',
  'bg-amber-100',
  'bg-rose-100',
]

const iconTextColors = [
  'text-primary-600',
  'text-blue-600',
  'text-emerald-600',
  'text-violet-600',
  'text-amber-600',
  'text-rose-600',
]

const features = [
  {
    icon: 'ph:tree-structure-bold',
    title: 'Cây trực quan',
    desc: 'Hiển thị gia phả dạng cây tương tác, hỗ trợ xem dọc và ngang, thu phóng linh hoạt',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: 'ph:user-circle-plus-bold',
    title: 'Quản lý thành viên',
    desc: 'Thêm, sửa thành viên với đầy đủ thông tin: ngày sinh, quê quán, tiểu sử, ảnh đại diện',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: 'ph:heart-bold',
    title: 'Quan hệ gia đình',
    desc: 'Quản lý quan hệ cha-con, vợ-chồng. Tìm mối quan hệ giữa hai thành viên bất kỳ',
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: 'ph:candle-bold',
    title: 'Ngày giỗ âm lịch',
    desc: 'Ghi nhận và nhắc nhở ngày giỗ theo âm lịch, không bỏ sót ngày quan trọng',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: 'ph:images-bold',
    title: 'Album ảnh',
    desc: 'Lưu trữ ảnh đại diện và album ảnh kỷ niệm cho từng thành viên trong gia phả',
    bgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    icon: 'ph:share-network-bold',
    title: 'Chia sẻ gia phả',
    desc: 'Tạo link chia sẻ công khai có mật khẩu bảo vệ để người thân cùng xem',
    bgColor: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    icon: 'ph:users-three-bold',
    title: 'Phân quyền',
    desc: 'Hệ thống 3 vai trò: Admin, Editor, Viewer. Phân quyền xem theo từng dòng họ',
    bgColor: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    icon: 'ph:database-bold',
    title: 'Sao lưu & Xuất dữ liệu',
    desc: 'Xuất JSON, Excel. Nhập dữ liệu và khôi phục từ bản sao lưu',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]
</script>
