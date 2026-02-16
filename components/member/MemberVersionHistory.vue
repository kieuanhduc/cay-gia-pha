<template>
  <div class="card">
    <!-- Header toggle -->
    <button
      class="w-full flex items-center justify-between"
      @click="expanded = !expanded"
    >
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Icon name="ph:clock-counter-clockwise-bold" class="text-primary-600" />
        Lịch sử chỉnh sửa
        <span v-if="versions.length" class="text-sm font-normal text-gray-400">({{ versions.length }} phiên bản)</span>
      </h2>
      <Icon
        :name="expanded ? 'ph:caret-up-bold' : 'ph:caret-down-bold'"
        class="text-gray-400"
      />
    </button>

    <!-- Version list -->
    <div v-if="expanded" class="mt-4">
      <div v-if="loading" class="text-center py-4">
        <LoadingSpinner text="Đang tải..." />
      </div>

      <div v-else-if="!versions.length" class="text-center py-6 text-gray-400 text-sm">
        Chưa có lịch sử chỉnh sửa
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="v in displayedVersions"
          :key="v.id"
          class="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <!-- Version badge -->
          <div class="shrink-0">
            <span
              class="inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold text-white"
              :class="badgeColor(v.changeType)"
            >
              v{{ v.version }}
            </span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-sm text-gray-900">{{ v.fullName }}</span>
              <span
                class="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                :class="typeTagClass(v.changeType)"
              >
                {{ typeLabel(v.changeType) }}
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              {{ v.changedByName }} &middot; {{ formatTime(v.createdAt) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="shrink-0 flex gap-1">
            <button
              class="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title="Xem chi tiết"
              @click="viewDetail(v)"
            >
              <Icon name="ph:eye-bold" />
            </button>
            <button
              class="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Khôi phục phiên bản này"
              @click="confirmRevert(v)"
            >
              <Icon name="ph:arrow-counter-clockwise-bold" />
            </button>
          </div>
        </div>

        <!-- Show more -->
        <button
          v-if="versions.length > showCount"
          class="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
          @click="showCount += 5"
        >
          Xem thêm (còn {{ versions.length - showCount }} phiên bản)
        </button>
      </div>
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" :title="`Phiên bản ${detailVersion?.version}`" size="lg">
      <div v-if="detailVersion" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-2 px-3 text-gray-500 font-medium">Trường</th>
              <th class="text-left py-2 px-3 text-gray-500 font-medium">Giá trị phiên bản</th>
              <th class="text-left py-2 px-3 text-gray-500 font-medium">Hiện tại</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="field in comparedFields"
              :key="field.key"
              class="border-b border-gray-50"
              :class="field.changed ? 'bg-amber-50' : ''"
            >
              <td class="py-2 px-3 font-medium text-gray-700">{{ field.label }}</td>
              <td class="py-2 px-3" :class="field.changed ? 'text-green-700 font-medium' : 'text-gray-600'">
                {{ field.versionValue ?? '(trống)' }}
              </td>
              <td class="py-2 px-3" :class="field.changed ? 'text-red-500 line-through' : 'text-gray-600'">
                {{ field.currentValue ?? '(trống)' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="btn-secondary" @click="showDetail = false">Đóng</button>
          <button class="btn-primary" @click="showDetail = false; confirmRevert(detailVersion!)">
            <Icon name="ph:arrow-counter-clockwise-bold" class="mr-1" />
            Khôi phục phiên bản này
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Revert Confirm -->
    <ConfirmDialog
      v-model="showRevertConfirm"
      title="Khôi phục phiên bản"
      :message="`Bạn có chắc chắn muốn khôi phục về phiên bản ${revertTarget?.version}? Dữ liệu hiện tại sẽ được lưu lại trước khi khôi phục.`"
      confirm-text="Khôi phục"
      @confirm="doRevert"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  memberId: number
  currentMember: any
}>()

const emit = defineEmits<{
  reverted: []
}>()

const expanded = ref(false)
const loading = ref(false)
const versions = ref<any[]>([])

const showDetail = ref(false)
const detailVersion = ref<any>(null)

const showRevertConfirm = ref(false)
const revertTarget = ref<any>(null)
const showCount = ref(5)

const displayedVersions = computed(() => versions.value.slice(0, showCount.value))

const fieldDefs = [
  { key: 'fullName', label: 'Họ tên' },
  { key: 'gender', label: 'Giới tính', format: (v: string) => v === 'male' ? 'Nam' : 'Nữ' },
  { key: 'birthDate', label: 'Ngày sinh', format: formatDate },
  { key: 'deathDate', label: 'Ngày mất', format: formatDate },
  { key: 'isAlive', label: 'Còn sống', format: (v: boolean) => v ? 'Có' : 'Không' },
  { key: 'birthPlace', label: 'Nơi sinh' },
  { key: 'bio', label: 'Tiểu sử' },
  { key: 'generation', label: 'Đời' },
  { key: 'birthOrder', label: 'Thứ tự' },
]

const comparedFields = computed(() => {
  if (!detailVersion.value || !props.currentMember) return []

  return fieldDefs.map((fd) => {
    const vVal = detailVersion.value[fd.key]
    const cVal = props.currentMember[fd.key]
    const fmt = fd.format || ((v: any) => v)
    const versionValue = vVal != null ? fmt(vVal) : null
    const currentValue = cVal != null ? fmt(cVal) : null
    return {
      key: fd.key,
      label: fd.label,
      versionValue,
      currentValue,
      changed: String(vVal ?? '') !== String(cVal ?? ''),
    }
  })
})

function formatDate(v: string | null) {
  if (!v) return null
  return new Date(v).toLocaleDateString('vi-VN')
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
  return date.toLocaleDateString('vi-VN')
}

function badgeColor(type: string) {
  if (type === 'create') return 'bg-green-500'
  if (type === 'revert') return 'bg-amber-500'
  return 'bg-blue-500'
}

function typeTagClass(type: string) {
  if (type === 'create') return 'bg-green-100 text-green-700'
  if (type === 'revert') return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}

function typeLabel(type: string) {
  if (type === 'create') return 'Tạo mới'
  if (type === 'revert') return 'Khôi phục'
  return 'Chỉnh sửa'
}

async function fetchVersions() {
  loading.value = true
  try {
    versions.value = await $fetch<any[]>(`/api/members/${props.memberId}/versions`)
  } catch {
    versions.value = []
  } finally {
    loading.value = false
  }
}

function viewDetail(v: any) {
  detailVersion.value = v
  showDetail.value = true
}

function confirmRevert(v: any) {
  revertTarget.value = v
  showRevertConfirm.value = true
}

async function doRevert() {
  if (!revertTarget.value) return
  showRevertConfirm.value = false
  try {
    await $fetch(`/api/members/${props.memberId}/versions/${revertTarget.value.id}/revert`, {
      method: 'POST',
    })
    await fetchVersions()
    emit('reverted')
  } catch (e: any) {
    alert(e.data?.message || 'Khôi phục thất bại')
  }
}

watch(expanded, (val) => {
  if (val && versions.value.length === 0) {
    fetchVersions()
  }
})

watch(() => props.currentMember?.updatedAt, () => {
  if (expanded.value) {
    fetchVersions()
  }
})
</script>
