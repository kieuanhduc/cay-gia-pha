<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
      <button @click="openCreateForm" class="btn-primary inline-flex items-center gap-2 shrink-0">
        <Icon name="ph:plus-bold" />
        Thêm tài khoản
      </button>
    </div>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="!users?.length" class="card text-center py-12">
      <Icon name="ph:users" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Chưa có tài khoản nào</p>
      <button @click="openCreateForm" class="btn-primary mt-4">Tạo tài khoản đầu tiên</button>
    </div>

    <div v-else class="card overflow-x-auto !p-0">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50 text-left">
            <th class="px-4 py-3 font-medium text-gray-600">Tên đăng nhập</th>
            <th class="px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Họ tên</th>
            <th class="px-4 py-3 font-medium text-gray-600">Vai trò</th>
            <th class="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Gia phả được xem</th>
            <th class="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Ngày tạo</th>
            <th class="px-4 py-3 font-medium text-gray-600 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-900">{{ user.username }}</td>
            <td class="px-4 py-3 text-gray-700 hidden sm:table-cell">{{ user.fullName }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                :class="roleBadgeClass(user.role)"
              >
                {{ roleLabel(user.role) }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
              <span v-if="user.role === 'admin'" class="text-green-600 font-medium">Tất cả</span>
              <span v-else-if="userFamilyLineNames[user.id]?.length">
                {{ userFamilyLineNames[user.id].join(', ') }}
              </span>
              <span v-else class="text-gray-400">Chưa gán</span>
            </td>
            <td class="px-4 py-3 text-gray-500 hidden lg:table-cell">{{ formatDate(user.createdAt) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="openEditForm(user)"
                  class="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  title="Sửa"
                >
                  <Icon name="ph:pencil-simple" />
                </button>
                <button
                  @click="confirmDelete(user)"
                  class="p-2 rounded-lg hover:bg-red-50 text-red-500"
                  title="Xóa"
                >
                  <Icon name="ph:trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editingId ? 'Sửa tài khoản' : 'Thêm tài khoản'">
      <form @submit.prevent="saveUser" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
          <input
            v-model="form.username"
            class="input-field"
            placeholder="VD: nguyenvana"
            :disabled="!!editingId"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
          <input
            v-model="form.fullName"
            class="input-field"
            placeholder="VD: Nguyễn Văn A"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu {{ editingId ? '' : '*' }}
          </label>
          <input
            v-model="form.password"
            type="password"
            class="input-field"
            :placeholder="editingId ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'"
            :required="!editingId"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
          <select v-model="form.role" class="input-field" required>
            <option value="admin">Quản trị viên</option>
            <option value="editor">Biên tập viên</option>
            <option value="viewer">Người xem</option>
          </select>
        </div>

        <!-- Family line access (only for editor/viewer) -->
        <div v-if="form.role !== 'admin'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Gia phả được phép xem
          </label>
          <p class="text-xs text-gray-400 mb-2">Chọn các dòng họ mà tài khoản này được phép truy cập</p>
          <div v-if="!familyLines?.length" class="text-sm text-gray-400">Chưa có dòng họ nào</div>
          <div v-else class="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <label
              v-for="fl in familyLines"
              :key="fl.id"
              class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                :value="fl.id"
                v-model="selectedFamilyLineIds"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm text-gray-700">{{ fl.name }}</span>
              <span class="text-xs text-gray-400 ml-auto">{{ fl.memberCount }} thành viên</span>
            </label>
          </div>
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
      title="Xác nhận xóa tài khoản"
      :message="`Bạn có chắc chắn muốn xóa tài khoản '${deletingItem?.username}'? Hành động này không thể hoàn tác.`"
      confirmText="Xóa tài khoản"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface User {
  id: number
  username: string
  fullName: string
  role: string
  createdAt: string
  updatedAt: string
}

const { data: users, pending, refresh } = useLazyFetch<User[]>('/api/users')
const nuxtApp = useNuxtApp()
const { data: familyLines } = useLazyFetch<any[]>('/api/family-lines', {
  getCachedData: (key) => nuxtApp.payload.data[key] as any,
})

const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ username: '', fullName: '', password: '', role: 'viewer' })
const selectedFamilyLineIds = ref<number[]>([])
const formError = ref('')
const saving = ref(false)

const showDeleteConfirm = ref(false)
const deletingItem = ref<User | null>(null)

// Track family line names per user for the table display
const userFamilyLineNames = ref<Record<number, string[]>>({})

async function loadUserFamilyLines() {
  if (!users.value || !familyLines.value) return
  const result: Record<number, string[]> = {}
  for (const user of users.value) {
    if (user.role === 'admin') continue
    try {
      const ids = await $fetch<number[]>(`/api/users/${user.id}/family-lines`)
      result[user.id] = ids
        .map((id) => familyLines.value!.find((fl) => fl.id === id)?.name)
        .filter(Boolean) as string[]
    } catch {
      result[user.id] = []
    }
  }
  userFamilyLineNames.value = result
}

onMounted(() => loadUserFamilyLines())

function roleBadgeClass(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-700'
    case 'editor':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function roleLabel(role: string) {
  switch (role) {
    case 'admin':
      return 'Quản trị viên'
    case 'editor':
      return 'Biên tập viên'
    default:
      return 'Người xem'
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

function openCreateForm() {
  editingId.value = null
  form.value = { username: '', fullName: '', password: '', role: 'editor' }
  selectedFamilyLineIds.value = []
  formError.value = ''
  showForm.value = true
}

async function openEditForm(user: User) {
  editingId.value = user.id
  form.value = {
    username: user.username,
    fullName: user.fullName,
    password: '',
    role: user.role,
  }
  formError.value = ''

  // Load assigned family lines
  if (user.role !== 'admin') {
    try {
      selectedFamilyLineIds.value = await $fetch<number[]>(`/api/users/${user.id}/family-lines`)
    } catch {
      selectedFamilyLineIds.value = []
    }
  } else {
    selectedFamilyLineIds.value = []
  }

  showForm.value = true
}

function confirmDelete(user: User) {
  deletingItem.value = user
  showDeleteConfirm.value = true
}

async function saveUser() {
  formError.value = ''
  saving.value = true
  try {
    let userId = editingId.value

    if (editingId.value) {
      const body: Record<string, string> = {
        fullName: form.value.fullName,
        role: form.value.role,
      }
      if (form.value.password) {
        body.password = form.value.password
      }
      await $fetch(`/api/users/${editingId.value}`, { method: 'PUT', body })
    } else {
      const created = await $fetch<any>('/api/users', { method: 'POST', body: form.value })
      userId = created.id
    }

    // Save family line access (for non-admin)
    if (form.value.role !== 'admin' && userId) {
      await $fetch(`/api/users/${userId}/family-lines`, {
        method: 'PUT',
        body: { familyLineIds: selectedFamilyLineIds.value },
      })
    }

    showForm.value = false
    editingId.value = null
    form.value = { username: '', fullName: '', password: '', role: 'editor' }
    selectedFamilyLineIds.value = []
    await refresh()
    await loadUserFamilyLines()
  } catch (e: any) {
    formError.value = e.data?.message || 'Có lỗi xảy ra'
  } finally {
    saving.value = false
  }
}

async function deleteUser() {
  if (!deletingItem.value) return
  try {
    await $fetch(`/api/users/${deletingItem.value.id}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    deletingItem.value = null
    await refresh()
    await loadUserFamilyLines()
  } catch (e: any) {
    alert(e.data?.message || 'Xóa thất bại')
  }
}

watch(showForm, (val) => {
  if (!val) {
    editingId.value = null
    form.value = { username: '', fullName: '', password: '', role: 'editor' }
    selectedFamilyLineIds.value = []
    formError.value = ''
  }
})
</script>
