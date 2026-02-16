<template>
  <div class="card">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Icon name="ph:images-bold" class="text-primary-600" />
        Thư viện ảnh
        <span v-if="photos.length" class="text-sm font-normal text-gray-400">
          ({{ photos.length }} ảnh)
        </span>
      </h2>
      <button
        v-if="canEdit"
        class="btn-primary text-sm flex items-center gap-1"
        @click="triggerUpload"
      >
        <Icon name="ph:upload-simple-bold" />
        Tải ảnh lên
      </button>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Upload form (shown when file selected) -->
    <div v-if="uploadFile" class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex gap-4">
        <div class="shrink-0">
          <img
            :src="uploadPreview"
            alt="Xem trước"
            class="w-24 h-24 object-cover rounded-lg"
          />
        </div>
        <div class="flex-1 space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chú thích</label>
            <input
              v-model="uploadCaption"
              type="text"
              class="input-field"
              placeholder="Mô tả ảnh..."
              maxlength="500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày chụp</label>
            <input
              v-model="uploadTakenDate"
              type="date"
              class="input-field"
            />
          </div>
          <div class="flex gap-2">
            <button
              class="btn-primary text-sm flex items-center gap-1"
              :disabled="uploading"
              @click="doUpload"
            >
              <Icon v-if="uploading" name="ph:spinner-bold" class="animate-spin" />
              <Icon v-else name="ph:cloud-arrow-up-bold" />
              {{ uploading ? 'Đang tải...' : 'Lưu ảnh' }}
            </button>
            <button
              class="btn-secondary text-sm"
              :disabled="uploading"
              @click="cancelUpload"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <LoadingSpinner text="Đang tải ảnh..." />
    </div>

    <!-- Empty state -->
    <div v-else-if="!photos.length" class="text-center py-8 text-gray-400">
      <Icon name="ph:image-bold" class="text-4xl mb-2" />
      <p class="text-sm">Chưa có ảnh nào</p>
    </div>

    <!-- Photo grid -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
        @click="openLightbox(index)"
      >
        <img
          :src="photo.url"
          :alt="photo.caption || 'Ảnh'"
          class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <!-- Overlay on hover -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
          <!-- Edit/Delete buttons -->
          <div
            v-if="canEdit"
            class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop
          >
            <button
              class="p-1.5 rounded-lg bg-white/90 text-gray-600 hover:bg-white hover:text-primary-600 transition-colors"
              title="Chỉnh sửa"
              @click="startEdit(photo)"
            >
              <Icon name="ph:pencil-simple-bold" class="text-sm" />
            </button>
            <button
              class="p-1.5 rounded-lg bg-white/90 text-gray-600 hover:bg-white hover:text-red-600 transition-colors"
              title="Xóa ảnh"
              @click="confirmDelete(photo)"
            >
              <Icon name="ph:trash-bold" class="text-sm" />
            </button>
          </div>
          <!-- Caption at bottom -->
          <div
            v-if="photo.caption"
            class="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/50 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {{ photo.caption }}
          </div>
        </div>
      </div>
    </div>

    <!-- Edit modal -->
    <BaseModal v-model="showEditModal" title="Chỉnh sửa ảnh" size="sm">
      <div class="space-y-4">
        <div v-if="editingPhoto" class="flex justify-center">
          <img
            :src="editingPhoto.url"
            :alt="editingPhoto.caption || 'Ảnh'"
            class="max-h-48 rounded-lg object-contain"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Chú thích</label>
          <input
            v-model="editCaption"
            type="text"
            class="input-field"
            placeholder="Mô tả ảnh..."
            maxlength="500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ngày chụp</label>
          <input
            v-model="editTakenDate"
            type="date"
            class="input-field"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="btn-secondary" @click="showEditModal = false">Hủy</button>
          <button
            class="btn-primary flex items-center gap-1"
            :disabled="saving"
            @click="saveEdit"
          >
            <Icon v-if="saving" name="ph:spinner-bold" class="animate-spin" />
            {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Delete confirm -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Xóa ảnh"
      message="Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể hoàn tác."
      confirm-text="Xóa"
      @confirm="doDelete"
    />

    <!-- Lightbox -->
    <Lightbox
      v-model="showLightbox"
      :images="lightboxImages"
      :start-index="lightboxIndex"
    />
  </div>
</template>

<script setup lang="ts">
interface Photo {
  id: number
  memberId: number
  url: string
  caption: string | null
  takenDate: string | null
  sortOrder: number
  createdAt: string
}

const props = defineProps<{
  memberId: number
  canEdit: boolean
}>()

// State
const photos = ref<Photo[]>([])
const loading = ref(false)

// Upload state
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadFile = ref<File | null>(null)
const uploadPreview = ref('')
const uploadCaption = ref('')
const uploadTakenDate = ref('')
const uploading = ref(false)

// Edit state
const showEditModal = ref(false)
const editingPhoto = ref<Photo | null>(null)
const editCaption = ref('')
const editTakenDate = ref('')
const saving = ref(false)

// Delete state
const showDeleteConfirm = ref(false)
const deletingPhoto = ref<Photo | null>(null)

// Lightbox state
const showLightbox = ref(false)
const lightboxIndex = ref(0)

const lightboxImages = computed(() =>
  photos.value.map((p) => ({
    url: p.url,
    caption: p.caption,
  }))
)

// Fetch photos
async function fetchPhotos() {
  loading.value = true
  try {
    photos.value = await $fetch<Photo[]>(`/api/members/${props.memberId}/photos`)
  } catch {
    photos.value = []
  } finally {
    loading.value = false
  }
}

// Upload
function triggerUpload() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadFile.value = file
  uploadPreview.value = URL.createObjectURL(file)
  uploadCaption.value = ''
  uploadTakenDate.value = ''

  // Reset input so same file can be selected again
  input.value = ''
}

