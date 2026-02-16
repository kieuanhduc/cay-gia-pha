<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Chia sẻ cây gia phả">
    <div class="space-y-5">
      <!-- Family line name -->
      <div class="text-center pb-3 border-b border-gray-100">
        <Icon name="ph:share-network" class="text-primary-500 text-3xl mb-1" />
        <h4 class="font-semibold text-gray-900">{{ familyLine.name }}</h4>
      </div>

      <!-- Toggle public sharing -->
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-900">Chia sẻ công khai</p>
          <p class="text-sm text-gray-500">Cho phép xem cây gia phả qua liên kết</p>
        </div>
        <button
          @click="toggleSharing"
          :disabled="saving"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="isPublic ? 'bg-primary-600' : 'bg-gray-200'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            :class="isPublic ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>

      <!-- Password protection (only when sharing is enabled) -->
      <div v-if="isPublic" class="space-y-3">
        <div class="flex items-center gap-2">
          <input
            id="usePassword"
            v-model="usePassword"
            type="checkbox"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label for="usePassword" class="text-sm font-medium text-gray-700">Bảo vệ bằng mật khẩu</label>
        </div>
        <div v-if="usePassword">
          <input
            v-model="password"
            type="password"
            class="input-field"
            placeholder="Nhập mật khẩu..."
          />
          <p class="text-xs text-gray-400 mt-1">Người xem cần nhập mật khẩu này để xem cây gia phả</p>
        </div>
      </div>

      <!-- Share link (only when sharing is enabled and has token) -->
      <div v-if="isPublic && shareToken" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Liên kết chia sẻ</label>
        <div class="flex gap-2">
          <input
            :value="shareUrl"
            readonly
            class="input-field flex-1 text-sm bg-gray-50"
            @focus="($event.target as HTMLInputElement)?.select()"
          />
          <button @click="copyLink" class="btn-secondary flex items-center gap-1.5 shrink-0">
            <Icon :name="copied ? 'ph:check-bold' : 'ph:copy'" />
            {{ copied ? 'Đã sao chép' : 'Sao chép' }}
          </button>
        </div>
      </div>

      <!-- Update button (when public and settings changed) -->
      <div v-if="isPublic && needsUpdate" class="pt-2">
        <button @click="updateSharing" class="btn-primary w-full" :disabled="saving">
          {{ saving ? 'Đang cập nhật...' : 'Cập nhật cài đặt chia sẻ' }}
        </button>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</div>

      <!-- Shared by info -->
      <div v-if="isPublic && shareInfo" class="bg-blue-50 rounded-lg px-3 py-2.5 flex items-center gap-2 text-sm">
        <Icon name="ph:user-circle" class="text-blue-500 shrink-0 text-lg" />
        <div>
          <span class="text-blue-800">Được chia sẻ bởi <strong>{{ shareInfo.userName }}</strong></span>
          <span class="text-blue-500 text-xs ml-1.5">{{ timeAgo(shareInfo.createdAt) }}</span>
        </div>
      </div>

      <!-- Recent access logs -->
      <div v-if="isPublic && accessLogs.length > 0" class="pt-3 border-t border-gray-100">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Icon name="ph:eye" class="text-gray-400" />
            Lượt xem gần đây
            <span class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{{ totalViews }}</span>
          </p>
        </div>
        <div class="space-y-1.5 max-h-40 overflow-y-auto">
          <div
            v-for="log in accessLogs"
            :key="log.id"
            class="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2"
          >
            <Icon name="ph:user" class="text-gray-400 shrink-0" />
            <div class="flex-1 min-w-0">
              <span class="text-gray-700 font-medium">{{ parseDevice(log.userAgent) }}</span>
              <span v-if="log.ip" class="text-gray-400 ml-1.5 font-mono">{{ log.ip }}</span>
            </div>
            <span class="text-gray-400 shrink-0">{{ timeAgo(log.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="isPublic && accessLogs.length === 0 && !loadingLogs" class="pt-3 border-t border-gray-100">
        <p class="text-xs text-gray-400 flex items-center gap-1.5">
          <Icon name="ph:eye-slash" />
          Chưa có ai xem qua link chia sẻ
        </p>
      </div>

      <!-- Status badge -->
      <div class="flex items-center gap-2 text-sm pt-2 border-t border-gray-100">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          :class="isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
        >
          <Icon :name="isPublic ? 'ph:globe' : 'ph:lock-simple'" />
          {{ isPublic ? 'Đang chia sẻ' : 'Riêng tư' }}
        </span>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  familyLine: {
    id: number
    name: string
    isPublic: boolean
    shareToken: string | null
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
}>()

const isPublic = ref(props.familyLine.isPublic)
const shareToken = ref(props.familyLine.shareToken)
const usePassword = ref(false)
const password = ref('')
const saving = ref(false)
const errorMsg = ref('')
const copied = ref(false)
const initialPasswordState = ref(false)
const accessLogs = ref<any[]>([])
const totalViews = ref(0)
const loadingLogs = ref(false)
const shareInfo = ref<{ userName: string; createdAt: string } | null>(null)

const shareUrl = computed(() => {
  if (!shareToken.value) return ''
  if (import.meta.server) return ''
  return `${window.location.origin}/share/${shareToken.value}`
})

const needsUpdate = computed(() => {
  if (usePassword.value !== initialPasswordState.value) return true
  if (usePassword.value && password.value) return true
  return false
})

watch(() => props.familyLine, (fl) => {
  isPublic.value = fl.isPublic
  shareToken.value = fl.shareToken
  usePassword.value = false
  password.value = ''
  initialPasswordState.value = false
}, { immediate: true })

// Load access logs + share info when dialog opens and sharing is enabled
watch(() => props.modelValue, async (open) => {
  if (open && isPublic.value) {
    await Promise.all([loadAccessLogs(), loadShareInfo()])
  } else if (open) {
    await loadShareInfo()
  }
})

async function loadShareInfo() {
  try {
    shareInfo.value = await $fetch<any>(`/api/family-lines/${props.familyLine.id}/share-info`)
  } catch {
    shareInfo.value = null
  }
}

async function loadAccessLogs() {
  loadingLogs.value = true
  try {
    const data = await $fetch<any>(`/api/share-logs?familyLineId=${props.familyLine.id}&limit=10`)
    accessLogs.value = data.logs
    totalViews.value = data.total
  } catch {
    accessLogs.value = []
    totalViews.value = 0
  } finally {
    loadingLogs.value = false
  }
}

function parseDevice(ua: string | null): string {
  if (!ua) return 'Không rõ'
  if (ua.includes('iPhone')) return 'iPhone'
  if (ua.includes('iPad')) return 'iPad'
  if (ua.includes('Android')) {
    const match = ua.match(/Android\s[\d.]+;\s([^)]+)\)/)
    return match ? match[1].split(' Build')[0].trim() : 'Android'
  }
  if (ua.includes('Macintosh')) return 'Mac'
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Linux')) return 'Linux'
  return 'Khác'
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

async function toggleSharing() {
  const newPublic = !isPublic.value
  saving.value = true
  errorMsg.value = ''

  try {
    const data = await $fetch<any>(`/api/family-lines/${props.familyLine.id}/share`, {
      method: 'POST',
      body: {
        isPublic: newPublic,
        password: newPublic && usePassword.value ? password.value : undefined,
      },
    })

    isPublic.value = data.isPublic
    shareToken.value = data.shareToken
    if (!newPublic) {
      usePassword.value = false
      password.value = ''
    }
    emit('updated')
  } catch (e: any) {
    errorMsg.value = e.data?.message || 'Có lỗi xảy ra'
  } finally {
    saving.value = false
  }
}

async function updateSharing() {
  saving.value = true
  errorMsg.value = ''

  try {
    const data = await $fetch<any>(`/api/family-lines/${props.familyLine.id}/share`, {
      method: 'POST',
      body: {
        isPublic: true,
        password: usePassword.value ? password.value : undefined,
      },
    })

    isPublic.value = data.isPublic
    shareToken.value = data.shareToken
    initialPasswordState.value = usePassword.value
    password.value = ''
    emit('updated')
  } catch (e: any) {
    errorMsg.value = e.data?.message || 'Có lỗi xảy ra'
  } finally {
    saving.value = false
  }
}

async function copyLink() {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback: select the input text
    errorMsg.value = 'Không thể sao chép, vui lòng sao chép thủ công'
  }
}
</script>
