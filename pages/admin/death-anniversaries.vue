<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      <Icon name="ph:flower" class="text-primary-600 mr-2" />
      Ngày giỗ
    </h1>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Dòng họ</label>
          <select v-model="filterFamilyLine" class="input-field" @change="loadData">
            <option value="">Tất cả</option>
            <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">{{ fl.name }}</option>
          </select>
        </div>
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Tháng âm lịch</label>
          <select v-model="filterMonth" class="input-field" @change="loadData">
            <option value="">Tất cả</option>
            <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
          </select>
        </div>
        <button v-if="canEdit" @click="openAddModal" class="btn-primary">
          <Icon name="ph:plus-bold" class="mr-1" />
          Thêm ngày giỗ
        </button>
      </div>
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="loading" />

    <!-- Empty state -->
    <div v-else-if="!items.length" class="card text-center py-12">
      <Icon name="ph:flower" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Chưa có ngày giỗ nào được ghi nhận</p>
      <button v-if="canEdit" @click="openAddModal" class="btn-primary mt-4">
        <Icon name="ph:plus-bold" class="mr-1" />
        Thêm ngày giỗ đầu tiên
      </button>
    </div>

    <!-- Table -->
    <div v-else class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left">
            <th class="pb-3 font-semibold text-gray-700">Họ tên</th>
            <th class="pb-3 font-semibold text-gray-700">Ngày giỗ (âm lịch)</th>
            <th class="pb-3 font-semibold text-gray-700 hidden md:table-cell">Ghi chú</th>
            <th class="pb-3 font-semibold text-gray-700 hidden sm:table-cell">Dòng họ</th>
            <th v-if="canEdit" class="pb-3 font-semibold text-gray-700 w-24"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td class="py-3">
              <div class="font-medium text-gray-900">{{ item.fullName }}</div>
              <div v-if="item.member" class="text-xs text-gray-400 mt-0.5">
                Đời {{ item.member.generation }} · Thành viên trong gia phả
              </div>
            </td>
            <td class="py-3">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-medium text-xs">
                <Icon name="ph:moon-bold" class="text-amber-600" />
                {{ item.lunarDate }}
              </span>
            </td>
            <td class="py-3 text-gray-600 max-w-[200px] truncate hidden md:table-cell">
              {{ item.note || '—' }}
            </td>
            <td class="py-3 text-gray-500 text-xs hidden sm:table-cell">{{ item.familyLine?.name || '—' }}</td>
            <td v-if="canEdit" class="py-3">
              <div class="flex gap-1">
                <button
                  @click="openEditModal(item)"
                  class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary-600"
                  title="Sửa"
                >
                  <Icon name="ph:pencil-simple" />
                </button>
                <button
                  @click="confirmDelete(item)"
                  class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
                  title="Xoá"
                >
                  <Icon name="ph:trash-simple" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          {{ editingItem ? 'Sửa ngày giỗ' : 'Thêm ngày giỗ' }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên <span class="text-red-500">*</span></label>
            <input
              v-model="form.fullName"
              class="input-field"
              placeholder="Nhập họ tên người đã mất..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày giỗ âm lịch <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <div class="flex-1">
                <input
                  v-model="formDay"
                  type="number"
                  min="1"
                  max="30"
                  class="input-field"
                  placeholder="Ngày"
                />
              </div>
              <div class="flex items-center text-gray-400 font-bold">/</div>
              <div class="flex-1">
                <select v-model="formMonth" class="input-field">
                  <option value="">Chọn tháng</option>
                  <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
                </select>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-1">Theo âm lịch</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dòng họ</label>
            <select v-model="form.familyLineId" class="input-field">
              <option value="">Không chọn</option>
              <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">{{ fl.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              v-model="form.note"
              class="input-field"
              rows="2"
              placeholder="VD: Giỗ tại nhà thờ họ, cúng chay..."
            />
          </div>

          <!-- Error -->
          <div v-if="formError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {{ formError }}
          </div>

          <div class="flex gap-3 pt-2">
            <button class="btn-secondary flex-1" @click="showModal = false">Huỷ</button>
            <button class="btn-primary flex-1" @click="saveForm" :disabled="saving">
              {{ saving ? 'Đang lưu...' : (editingItem ? 'Cập nhật' : 'Thêm') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Xoá ngày giỗ</h3>
        <p class="text-gray-600 text-sm mb-4">
          Bạn có chắc muốn xoá ngày giỗ của <strong>{{ deletingItem?.fullName }}</strong> ({{ deletingItem?.lunarDate }})?
        </p>
        <div class="flex gap-3">
          <button class="btn-secondary flex-1" @click="showDeleteConfirm = false">Huỷ</button>
          <button
            class="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            @click="doDelete"
            :disabled="saving"
          >
            {{ saving ? 'Đang xoá...' : 'Xoá' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { canEdit } = useAuth()
const nuxtApp = useNuxtApp()
const { data: familyLinesData } = useLazyFetch<any[]>('/api/family-lines', {
  getCachedData: (key) => nuxtApp.payload.data[key] as any,
})
const familyLines = computed(() => familyLinesData.value || [])

const filterFamilyLine = ref('')
const filterMonth = ref('')
const items = ref<any[]>([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const params: any = {}
    if (filterFamilyLine.value) params.familyLineId = filterFamilyLine.value
    if (filterMonth.value) params.month = filterMonth.value
    const query = new URLSearchParams(params).toString()
    items.value = await $fetch<any[]>(`/api/death-anniversaries?${query}`)
  } catch (e: any) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())

// === Form state ===
const showModal = ref(false)
const editingItem = ref<any>(null)
const form = reactive({
  fullName: '',
  note: '',
  familyLineId: '' as string | number,
})
const formDay = ref<number | string>('')
const formMonth = ref<number | string>('')
const formError = ref('')
const saving = ref(false)

function openAddModal() {
  editingItem.value = null
  form.fullName = ''
  form.note = ''
  form.familyLineId = ''
  formDay.value = ''
  formMonth.value = ''
  formError.value = ''
  showModal.value = true
}

function openEditModal(item: any) {
  editingItem.value = item
  form.fullName = item.fullName
  form.note = item.note || ''
  form.familyLineId = item.familyLineId || ''
  formError.value = ''

  // Parse lunarDate "DD/MM"
  const match = item.lunarDate?.match(/(\d{1,2})\/(\d{1,2})/)
  if (match) {
    formDay.value = Number(match[1])
    formMonth.value = Number(match[2])
  } else {
    formDay.value = ''
    formMonth.value = ''
  }

  showModal.value = true
}

async function saveForm() {
  formError.value = ''

  if (!form.fullName.trim()) {
    formError.value = 'Vui lòng nhập họ tên'
    return
  }
  if (!formDay.value || !formMonth.value) {
    formError.value = 'Vui lòng nhập ngày và tháng âm lịch'
    return
  }

  const day = Number(formDay.value)
  const month = Number(formMonth.value)
  if (day < 1 || day > 30) {
    formError.value = 'Ngày phải từ 1 đến 30'
    return
  }

  const lunarDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`

  saving.value = true
  try {
    const body: any = {
      fullName: form.fullName.trim(),
      lunarDate,
      note: form.note.trim() || null,
      familyLineId: form.familyLineId ? Number(form.familyLineId) : null,
    }

    if (editingItem.value) {
      await $fetch(`/api/death-anniversaries/${editingItem.value.id}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/death-anniversaries', { method: 'POST', body })
    }

    showModal.value = false
    await loadData()
  } catch (e: any) {
    formError.value = e.data?.message || 'Lưu thất bại'
  } finally {
    saving.value = false
  }
}

// === Delete ===
const showDeleteConfirm = ref(false)
const deletingItem = ref<any>(null)

function confirmDelete(item: any) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingItem.value) return
  saving.value = true
  try {
    await $fetch(`/api/death-anniversaries/${deletingItem.value.id}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    await loadData()
  } catch (e: any) {
    alert(e.data?.message || 'Xoá thất bại')
  } finally {
    saving.value = false
  }
}
</script>
