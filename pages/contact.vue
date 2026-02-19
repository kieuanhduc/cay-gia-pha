<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Liên hệ</h1>
    <p class="text-gray-500 mb-10">Gửi tin nhắn cho chúng tôi, chúng tôi sẽ phản hồi sớm nhất</p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form -->
      <div class="lg:col-span-2">
        <div class="card space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên <span class="text-red-500">*</span></label>
              <input v-model="form.name" class="input-field" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input v-model="form.phone" class="input-field" placeholder="0912 345 678" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
            <input v-model="form.email" type="email" class="input-field" placeholder="email@example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span class="text-red-500">*</span></label>
            <input v-model="form.subject" class="input-field" placeholder="Tiêu đề tin nhắn..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nội dung <span class="text-red-500">*</span></label>
            <textarea v-model="form.message" class="input-field" rows="5" placeholder="Nội dung tin nhắn..." />
          </div>

          <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</div>
          <div v-if="success" class="text-sm text-green-600 bg-green-50 rounded-lg px-4 py-3 flex items-center gap-2">
            <Icon name="ph:check-circle-bold" class="text-green-500" />
            Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm.
          </div>

          <button class="btn-primary w-full" @click="submit" :disabled="submitting">
            <Icon name="ph:paper-plane-tilt-bold" class="mr-2" />
            {{ submitting ? 'Đang gửi...' : 'Gửi tin nhắn' }}
          </button>
        </div>
      </div>

      <!-- Contact info -->
      <div class="space-y-4">
        <div v-if="contactInfo.address || contactInfo.phone || contactInfo.email || contactInfo.hours" class="card space-y-4">
          <h2 class="font-semibold text-gray-900">Thông tin liên hệ</h2>
          <div v-if="contactInfo.address" class="flex items-start gap-3">
            <Icon name="ph:map-pin-bold" class="text-primary-600 mt-0.5 flex-shrink-0" />
            <span class="text-sm text-gray-700">{{ contactInfo.address }}</span>
          </div>
          <div v-if="contactInfo.phone" class="flex items-center gap-3">
            <Icon name="ph:phone-bold" class="text-primary-600 flex-shrink-0" />
            <a :href="`tel:${contactInfo.phone}`" class="text-sm text-gray-700 hover:text-primary-600">{{ contactInfo.phone }}</a>
          </div>
          <div v-if="contactInfo.email" class="flex items-center gap-3">
            <Icon name="ph:envelope-bold" class="text-primary-600 flex-shrink-0" />
            <a :href="`mailto:${contactInfo.email}`" class="text-sm text-gray-700 hover:text-primary-600">{{ contactInfo.email }}</a>
          </div>
          <div v-if="contactInfo.hours" class="flex items-start gap-3">
            <Icon name="ph:clock-bold" class="text-primary-600 mt-0.5 flex-shrink-0" />
            <span class="text-sm text-gray-700">{{ contactInfo.hours }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Liên hệ - Cây Gia Phả' })

const { data: contactData } = await useFetch<any>('/api/site-content/contact_info')
const contactInfo = reactive({ address: '', phone: '', email: '', hours: '' })
try {
  const parsed = JSON.parse(contactData.value?.content || '{}')
  Object.assign(contactInfo, parsed)
} catch {}

const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' })
const submitting = ref(false)
const error = ref('')
const success = ref(false)

async function submit() {
  error.value = ''
  success.value = false
  if (!form.name.trim()) { error.value = 'Vui lòng nhập họ tên'; return }
  if (!form.email.trim()) { error.value = 'Vui lòng nhập email'; return }
  if (!form.subject.trim()) { error.value = 'Vui lòng nhập tiêu đề'; return }
  if (!form.message.trim()) { error.value = 'Vui lòng nhập nội dung'; return }

  submitting.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...form } })
    success.value = true
    Object.assign(form, { name: '', email: '', phone: '', subject: '', message: '' })
  } catch (e: any) {
    error.value = e.data?.message || 'Gửi thất bại, vui lòng thử lại'
  } finally {
    submitting.value = false
  }
}
</script>
