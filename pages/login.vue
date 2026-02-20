<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="ph:tree-structure-bold" class="text-primary-600 text-3xl" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Đăng nhập</h1>
        <p class="text-gray-500 mt-1">Quản trị Cây Gia Phả</p>
      </div>

      <!-- Google Login -->
      <a
        href="/auth/google"
        class="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-5"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Tiếp tục với Google
      </a>

      <div class="flex items-center gap-3 mb-5">
        <div class="flex-1 h-px bg-gray-200" />
        <span class="text-xs text-gray-400">hoặc</span>
        <div class="flex-1 h-px bg-gray-200" />
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
          <input
            v-model="username"
            type="text"
            class="input-field"
            placeholder="Nhập tên đăng nhập"
            required
            autofocus
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <NuxtLink to="/change-password" class="text-xs text-primary-600 hover:text-primary-700">
              Quên mật khẩu?
            </NuxtLink>
          </div>
          <input
            v-model="password"
            type="password"
            class="input-field"
            placeholder="Nhập mật khẩu"
            required
          />
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Icon v-if="loading" name="ph:spinner" class="animate-spin" />
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <div class="mt-6 text-center space-y-2">
        <p class="text-sm text-gray-500">
          Chưa có tài khoản?
          <NuxtLink to="/register" class="text-primary-600 hover:text-primary-700 font-medium">Tạo tài khoản</NuxtLink>
        </p>
        <NuxtLink to="/" class="text-sm text-primary-600 hover:text-primary-700">
          ← Quay về trang chủ
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { login, isLoggedIn } = useAuth()
const route = useRoute()
const username = ref('')
const password = ref('')
const loading = ref(false)

const error = ref(route.query.error === 'google' ? 'Đăng nhập Google thất bại, vui lòng thử lại.' : '')

if (isLoggedIn.value) {
  navigateTo('/admin')
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    navigateTo('/admin')
  } catch (e: any) {
    error.value = e.data?.message || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>
