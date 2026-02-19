<template>
  <div v-if="user" class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="flex items-center justify-between px-4 h-14">
        <div class="flex items-center gap-3">
          <button @click="sidebarOpen = !sidebarOpen" class="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Icon name="ph:list-bold" class="text-xl" />
          </button>
          <NuxtLink to="/admin" class="flex items-center gap-2">
            <Icon name="ph:tree-structure-bold" class="text-primary-600 text-xl" />
            <span class="font-bold text-gray-900">Cây Gia Phả</span>
            <span class="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
          </NuxtLink>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 sm:hidden" title="Xem trang chủ">
            <Icon name="ph:eye" />
          </NuxtLink>
          <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-700 hidden sm:flex items-center">
            <Icon name="ph:eye" class="mr-1" />Xem trang chủ
          </NuxtLink>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <span class="text-sm text-gray-600 hidden sm:block">{{ user.fullName }}</span>
            <button @click="logout()" class="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <!-- Sidebar overlay for mobile -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="sidebarOpen = false"
      />

      <!-- Sidebar -->
      <aside
        :class="[
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:transform-none lg:translate-x-0 pt-14 lg:pt-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <nav class="p-4 space-y-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'"
            @click="sidebarOpen = false"
          >
            <Icon :name="item.icon" class="text-lg" />
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 p-4 lg:p-6 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isAdmin, canEdit, logout } = useAuth()
const route = useRoute()
const sidebarOpen = ref(false)

const allMenuItems = [
  { path: '/admin', icon: 'ph:house-bold', label: 'Tổng quan' },
  { path: '/admin/family-lines', icon: 'ph:users-three-bold', label: 'Dòng họ' },
  { path: '/admin/members', icon: 'ph:user-bold', label: 'Thành viên' },
  { path: '/admin/search', icon: 'ph:magnifying-glass-bold', label: 'Tìm kiếm' },
  { path: '/admin/statistics', icon: 'ph:chart-bar-bold', label: 'Thống kê' },
  { path: '/admin/death-anniversaries', icon: 'ph:candle', label: 'Ngày giỗ' },
  { path: '/admin/posts', icon: 'ph:newspaper-bold', label: 'Tin tức & Sự kiện' },
  { path: '/admin/contact', icon: 'ph:envelope-bold', label: 'Tin nhắn liên hệ' },
  { path: '/admin/about', icon: 'ph:info-bold', label: 'Giới thiệu & Liên hệ' },
  { path: '/admin/share-logs', icon: 'ph:eye-bold', label: 'Lượt xem chia sẻ', adminOnly: true },
  { path: '/admin/data', icon: 'ph:database-bold', label: 'Nhập/Xuất dữ liệu', editorOnly: true },
  { path: '/admin/activity-log', icon: 'ph:clock-bold', label: 'Nhật ký' },
  { path: '/admin/users', icon: 'ph:user-gear-bold', label: 'Tài khoản', adminOnly: true },
]

const menuItems = computed(() =>
  allMenuItems.filter(item => {
    if ((item as any).adminOnly && !isAdmin.value) return false
    if ((item as any).editorOnly && !canEdit.value) return false
    return true
  })
)

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>
