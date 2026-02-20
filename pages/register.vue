<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="ph:user-plus-bold" class="text-primary-600 text-3xl" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
        <p class="text-gray-500 mt-1">Đăng ký để truy cập Cây Gia Phả</p>
      </div>

      <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm text-center">
        <Icon name="ph:check-circle" class="text-2xl mb-2" />
        <p class="font-medium">Tạo tài khoản thành công!</p>
        <p class="mt-1 text-green-600">Tài khoản của bạn đang chờ quản trị viên phê duyệt quyền truy cập.</p>
        <NuxtLink to="/login" class="btn-primary mt-4 inline-block">Đến trang đăng nhập</NuxtLink>
      </div>

      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
          <input
            v-model="form.fullName"
            type="text"
            class="input-field"
            placeholder="Nhập họ và tên"
            required
            autofocus
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
          <input
            v-model="form.username"
            type="text"
            class="input-field"
            placeholder="Chỉ chữ cái, số và dấu gạch dưới"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input-field"
            placeholder="email@example.com (không bắt buộc)"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
          <input
            v-model="form.password"
            type="password"
            class="input-field"
            placeholder="Ít nhất 6 ký tự"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu *</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="input-field"
            placeholder="Nhập lại mật khẩu"
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
          {{ loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản' }}
        </button>

        <p class="text-center text-sm text-gray-500">
          Đã có tài khoản?
          <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">Đăng nhập</NuxtLink>
        </p>
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

const { isLoggedIn } = useAuth()

if (isLoggedIn.value) {
  navigateTo('/admin')
}

const form = ref({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleRegister() {
  error.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        username: form.value.username,
        password: form.value.password,
        fullName: form.value.fullName,
        email: form.value.email || undefined,
      },
    })
    success.value = true
  } catch (e: any) {
    error.value = e.data?.message || 'Tạo tài khoản thất bại, vui lòng thử lại'
  } finally {
    loading.value = false
  }
}
</script>
