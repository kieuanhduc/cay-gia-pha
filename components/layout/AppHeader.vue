<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
      <NuxtLink to="/" class="flex items-center gap-2">
        <Icon name="ph:tree-structure-bold" class="text-primary-600 text-2xl" />
        <span class="font-bold text-lg text-gray-900">Cây Gia Phả</span>
      </NuxtLink>
      <nav class="flex items-center gap-4">
        <NuxtLink to="/" class="text-sm text-gray-600 hover:text-gray-900 font-medium">
          Trang chủ
        </NuxtLink>
        <NuxtLink
          v-if="isLoggedIn"
          to="/admin"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Quản trị
        </NuxtLink>
        <NuxtLink
          v-else
          to="/login"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          Đăng nhập
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { isLoggedIn } = useAuth()
</script>