function cancelUpload() {
  if (uploadPreview.value) {
    URL.revokeObjectURL(uploadPreview.value)
  }
  uploadFile.value = null
  uploadPreview.value = ''
  uploadCaption.value = ''
  uploadTakenDate.value = ''
}

async function doUpload() {
  if (!uploadFile.value) return
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('photo', uploadFile.value)
    if (uploadCaption.value) {
      formData.append('caption', uploadCaption.value)
    }
    if (uploadTakenDate.value) {
      formData.append('takenDate', uploadTakenDate.value)
    }

    await $fetch(`/api/members/${props.memberId}/photos`, {
      method: 'POST',
      body: formData,
    })

    cancelUpload()
    await fetchPhotos()
  } catch (e: any) {
    alert(e.data?.message || 'Tải ảnh thất bại')
  } finally {
    uploading.value = false
  }
}

// Edit
function startEdit(photo: Photo) {
  editingPhoto.value = photo
  editCaption.value = photo.caption || ''
  editTakenDate.value = photo.takenDate
    ? new Date(photo.takenDate).toISOString().split('T')[0]
    : ''
  showEditModal.value = true
}

async function saveEdit() {
  if (!editingPhoto.value) return
  saving.value = true

  try {
    await $fetch(`/api/members/${props.memberId}/photos/${editingPhoto.value.id}`, {
      method: 'PUT',
      body: {
        caption: editCaption.value || null,
        takenDate: editTakenDate.value || null,
      },
    })

    showEditModal.value = false
    await fetchPhotos()
  } catch (e: any) {
    alert(e.data?.message || 'Lưu thất bại')
  } finally {
    saving.value = false
  }
}

// Delete
function confirmDelete(photo: Photo) {
  deletingPhoto.value = photo
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingPhoto.value) return
  showDeleteConfirm.value = false

  try {
    await $fetch(`/api/members/${props.memberId}/photos/${deletingPhoto.value.id}`, {
      method: 'DELETE',
    })
    await fetchPhotos()
  } catch (e: any) {
    alert(e.data?.message || 'Xóa ảnh thất bại')
  }
}

// Lightbox
function openLightbox(index: number) {
  lightboxIndex.value = index
  showLightbox.value = true
}

// Init
onMounted(() => {
  fetchPhotos()
})
</script>
