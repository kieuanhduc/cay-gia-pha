<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Nhập / Xuất dữ liệu</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Export JSON -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          <Icon name="ph:file-json-bold" class="text-primary-600 mr-2" />
          Xuất JSON
        </h2>
        <p class="text-sm text-gray-500 mb-4">Xuất dữ liệu gia phả ra file JSON.</p>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chọn dòng họ</label>
            <select v-model="exportFamilyLineId" class="input-field">
              <option value="">-- Chọn dòng họ --</option>
              <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">
                {{ fl.name }} ({{ fl.memberCount }} thành viên)
              </option>
            </select>
          </div>
          <button
            @click="exportJson"
            :disabled="!exportFamilyLineId || exporting"
            class="btn-primary w-full"
          >
            {{ exporting ? 'Đang xuất...' : 'Xuất 1 dòng họ (JSON)' }}
          </button>
          <button
            @click="exportAllJson"
            :disabled="exportingAll"
            class="btn-secondary w-full"
          >
            {{ exportingAll ? 'Đang xuất...' : 'Xuất tất cả dòng họ (JSON)' }}
          </button>
        </div>
      </div>

      <!-- Export Excel -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          <Icon name="ph:file-xls-bold" class="text-green-600 mr-2" />
          Xuất Excel
        </h2>
        <p class="text-sm text-gray-500 mb-4">Xuất dữ liệu ra file Excel (.xlsx) để xem và chỉnh sửa.</p>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chọn dòng họ</label>
            <select v-model="excelFamilyLineId" class="input-field">
              <option value="">Tất cả dòng họ</option>
              <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">
                {{ fl.name }} ({{ fl.memberCount }} thành viên)
              </option>
            </select>
          </div>
          <button
            @click="exportExcel"
            :disabled="exportingExcel"
            class="btn-primary w-full !bg-green-600 hover:!bg-green-700"
          >
            {{ exportingExcel ? 'Đang xuất...' : 'Tải file Excel' }}
          </button>
        </div>
      </div>

      <!-- Import JSON -->
      <div v-if="isAdmin" class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          <Icon name="ph:upload-bold" class="text-blue-600 mr-2" />
          Nhập dữ liệu
        </h2>
        <p class="text-sm text-gray-500 mb-4">Nhập dữ liệu gia phả từ file JSON. Sẽ tạo dòng họ mới.</p>

        <div class="space-y-4">
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
            @click="fileInputRef?.click()"
            @drop.prevent="handleDrop"
            @dragover.prevent
          >
            <Icon name="ph:file-arrow-up" class="text-gray-400 text-4xl mb-2" />
            <p class="text-sm text-gray-500">
              {{ importFile ? importFile.name : 'Kéo thả file JSON hoặc click để chọn' }}
            </p>
            <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleFileSelect" />
          </div>

          <div v-if="importPreview" class="bg-gray-50 rounded-lg p-3 text-sm">
            <p><strong>Dòng họ:</strong> {{ importPreview.familyLine?.name }}</p>
            <p><strong>Số thành viên:</strong> {{ importPreview.members?.length }}</p>
            <p><strong>Xuất ngày:</strong> {{ importPreview.exportedAt ? new Date(importPreview.exportedAt).toLocaleDateString('vi-VN') : 'N/A' }}</p>
          </div>

          <button
            @click="importData"
            :disabled="!importFile || importing"
            class="btn-primary w-full"
          >
            {{ importing ? 'Đang nhập...' : 'Nhập dữ liệu' }}
          </button>

          <div v-if="importResult" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
            {{ importResult }}
          </div>
        </div>
      </div>

      <!-- Backup / Restore -->
      <div v-if="isAdmin" class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          <Icon name="ph:database-bold" class="text-purple-600 mr-2" />
          Sao lưu & Khôi phục
        </h2>
        <p class="text-sm text-gray-500 mb-4">Sao lưu toàn bộ database hoặc khôi phục từ bản sao lưu.</p>

        <div class="space-y-3">
          <button
            @click="backupDatabase"
            :disabled="backingUp"
            class="btn-primary w-full !bg-purple-600 hover:!bg-purple-700"
          >
            <Icon name="ph:download-bold" class="mr-1" />
            {{ backingUp ? 'Đang tạo bản sao lưu...' : 'Sao lưu JSON (tất cả bảng)' }}
          </button>
          <button
            @click="backupSql"
            :disabled="backingSql"
            class="btn-secondary w-full"
          >
            <Icon name="ph:cylinder-bold" class="mr-1" />
            {{ backingSql ? 'Đang dump...' : 'Dump MySQL (.sql)' }}
          </button>

          <div v-if="sqlError" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {{ sqlError }}
          </div>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200" />
            </div>
            <div class="relative flex justify-center">
              <span class="bg-white px-3 text-sm text-gray-400">khôi phục</span>
            </div>
          </div>

          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
            @click="restoreInputRef?.click()"
            @drop.prevent="handleRestoreDrop"
            @dragover.prevent
          >
            <Icon name="ph:arrow-counter-clockwise" class="text-gray-400 text-3xl mb-2" />
            <p class="text-sm text-gray-500">
              {{ restoreFile ? restoreFile.name : 'Kéo thả file backup để khôi phục' }}
            </p>
            <input ref="restoreInputRef" type="file" accept=".json" class="hidden" @change="handleRestoreSelect" />
          </div>

          <div v-if="restorePreview" class="bg-purple-50 rounded-lg p-3 text-sm space-y-1">
            <p><strong>Loại:</strong> Bản sao lưu toàn bộ</p>
            <p><strong>Ngày tạo:</strong> {{ new Date(restorePreview.createdAt).toLocaleString('vi-VN') }}</p>
            <p><strong>Dòng họ:</strong> {{ restorePreview.tables?.familyLines?.length || 0 }}</p>
            <p><strong>Thành viên:</strong> {{ restorePreview.tables?.members?.length || 0 }}</p>
          </div>

          <button
            v-if="restoreFile"
            @click="showRestoreConfirm = true"
            :disabled="restoring"
            class="btn-danger w-full"
          >
            {{ restoring ? 'Đang khôi phục...' : 'Khôi phục dữ liệu' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Restore confirmation dialog -->
    <div
      v-if="showRestoreConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showRestoreConfirm = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icon name="ph:warning-bold" class="text-red-600 text-xl" />
          </div>
          <h3 class="text-lg font-bold text-gray-900">Xác nhận khôi phục</h3>
        </div>
        <p class="text-sm text-gray-600 mb-2">
          Thao tác này sẽ <strong class="text-red-600">xoá toàn bộ dữ liệu hiện tại</strong> và thay thế bằng dữ liệu từ bản sao lưu.
        </p>
        <p class="text-sm text-gray-500 mb-5">Hành động này không thể hoàn tác. Hãy chắc chắn bạn đã sao lưu dữ liệu hiện tại.</p>
        <div class="flex gap-3">
          <button class="btn-secondary flex-1" @click="showRestoreConfirm = false">Huỷ</button>
          <button class="btn-danger flex-1" @click="restoreDatabase">Khôi phục</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { canEdit, isAdmin } = useAuth()
if (!canEdit.value) {
  navigateTo('/admin')
}

const { data: familyLinesData } = await useFetch<any[]>('/api/family-lines')
const familyLines = computed(() => familyLinesData.value || [])

const fileInputRef = ref<HTMLInputElement>()
const restoreInputRef = ref<HTMLInputElement>()

// === Export JSON (1 dòng họ) ===
const exportFamilyLineId = ref('')
const exporting = ref(false)

async function exportJson() {
  exporting.value = true
  try {
    const data = await $fetch(`/api/data/export?familyLineId=${exportFamilyLineId.value}`)
    downloadJson(data, `gia-pha-export-${Date.now()}.json`)
  } catch (e: any) {
    alert(e.data?.message || 'Xuất thất bại')
  } finally {
    exporting.value = false
  }
}

// === Export All JSON ===
const exportingAll = ref(false)

async function exportAllJson() {
  exportingAll.value = true
  try {
    const data = await $fetch('/api/data/export-all')
    downloadJson(data, `gia-pha-all-${Date.now()}.json`)
  } catch (e: any) {
    alert(e.data?.message || 'Xuất thất bại')
  } finally {
    exportingAll.value = false
  }
}

// === Export Excel ===
const excelFamilyLineId = ref('')
const exportingExcel = ref(false)

async function exportExcel() {
  exportingExcel.value = true
  try {
    const query = excelFamilyLineId.value ? `?familyLineId=${excelFamilyLineId.value}` : ''
    const blob = await $fetch<Blob>(`/api/data/export-excel${query}`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gia-pha-${Date.now()}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    alert(e.data?.message || 'Xuất Excel thất bại')
  } finally {
    exportingExcel.value = false
  }
}

// === Import JSON ===
const importFile = ref<File | null>(null)
const importPreview = ref<any>(null)
const importing = ref(false)
const importResult = ref('')

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadFile(file)
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file) loadFile(file)
}

function loadFile(file: File) {
  importFile.value = file
  importResult.value = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      importPreview.value = JSON.parse(e.target?.result as string)
    } catch {
      importPreview.value = null
      alert('File JSON không hợp lệ')
    }
  }
  reader.readAsText(file)
}

