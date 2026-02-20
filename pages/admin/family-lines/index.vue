<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Quản lý dòng họ</h1>
      <button v-if="canEdit" @click="showForm = true" class="btn-primary inline-flex items-center gap-2 shrink-0">
        <Icon name="ph:plus-bold" />
        Thêm dòng họ
      </button>
    </div>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="!familyLines?.length" class="card text-center py-12">
      <Icon name="ph:users-three" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Chưa có dòng họ nào</p>
      <button v-if="canEdit" @click="showForm = true" class="btn-primary mt-4">Tạo dòng họ đầu tiên</button>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(fl, index) in familyLines"
        :key="fl.id"
        class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-0">
          <!-- Left accent bar -->
          <div class="hidden sm:block w-1 self-stretch shrink-0" :class="accentColors[index % accentColors.length]" />

          <!-- Main content -->
          <div class="flex-1 min-w-0 px-4 pt-4 pb-3 sm:py-4">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <!-- Mobile accent dot -->
              <div class="w-2.5 h-2.5 rounded-full sm:hidden shrink-0" :class="accentColors[index % accentColors.length]" />
              <h3 class="font-semibold text-gray-900 text-base">{{ fl.name }}</h3>
              <span
                v-if="fl.isPublic"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
              >
                <Icon name="ph:globe" class="text-[10px]" />
                Công khai
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-gray-500">
              <span v-if="fl.originPlace" class="flex items-center gap-1">
                <Icon name="ph:map-pin" class="text-gray-400 shrink-0" />
                {{ fl.originPlace }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="ph:users-bold" class="text-gray-400 shrink-0" />
                {{ fl.memberCount }} thành viên
              </span>
            </div>

            <p v-if="fl.isPublic && shareInfoMap[fl.id]" class="text-xs text-blue-500 mt-1 flex items-center gap-1">
              <Icon name="ph:user-circle" class="shrink-0" />
              Chia sẻ bởi <strong>{{ shareInfoMap[fl.id].userName }}</strong>
              <span class="text-blue-300">· {{ timeAgo(shareInfoMap[fl.id].createdAt) }}</span>
            </p>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 min-[400px]:grid-cols-4 sm:flex sm:flex-col sm:justify-center gap-1 p-3 sm:p-2 border-t border-gray-50 sm:border-0 sm:border-l">
            <button
              v-if="canEdit"
              @click="openShareDialog(fl)"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-colors"
              :class="fl.isPublic ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 sm:bg-transparent'"
              title="Chia sẻ"
            >
              <Icon name="ph:share-network" class="text-base shrink-0" />
              <span class="sm:hidden">Chia sẻ</span>
            </button>
            <NuxtLink
              :to="`/tree/${fl.id}`"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 sm:bg-transparent sm:hover:bg-primary-50 transition-colors"
              title="Xem cây"
            >
              <Icon name="ph:tree-structure" class="text-base shrink-0" />
              <span class="sm:hidden">Xem cây</span>
            </NuxtLink>
            <button
              v-if="canEdit"
              @click="editFamilyLine(fl)"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 sm:bg-transparent transition-colors"
              title="Sửa"
            >
              <Icon name="ph:pencil-simple" class="text-base shrink-0" />
              <span class="sm:hidden">Sửa</span>
            </button>
            <button
              v-if="isAdmin"
              @click="confirmDelete(fl)"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 sm:bg-transparent transition-colors"
              title="Xóa"
            >
              <Icon name="ph:trash" class="text-base shrink-0" />
              <span class="sm:hidden">Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editingId ? 'Sửa dòng họ' : 'Thêm dòng họ'">
      <form @submit.prevent="saveFamilyLine" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên dòng họ *</label>
          <input v-model="form.name" class="input-field" placeholder="VD: Dòng họ Nguyễn - Hà Nội" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quê quán gốc</label>
          <input v-model="form.originPlace" class="input-field" placeholder="VD: Hà Nội, Việt Nam" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea v-model="form.description" class="input-field" rows="3" placeholder="Giới thiệu về dòng họ..." />
        </div>
        <div v-if="formError" class="text-sm text-red-600">{{ formError }}</div>
        <div class="flex gap-3 justify-end">
          <button type="button" class="btn-secondary" @click="showForm = false">Hủy</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Đang lưu...' : 'Lưu' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirm -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      :message="`Xóa dòng họ '${deletingItem?.name}' và tất cả thành viên trong đó?`"
      :loading="deleting"
      @confirm="deleteFamilyLine"
    />

    <!-- Share Dialog -->
    <ShareDialog
      v-if="sharingItem"
      v-model="showShareDialog"
      :family-line="sharingItem"
      @updated="refresh"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { canEdit, isAdmin } = useAuth()

const accentColors = [
  'bg-primary-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-violet-500', 'bg-amber-500', 'bg-rose-500',
]
const nuxtApp = useNuxtApp()
const { data: familyLines, pending, refresh } = useLazyFetch<any[]>('/api/family-lines', {
  getCachedData: (key) => nuxtApp.payload.data[key] as any,
})

const shareInfoMap = ref<Record<number, { userName: string; createdAt: string }>>({})

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

async function loadShareInfo() {
  if (!familyLines.value) return
  const publicLines = familyLines.value.filter((fl: any) => fl.isPublic)
  const results = await Promise.all(
    publicLines.map(async (fl: any) => {
      try {
        const info = await $fetch<any>(`/api/family-lines/${fl.id}/share-info`)
        return { id: fl.id, info }
      } catch {
        return { id: fl.id, info: null }
      }
    })
  )
  const map: Record<number, any> = {}
  for (const r of results) {
    if (r.info) map[r.id] = r.info
  }
  shareInfoMap.value = map
}

// loadShareInfo chỉ gọi khi cần (không auto-call để tránh N+1 requests khi load trang)

const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', description: '', originPlace: '' })
const formError = ref('')
const saving = ref(false)

const showDeleteConfirm = ref(false)
const deletingItem = ref<any>(null)
const deleting = ref(false)

const showShareDialog = ref(false)
const sharingItem = ref<any>(null)

function editFamilyLine(fl: any) {
  editingId.value = fl.id
  form.value = { name: fl.name, description: fl.description || '', originPlace: fl.originPlace || '' }
  showForm.value = true
}

function openShareDialog(fl: any) {
  sharingItem.value = {
    id: fl.id,
    name: fl.name,
    isPublic: fl.isPublic || false,
    shareToken: fl.shareToken || null,
  }
  showShareDialog.value = true
}

function confirmDelete(fl: any) {
  deletingItem.value = fl
  showDeleteConfirm.value = true
}

async function saveFamilyLine() {
  formError.value = ''
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/family-lines/${editingId.value}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/family-lines', { method: 'POST', body: form.value })
    }
    showForm.value = false
    editingId.value = null
    form.value = { name: '', description: '', originPlace: '' }
    await refresh()
  } catch (e: any) {
    formError.value = e.data?.message || 'Có lỗi xảy ra'
  } finally {
    saving.value = false
  }
}

async function deleteFamilyLine() {
  if (!deletingItem.value) return
  deleting.value = true
  try {
    await $fetch(`/api/family-lines/${deletingItem.value.id}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    deletingItem.value = null
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Xóa thất bại')
  } finally {
    deleting.value = false
  }
}

watch(showForm, (val) => {
  if (!val) {
    editingId.value = null
    form.value = { name: '', description: '', originPlace: '' }
    formError.value = ''
  }
})
</script>
