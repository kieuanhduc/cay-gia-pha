<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      <Icon name="ph:info-bold" class="text-primary-600 mr-2" />
      Nội dung trang Giới thiệu &amp; Liên hệ
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- About content -->
      <div class="card space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Trang Giới thiệu</h2>
        <p class="text-sm text-gray-500">Nội dung hiển thị tại trang <code class="bg-gray-100 px-1 rounded">/about</code></p>
        <ClientOnly>
          <RichTextEditor v-model="aboutContent" />
          <template #fallback><textarea v-model="aboutContent" class="input-field" rows="10" /></template>
        </ClientOnly>
        <button class="btn-primary w-full" @click="saveAbout" :disabled="savingAbout">
          {{ savingAbout ? 'Đang lưu...' : 'Lưu nội dung giới thiệu' }}
        </button>
        <p v-if="savedAbout" class="text-sm text-green-600 text-center">Đã lưu thành công!</p>
      </div>

      <!-- Contact info -->
      <div class="card space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Thông tin liên hệ</h2>
        <p class="text-sm text-gray-500">Hiển thị bên cạnh form tại trang <code class="bg-gray-100 px-1 rounded">/contact</code></p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
          <input v-model="contactInfo.address" class="input-field" placeholder="VD: Thôn X, Xã Y, Huyện Z..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input v-model="contactInfo.phone" class="input-field" placeholder="VD: 0912 345 678" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="contactInfo.email" class="input-field" placeholder="VD: contact@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian làm việc</label>
          <input v-model="contactInfo.hours" class="input-field" placeholder="VD: Thứ 2 - Thứ 6, 8:00 - 17:00" />
        </div>

        <button class="btn-primary w-full" @click="saveContactInfo" :disabled="savingContact">
          {{ savingContact ? 'Đang lưu...' : 'Lưu thông tin liên hệ' }}
        </button>
        <p v-if="savedContact" class="text-sm text-green-600 text-center">Đã lưu thành công!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

// About content
const { data: aboutData } = await useFetch<any>('/api/site-content/about')
const aboutContent = ref(aboutData.value?.content || '')
const savingAbout = ref(false)
const savedAbout = ref(false)

async function saveAbout() {
  savingAbout.value = true
  savedAbout.value = false
  try {
    await $fetch('/api/site-content/about', { method: 'PUT', body: { content: aboutContent.value } })
    savedAbout.value = true
    setTimeout(() => { savedAbout.value = false }, 2000)
  } catch (e: any) {
    alert(e.data?.message || 'Lưu thất bại')
  } finally {
    savingAbout.value = false
  }
}

// Contact info (stored as JSON string)
const { data: contactData } = await useFetch<any>('/api/site-content/contact_info')
const defaultContact = { address: '', phone: '', email: '', hours: '' }
const contactInfo = reactive({ ...defaultContact })

try {
  const parsed = JSON.parse(contactData.value?.content || '{}')
  Object.assign(contactInfo, parsed)
} catch {}

const savingContact = ref(false)
const savedContact = ref(false)

async function saveContactInfo() {
  savingContact.value = true
  savedContact.value = false
  try {
    await $fetch('/api/site-content/contact_info', {
      method: 'PUT',
      body: { content: JSON.stringify(contactInfo) },
    })
    savedContact.value = true
    setTimeout(() => { savedContact.value = false }, 2000)
  } catch (e: any) {
    alert(e.data?.message || 'Lưu thất bại')
  } finally {
    savingContact.value = false
  }
}
</script>