async function importData() {
  if (!importPreview.value) return
  importing.value = true
  importResult.value = ''
  try {
    const result = await $fetch<any>('/api/data/import', {
      method: 'POST',
      body: importPreview.value,
    })
    importResult.value = `Nhập thành công ${result.membersImported} thành viên!`
    importFile.value = null
    importPreview.value = null
  } catch (e: any) {
    alert(e.data?.message || 'Nhập thất bại')
  } finally {
    importing.value = false
  }
}

// === Backup / Restore ===
const backingUp = ref(false)
const restoreFile = ref<File | null>(null)
const restorePreview = ref<any>(null)
const restoring = ref(false)
const showRestoreConfirm = ref(false)

async function backupDatabase() {
  backingUp.value = true
  try {
    const data = await $fetch('/api/data/backup')
    downloadJson(data, `backup-full-${Date.now()}.json`)
  } catch (e: any) {
    alert(e.data?.message || 'Sao lưu thất bại')
  } finally {
    backingUp.value = false
  }
}

const backingSql = ref(false)
const sqlError = ref('')

async function backupSql() {
  backingSql.value = true
  sqlError.value = ''
  try {
    const sql = await $fetch<string>('/api/data/backup-sql', { responseType: 'text' })
    const blob = new Blob([sql], { type: 'application/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cay-gia-pha-${Date.now()}.sql`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    sqlError.value = e.data?.message || 'Dump MySQL thất bại. Kiểm tra mysqldump đã cài chưa.'
  } finally {
    backingSql.value = false
  }
}

function handleRestoreSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadRestoreFile(file)
}

function handleRestoreDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file) loadRestoreFile(file)
}

function loadRestoreFile(file: File) {
  restoreFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (data._type !== 'full_backup') {
        alert('File này không phải bản sao lưu hợp lệ')
        restoreFile.value = null
        restorePreview.value = null
        return
      }
      restorePreview.value = data
    } catch {
      restorePreview.value = null
      restoreFile.value = null
      alert('File JSON không hợp lệ')
    }
  }
  reader.readAsText(file)
}

async function restoreDatabase() {
  if (!restorePreview.value) return
  showRestoreConfirm.value = false
  restoring.value = true
  try {
    await $fetch('/api/data/restore', {
      method: 'POST',
      body: restorePreview.value,
    })
    alert('Khôi phục dữ liệu thành công! Trang sẽ được tải lại.')
    window.location.reload()
  } catch (e: any) {
    alert(e.data?.message || 'Khôi phục thất bại')
  } finally {
    restoring.value = false
  }
}

// === Helpers ===
function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>
