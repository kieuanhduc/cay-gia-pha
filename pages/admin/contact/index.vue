<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          <Icon name="ph:envelope-bold" class="text-primary-600 mr-2" />
          Tin nhắn liên hệ
        </h1>
        <p v-if="unreadCount > 0" class="text-sm text-gray-500 mt-1">
          <span class="font-semibold text-primary-600">{{ unreadCount }}</span> tin chưa đọc
        </p>
      </div>
      <select v-model="filterRead" class="input-field w-auto" @change="page = 1">
        <option value="">Tất cả</option>
        <option value="false">Chưa đọc</option>
        <option value="true">Đã đọc</option>
      </select>
    </div>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="!messages.length" class="card text-center py-12">
      <Icon name="ph:envelope-open" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Chưa có tin nhắn nào</p>
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left py-3 px-2 font-medium text-gray-500 w-2"></th>
            <th class="text-left py-3 px-2 font-medium text-gray-500">Người gửi</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500">Tiêu đề</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Email</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden sm:table-cell">Ngày gửi</th>
            <th class="text-right py-3 px-2 font-medium text-gray-500">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="msg in messages"
            :key="msg.id"
            class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
            :class="!msg.isRead ? 'bg-blue-50/30' : ''"
            @click="openDetail(msg)"
          >
            <td class="py-3 px-2">
              <div
                class="w-2 h-2 rounded-full"
                :class="!msg.isRead ? 'bg-primary-500' : 'bg-transparent'"
              ></div>
            </td>
            <td class="py-3 px-2">
              <div class="font-medium text-gray-900" :class="!msg.isRead ? 'font-semibold' : ''">{{ msg.name }}</div>
              <div v-if="msg.phone" class="text-xs text-gray-400">{{ msg.phone }}</div>
            </td>
            <td class="py-3 px-2 text-gray-700 max-w-[200px] truncate">{{ msg.subject }}</td>
            <td class="py-3 px-2 text-gray-500 hidden md:table-cell">{{ msg.email }}</td>
            <td class="py-3 px-2 text-gray-400 text-xs hidden sm:table-cell">{{ formatDate(msg.createdAt) }}</td>
            <td class="py-3 px-2 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="toggleRead(msg)"
                  class="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                  :title="msg.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'"
                >
                  <Icon :name="msg.isRead ? 'ph:envelope-bold' : 'ph:envelope-open-bold'" />
                </button>
                <button @click="confirmDelete(msg)" class="p-1.5 rounded hover:bg-red-50 text-red-500" title="Xoá">
                  <Icon name="ph:trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="total > limit" class="flex justify-center mt-4 gap-2">
        <button
          v-for="p in Math.ceil(total / limit)"
          :key="p"
          @click="page = p"
          class="w-8 h-8 rounded text-sm"
          :class="p === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'"
        >{{ p }}</button>
      </div>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="detailMsg"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="detailMsg = null"
    >
      <div class="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ detailMsg.subject }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ detailMsg.name }} &middot; {{ detailMsg.email }}<span v-if="detailMsg.phone"> &middot; {{ detailMsg.phone }}</span></p>
            <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(detailMsg.createdAt) }}</p>
          </div>
          <button @click="detailMsg = null" class="text-gray-400 hover:text-gray-600 p-1">
            <Icon name="ph:x-bold" />
          </button>
        </div>
        <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">{{ detailMsg.message }}</div>
        <div class="flex gap-3 mt-4">
          <button class="btn-secondary flex-1" @click="detailMsg = null">Đóng</button>
          <a
            :href="`mailto:${detailMsg.email}?subject=Re: ${detailMsg.subject}`"
            class="btn-primary flex-1 text-center"
          >
            <Icon name="ph:paper-plane-tilt-bold" class="mr-1" />
            Trả lời
          </a>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model="showDeleteConfirm"
      :message="`Xoá tin nhắn từ '${deletingItem?.name}'?`"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const filterRead = ref('')
const page = ref(1)
const limit = 20

const queryParams = computed(() => {
  const p: any = { page: page.value, limit }
  if (filterRead.value !== '') p.isRead = filterRead.value
  return p
})

const { data, pending, refresh } = await useFetch<any>('/api/contact', { query: queryParams })
const messages = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)
const unreadCount = computed(() => data.value?.unreadCount || 0)

const detailMsg = ref<any>(null)
const showDeleteConfirm = ref(false)
const deletingItem = ref<any>(null)

async function openDetail(msg: any) {
  detailMsg.value = msg
  if (!msg.isRead) {
    await $fetch(`/api/contact/${msg.id}`, { method: 'PUT', body: { isRead: true } })
    msg.isRead = true
    await refresh()
  }
}

async function toggleRead(msg: any) {
  await $fetch(`/api/contact/${msg.id}`, { method: 'PUT', body: { isRead: !msg.isRead } })
  await refresh()
}

function confirmDelete(msg: any) {
  deletingItem.value = msg
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingItem.value) return
  try {
    await $fetch(`/api/contact/${deletingItem.value.id}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    deletingItem.value = null
    if (detailMsg.value?.id === deletingItem.value?.id) detailMsg.value = null
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Xoá thất bại')
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
