<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-900">Quản lý thành viên</h1>
        <button
          v-if="canEdit && selectedIds.length > 0"
          @click="confirmBulkDelete"
          class="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Icon name="ph:trash-bold" />
          Xóa {{ selectedIds.length }} mục
        </button>
      </div>
      <NuxtLink v-if="canEdit" to="/admin/members/create" class="btn-primary inline-flex items-center gap-2">
        <Icon name="ph:user-plus-bold" />
        Thêm thành viên
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3">
        <select v-model="filters.familyLineId" class="input-field w-auto">
          <option value="">Tất cả dòng họ</option>
          <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">{{ fl.name }}</option>
        </select>
        <input
          v-model="filters.search"
          class="input-field w-auto flex-1 min-w-[200px]"
          placeholder="Tìm theo tên..."
          @input="debouncedSearch"
        />
        <select v-model="filters.generation" class="input-field w-auto">
          <option value="">Tất cả đời</option>
          <option v-for="g in 10" :key="g" :value="g">Đời {{ g }}</option>
        </select>
      </div>
    </div>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="!members?.length" class="card text-center py-12">
      <Icon name="ph:user" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Chưa có thành viên nào</p>
      <NuxtLink v-if="canEdit" to="/admin/members/create" class="btn-primary mt-4 inline-block">Thêm thành viên đầu tiên</NuxtLink>
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th v-if="canEdit" class="py-3 px-2 w-10">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                title="Chọn tất cả"
              />
            </th>
            <th class="text-left py-3 px-2 font-medium text-gray-500">Họ tên</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden sm:table-cell">Giới tính</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden sm:table-cell">Đời</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Dòng họ</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden lg:table-cell">Cha</th>
            <th v-if="canEdit" class="text-right py-3 px-2 font-medium text-gray-500">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in members" :key="m.id" class="border-b border-gray-50 hover:bg-gray-50" :class="selectedIds.includes(m.id) ? 'bg-primary-50' : ''">
            <td v-if="canEdit" class="py-3 px-2">
              <input
                type="checkbox"
                :checked="selectedIds.includes(m.id)"
                @change="toggleSelect(m.id)"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </td>
            <td class="py-3 px-2">
              <div class="flex items-center gap-2">
                <img
                  :src="m.avatarUrl || defaultAvatar"
                  :alt="m.fullName"
                  class="w-8 h-8 rounded-full object-cover bg-gray-200"
                  @error="($event.target as HTMLImageElement).src = defaultAvatar"
                />
                <span class="font-medium text-gray-900">{{ m.fullName }}</span>
              </div>
            </td>
            <td class="py-3 px-2 hidden sm:table-cell">
              <span :class="m.gender === 'male' ? 'text-blue-600' : 'text-pink-600'">
                {{ m.gender === 'male' ? 'Nam' : 'Nữ' }}
              </span>
            </td>
            <td class="py-3 px-2 hidden sm:table-cell">Đời {{ m.generation }}</td>
            <td class="py-3 px-2 text-gray-500 hidden md:table-cell">{{ m.familyLine?.name }}</td>
            <td class="py-3 px-2 text-gray-500 hidden lg:table-cell">{{ m.father?.fullName || '—' }}</td>
            <td v-if="canEdit" class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <NuxtLink :to="`/admin/members/${m.id}`" class="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Sửa">
                  <Icon name="ph:pencil-simple" />
                </NuxtLink>
                <button @click="confirmDelete(m)" class="p-1.5 rounded hover:bg-red-50 text-red-500" title="Xóa">
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
          @click="filters.page = p"
          class="w-8 h-8 rounded text-sm"
          :class="p === filters.page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <ConfirmDialog
      v-model="showDeleteConfirm"
      :message="`Xóa thành viên '${deletingItem?.fullName}'?`"
      @confirm="deleteMember"
    />
    
    <ConfirmDialog
      v-model="showBulkDeleteConfirm"
      :message="`Xóa ${selectedIds.length} thành viên đã chọn?`"
      @confirm="bulkDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const defaultAvatar = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23e5e7eb" width="40" height="40" rx="20"/><circle cx="20" cy="16" r="7" fill="%239ca3af"/><path d="M5 38c0-8.3 6.7-15 15-15s15 6.7 15 15" fill="%239ca3af"/></svg>`

const { canEdit } = useAuth()
const filters = ref({ familyLineId: '', search: '', generation: '', page: 1 })
const limit = 50

const { data: familyLinesData } = await useFetch('/api/family-lines')
const familyLines = computed(() => familyLinesData.value || [])

const queryParams = computed(() => {
  const params: any = { page: filters.value.page, limit }
  if (filters.value.familyLineId) params.familyLineId = filters.value.familyLineId
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.generation) params.generation = filters.value.generation
  return params
})

const { data, pending, refresh } = await useFetch<any>('/api/members', { query: queryParams })
const members = computed(() => data.value?.members || [])
const total = computed(() => data.value?.total || 0)

let searchTimeout: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { filters.value.page = 1 }, 300)
}

// Bulk delete state
const selectedIds = ref<number[]>([])
const showBulkDeleteConfirm = ref(false)

const isAllSelected = computed(() => 
  members.value.length > 0 && selectedIds.value.length === members.value.length
)

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = members.value.map((m: any) => m.id)
  }
}

function toggleSelect(id: number) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function confirmBulkDelete() {
  if (selectedIds.value.length === 0) return
  showBulkDeleteConfirm.value = true
}

async function bulkDelete() {
  if (selectedIds.value.length === 0) return
  
  try {
    // Xóa tuần tự từng member
    for (const id of selectedIds.value) {
      await $fetch(`/api/members/${id}`, { method: 'DELETE' })
    }
    
    showBulkDeleteConfirm.value = false
    selectedIds.value = []
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Xóa thất bại')
  }
}

// Single delete
const showDeleteConfirm = ref(false)
const deletingItem = ref<any>(null)

function confirmDelete(m: any) {
  deletingItem.value = m
  showDeleteConfirm.value = true
}

async function deleteMember() {
  if (!deletingItem.value) return
  try {
    await $fetch(`/api/members/${deletingItem.value.id}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    deletingItem.value = null
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Xóa thất bại')
  }
}

// Clear selection when filters change
watch(() => filters.value.page, () => { selectedIds.value = [] })
watch(() => filters.value.familyLineId, () => { selectedIds.value = [] })
watch(() => filters.value.generation, () => { selectedIds.value = [] })
</script>
