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
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
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

      <div class="mt-6 text-center">
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
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Redirect if already logged in
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
