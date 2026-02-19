<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Quản lý dòng họ</h1>
      <button v-if="canEdit" @click="showForm = true" class="btn-primary inline-flex items-center gap-2">
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
      <div v-for="fl in familyLines" :key="fl.id" class="card flex items-center justify-between">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-gray-900">{{ fl.name }}</h3>
            <span
              v-if="fl.isPublic"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
            >
              <Icon name="ph:globe" class="text-[10px]" />
              Chia sẻ
            </span>
          </div>
          <p v-if="fl.originPlace" class="text-sm text-gray-500 mt-0.5">
            <Icon name="ph:map-pin" class="mr-1" />{{ fl.originPlace }}
          </p>
          <p class="text-sm text-gray-400 mt-0.5">{{ fl.memberCount }} thành viên</p>
          <p v-if="fl.isPublic && shareInfoMap[fl.id]" class="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <Icon name="ph:user-circle" class="text-sm" />
            Chia sẻ bởi <strong>{{ shareInfoMap[fl.id].userName }}</strong>
            <span class="text-blue-400">&middot; {{ timeAgo(shareInfoMap[fl.id].createdAt) }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <button
            v-if="canEdit"
            @click="openShareDialog(fl)"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            :class="fl.isPublic ? 'text-green-600' : 'text-gray-500'"
            title="Chia sẻ"
          >
            <Icon name="ph:share-network" />
          </button>
          <NuxtLink :to="`/tree/${fl.id}`" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Xem cây">
            <Icon name="ph:tree-structure" />
          </NuxtLink>
          <button v-if="canEdit" @click="editFamilyLine(fl)" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Sửa">
            <Icon name="ph:pencil-simple" />
          </button>
          <button v-if="isAdmin" @click="confirmDelete(fl)" class="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Xóa">
            <Icon name="ph:trash" />
          </button>
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
