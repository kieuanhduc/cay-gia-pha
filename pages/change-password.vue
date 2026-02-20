<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="card max-w-md w-full">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="ph:lock-key-bold" class="text-primary-600 text-3xl" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Đổi mật khẩu</h1>
        <p class="text-gray-500 mt-1">Nhập thông tin để xác minh và đặt mật khẩu mới</p>
      </div>

      <!-- Success -->
      <div v-if="success" class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="ph:check-circle-bold" class="text-green-600 text-3xl" />
        </div>
        <p class="font-medium text-gray-900">Đổi mật khẩu thành công!</p>
        <p class="text-sm text-gray-500 mt-1">Hãy đăng nhập lại với mật khẩu mới.</p>
        <NuxtLink to="/login" class="btn-primary mt-5 inline-flex items-center gap-2">
          <Icon name="ph:sign-in" />
          Đăng nhập ngay
        </NuxtLink>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
          <input
            v-model="form.username"
            type="text"
            class="input-field"
            placeholder="Nhập tên đăng nhập của bạn"
            required
            autofocus
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại *</label>
          <div class="relative">
            <input
              v-model="form.oldPassword"
              :type="showOld ? 'text' : 'password'"
              class="input-field pr-10"
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showOld = !showOld"
            >
              <Icon :name="showOld ? 'ph:eye-slash' : 'ph:eye'" />
            </button>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới *</label>
            <div class="relative">
              <input
                v-model="form.newPassword"
                :type="showNew ? 'text' : 'password'"
                class="input-field pr-10"
                placeholder="Ít nhất 6 ký tự"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showNew = !showNew"
              >
                <Icon :name="showNew ? 'ph:eye-slash' : 'ph:eye'" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới *</label>
            <div class="relative">
              <input
                v-model="form.confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                class="input-field pr-10"
                :class="{ 'border-red-300 focus:ring-red-400': form.confirmPassword && form.newPassword !== form.confirmPassword }"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showConfirm = !showConfirm"
              >
                <Icon :name="showConfirm ? 'ph:eye-slash' : 'ph:eye'" />
              </button>
            </div>
            <p
              v-if="form.confirmPassword && form.newPassword !== form.confirmPassword"
              class="text-xs text-red-500 mt-1"
            >
              Mật khẩu xác nhận không khớp
            </p>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading || (!!form.confirmPassword && form.newPassword !== form.confirmPassword)"
          class="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Icon v-if="loading" name="ph:spinner" class="animate-spin" />
          {{ loading ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
        </button>

        <p class="text-center text-sm text-gray-500">
          Nhớ ra mật khẩu rồi?
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

const form = ref({
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const loading = ref(false)
const error = ref('')
const success = ref(false)
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

async function handleSubmit() {
  error.value = ''

  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  if (form.value.oldPassword === form.value.newPassword) {
    error.value = 'Mật khẩu mới phải khác mật khẩu hiện tại'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        username: form.value.username,
        oldPassword: form.value.oldPassword,
        newPassword: form.value.newPassword,
      },
    })
    success.value = true
  } catch (e: any) {
    error.value = e.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    loading.value = false
  }
}
</script>
