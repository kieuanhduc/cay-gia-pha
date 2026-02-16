<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Nhật ký hoạt động</h1>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3">
        <select v-model="filterType" class="input-field w-auto" @change="page = 1; fetchLogs()">
          <option value="">Tất cả</option>
          <option value="member">Thành viên</option>
          <option value="family_line">Dòng họ</option>
        </select>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="!logs.length" class="card text-center py-12">
      <Icon name="ph:clock" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Chưa có hoạt động nào</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="log in logs"
        :key="log.id"
        class="card flex items-start gap-4"
      >
        <!-- Action icon -->
        <div
          class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          :class="actionBg(log.action)"
        >
          <Icon :name="actionIcon(log.action)" :class="actionColor(log.action)" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900">
            <span class="font-medium">{{ log.userName }}</span>
            {{ ' ' }}
            <span
              class="inline-block px-1.5 py-0.5 rounded text-xs font-medium"
              :class="actionTagClass(log.action)"
            >
              {{ actionLabel(log.action) }}
            </span>
            {{ ' ' }}
            <span class="font-medium">{{ log.entityName }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ formatTime(log.createdAt) }}
            <span class="text-gray-300 mx-1">&middot;</span>
            {{ log.entityType === 'member' ? 'Thành viên' : 'Dòng họ' }}
            <span class="text-gray-300 mx-1">&middot;</span>
            ID: {{ log.entityId }}
          </p>
        </div>

        <!-- Restore button for delete actions -->
        <button
          v-if="log.action === 'delete' && log.snapshot"
          class="shrink-0 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1"
          @click="confirmRestore(log)"
        >
          <Icon name="ph:arrow-counter-clockwise-bold" class="text-sm" />
          Khôi phục
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="total > limit" class="flex justify-center pt-2 gap-2">
        <button
          v-for="p in Math.ceil(total / limit)"
          :key="p"
          @click="page = p; fetchLogs()"
          class="w-8 h-8 rounded text-sm"
          :class="p === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Restore confirm -->
    <ConfirmDialog
      v-model="showRestoreConfirm"
      title="Khôi phục thành viên"
      :message="`Khôi phục thành viên '${restoreTarget?.entityName}'? Sẽ tạo lại thành viên với thông tin trước khi xóa.`"
      confirm-text="Khôi phục"
      @confirm="doRestore"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const loading = ref(false)
const logs = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = 30
const filterType = ref('')

const showRestoreConfirm = ref(false)
const restoreTarget = ref<any>(null)

function actionIcon(action: string) {
  const map: Record<string, string> = {
    create: 'ph:plus-circle-bold',
    update: 'ph:pencil-simple-bold',
    delete: 'ph:trash-bold',
    revert: 'ph:arrow-counter-clockwise-bold',
    restore: 'ph:arrow-u-up-left-bold',
  }
  return map[action] || 'ph:circle-bold'
}

function actionBg(action: string) {
  const map: Record<string, string> = {
    create: 'bg-green-100',
    update: 'bg-blue-100',
    delete: 'bg-red-100',
    revert: 'bg-amber-100',
    restore: 'bg-purple-100',
  }
  return map[action] || 'bg-gray-100'
}

function actionColor(action: string) {
  const map: Record<string, string> = {
    create: 'text-green-600',
    update: 'text-blue-600',
    delete: 'text-red-600',
    revert: 'text-amber-600',
    restore: 'text-purple-600',
  }
  return map[action] || 'text-gray-600'
}

function actionTagClass(action: string) {
  const map: Record<string, string> = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    revert: 'bg-amber-100 text-amber-700',
    restore: 'bg-purple-100 text-purple-700',
  }
  return map[action] || 'bg-gray-100 text-gray-700'
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    create: 'đã tạo',
    update: 'đã sửa',
    delete: 'đã xóa',
    revert: 'đã khôi phục phiên bản',
    restore: 'đã khôi phục',
  }
  return map[action] || action
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} giờ trước`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay} ngày trước`
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

async function fetchLogs() {
  loading.value = true
  try {
    const params: any = { page: page.value, limit }
    if (filterType.value) params.entityType = filterType.value
    const data = await $fetch<any>('/api/activity-log', { query: params })
    logs.value = data.logs
    total.value = data.total
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

function confirmRestore(log: any) {
  restoreTarget.value = log
  showRestoreConfirm.value = true
}

async function doRestore() {
  if (!restoreTarget.value) return
  showRestoreConfirm.value = false
  try {
    await $fetch('/api/members/restore', {
      method: 'POST',
      body: { logId: restoreTarget.value.id },
    })
    await fetchLogs()
    alert(`Đã khôi phục thành viên '${restoreTarget.value.entityName}' thành công!`)
  } catch (e: any) {
    alert(e.data?.message || 'Khôi phục thất bại')
  }
}

fetchLogs()
</script>
