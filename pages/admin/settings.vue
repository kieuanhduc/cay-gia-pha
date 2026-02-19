<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      <Icon name="ph:gear-bold" class="text-primary-600 mr-2" />
      Cài đặt
    </h1>

    <div class="space-y-6 max-w-2xl">
      <!-- Email notification settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Icon name="ph:envelope-bold" class="text-primary-600" />
          Thông báo email
        </h2>
        <p class="text-sm text-gray-500 mb-5">
          Nhận email nhắc nhở khi còn 3 ngày nữa đến ngày giỗ (gửi lúc 8:00 sáng hàng ngày)
        </p>

        <!-- Current email -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email của bạn</label>
            <div class="flex gap-2">
              <input
                v-model="emailInput"
                type="email"
                class="input-field flex-1"
                placeholder="VD: nguyenvana@gmail.com"
              />
              <button
                class="btn-primary shrink-0"
                :disabled="savingEmail"
                @click="saveEmail"
              >
                {{ savingEmail ? 'Đang lưu...' : 'Lưu' }}
              </button>
            </div>
            <p v-if="emailSaved" class="text-xs text-green-600 mt-1">
              <Icon name="ph:check-circle-bold" class="mr-0.5" />
              Đã lưu email thành công
            </p>
            <p v-if="emailError" class="text-xs text-red-600 mt-1">{{ emailError }}</p>
          </div>

          <!-- Test email -->
          <div class="pt-4 border-t border-gray-100">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Kiểm tra gửi email</h3>
            <p class="text-xs text-gray-500 mb-3">
              Gửi email thử để kiểm tra hệ thống SMTP đã được cấu hình đúng chưa.
              Admin cần thiết lập SMTP trong file <code class="bg-gray-100 px-1.5 py-0.5 rounded">.env</code>
            </p>
            <div class="flex gap-2">
              <input
                v-model="testEmailTo"
                type="email"
                class="input-field flex-1"
                placeholder="Email nhận thử..."
              />
              <button
                class="btn-secondary shrink-0 flex items-center gap-1"
                :disabled="sendingTest"
                @click="sendTestEmail"
              >
                <Icon v-if="sendingTest" name="ph:spinner-bold" class="animate-spin" />
                <Icon v-else name="ph:paper-plane-tilt-bold" />
                {{ sendingTest ? 'Đang gửi...' : 'Gửi thử' }}
              </button>
            </div>
            <p v-if="testResult" class="text-xs mt-1" :class="testSuccess ? 'text-green-600' : 'text-red-600'">
              <Icon :name="testSuccess ? 'ph:check-circle-bold' : 'ph:x-circle-bold'" class="mr-0.5" />
              {{ testResult }}
            </p>
          </div>
        </div>
      </div>

      <!-- SMTP Info (admin only) -->
      <div v-if="isAdmin" class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Icon name="ph:info-bold" class="text-blue-600" />
          Hướng dẫn cấu hình SMTP
        </h2>
        <div class="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2">
          <p>Thêm các biến sau vào file <code class="bg-gray-200 px-1.5 py-0.5 rounded">.env</code>:</p>
          <pre class="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Cây Gia Phả &lt;your-email@gmail.com&gt;"</pre>
          <p class="text-xs text-gray-500">
            Nếu dùng Gmail: vào Google Account → Security → App Passwords để tạo mật khẩu ứng dụng.
          </p>
        </div>
      </div>

      <!-- Users with email (admin only) -->
      <div v-if="isAdmin" class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="ph:users-bold" class="text-primary-600" />
          Người nhận thông báo
        </h2>
        <div v-if="!usersWithEmail.length" class="text-sm text-gray-400 py-4 text-center">
          Chưa có ai đăng ký email nhận thông báo
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="u in usersWithEmail"
            :key="u.id"
            class="flex items-center justify-between p-3 rounded-lg bg-gray-50"
          >
            <div>
              <span class="text-sm font-medium text-gray-900">{{ u.fullName }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ u.role }}</span>
            </div>
            <span class="text-sm text-gray-600">{{ u.email }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { user, isAdmin } = useAuth()

// Email state
const emailInput = ref('')
const savingEmail = ref(false)
const emailSaved = ref(false)
const emailError = ref('')

// Test email state
const testEmailTo = ref('')
const sendingTest = ref(false)
const testResult = ref('')
const testSuccess = ref(false)

// Users list (admin)
const usersWithEmail = ref<any[]>([])

// Load current user email
onMounted(async () => {
  try {
    const me = await $fetch<{ user: any }>('/api/auth/me')
    emailInput.value = me.user.email || ''
    testEmailTo.value = me.user.email || ''
  } catch {}

  if (isAdmin.value) {
    await loadUsers()
  }
})

async function loadUsers() {
  try {
    const users = await $fetch<any[]>('/api/users')
    usersWithEmail.value = users.filter((u) => u.email)
  } catch {}
}

async function saveEmail() {
  emailError.value = ''
  emailSaved.value = false
  savingEmail.value = true

  try {
    await $fetch('/api/users/me/email', {
      method: 'PUT',
      body: { email: emailInput.value },
    })
    emailSaved.value = true
    if (isAdmin.value) await loadUsers()
    setTimeout(() => (emailSaved.value = false), 3000)
  } catch (e: any) {
    emailError.value = e.data?.message || 'Lưu email thất bại'
  } finally {
    savingEmail.value = false
  }
}

async function sendTestEmail() {
  if (!testEmailTo.value) {
    testResult.value = 'Vui lòng nhập email nhận thử'
    testSuccess.value = false
    return
  }

  testResult.value = ''
  sendingTest.value = true

  try {
    const res = await $fetch<{ message: string }>('/api/test-email', {
      method: 'POST',
      body: { to: testEmailTo.value },
    })
    testResult.value = res.message
    testSuccess.value = true
  } catch (e: any) {
    testResult.value = e.data?.message || 'Gửi email thất bại'
    testSuccess.value = false
  } finally {
    sendingTest.value = false
  }
}
</script>
