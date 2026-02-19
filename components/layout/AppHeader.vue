<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
      <NuxtLink to="/" class="flex items-center gap-2 flex-shrink-0">
        <Icon name="ph:tree-structure-bold" class="text-primary-600 text-2xl" />
        <span class="font-bold text-lg text-gray-900">Cây Gia Phả</span>
      </NuxtLink>

      <!-- Desktop nav (chỉ hiện từ lg = 1024px trở lên) -->
      <nav class="hidden lg:flex items-center gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <!-- Logged in -->
        <div v-if="isLoggedIn" class="hidden lg:flex items-center gap-3">
          <span class="text-sm text-gray-600">{{ user?.fullName }}</span>
          <NuxtLink
            to="/admin"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Quản trị
          </NuxtLink>
          <button
            @click="logout()"
            class="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Đăng xuất
          </button>
        </div>

        <!-- Not logged in -->
        <NuxtLink
          v-else
          to="/login"
          class="hidden lg:inline-flex items-center gap-1.5 text-sm bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 font-medium transition-colors"
        >
          <Icon name="ph:sign-in-bold" />
          Đăng nhập
        </NuxtLink>

        <!-- Hamburger (hiện đến lg = 1024px) -->
        <button
          class="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
          :aria-label="menuOpen ? 'Đóng menu' : 'Mở menu'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <Icon :name="menuOpen ? 'ph:x-bold' : 'ph:list-bold'" class="text-xl" />
        </button>
      </div>
    </div>

    <!-- Mobile/tablet menu (ẩn từ lg trở lên) -->
    <div v-if="menuOpen" class="lg:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="isActive(item.path) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'"
        @click="menuOpen = false"
      >
        {{ item.label }}
      </NuxtLink>
      <div class="border-t border-gray-100 pt-2 mt-2">
        <template v-if="isLoggedIn">
          <div class="px-3 py-2 text-sm text-gray-500 font-medium">
            {{ user?.fullName }}
          </div>
          <NuxtLink to="/admin" class="block px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50" @click="menuOpen = false">
            <Icon name="ph:gear-bold" class="mr-1" />
            Quản trị
          </NuxtLink>
          <button @click="handleLogout" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
            <Icon name="ph:sign-out-bold" class="mr-1" />
            Đăng xuất
          </button>
        </template>
        <NuxtLink v-else to="/login" class="block px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50" @click="menuOpen = false">
          <Icon name="ph:sign-in-bold" class="mr-1" />
          Đăng nhập
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { isLoggedIn, user, logout } = useAuth()
const route = useRoute()
const menuOpen = ref(false)

const navItems = [
  { path: '/', label: 'Trang chủ' },
  { path: '/news', label: 'Tin tức' },
  { path: '/events', label: 'Sự kiện' },
  { path: '/about', label: 'Giới thiệu' },
  { path: '/contact', label: 'Liên hệ' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function handleLogout() {
  menuOpen.value = false
  logout()
}

watch(() => route.path, () => { menuOpen.value = false })
</script>
