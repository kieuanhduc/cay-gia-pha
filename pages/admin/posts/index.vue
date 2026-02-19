<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-900">Tin tức &amp; Sự kiện</h1>
        <button
          v-if="selectedIds.length > 0"
          @click="showBulkDeleteConfirm = true"
          class="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Icon name="ph:trash-bold" />
          Xóa {{ selectedIds.length }} mục
        </button>
      </div>
      <NuxtLink to="/admin/posts/create" class="btn-primary inline-flex items-center gap-2">
        <Icon name="ph:plus-bold" />
        Thêm bài viết
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3">
        <select v-model="filterType" class="input-field w-auto">
          <option value="">Tất cả loại</option>
          <option value="news">Tin tức</option>
          <option value="event">Sự kiện</option>
        </select>
        <select v-model="filterPublished" class="input-field w-auto">
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đã đăng</option>
          <option value="false">Nháp</option>
        </select>
      </div>
    </div>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="!posts.length" class="card text-center py-12">
      <Icon name="ph:newspaper" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Chưa có bài viết nào</p>
      <NuxtLink to="/admin/posts/create" class="btn-primary mt-4 inline-block">Tạo bài viết đầu tiên</NuxtLink>
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="py-3 px-2 w-10">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                title="Chọn tất cả"
              />
            </th>
            <th class="text-left py-3 px-2 font-medium text-gray-500">Tiêu đề</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden sm:table-cell">Loại</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Tác giả</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Ngày tạo</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500">Trạng thái</th>
            <th class="text-right py-3 px-2 font-medium text-gray-500">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id" class="border-b border-gray-50 hover:bg-gray-50" :class="selectedIds.includes(post.id) ? 'bg-primary-50' : ''">
            <td class="py-3 px-2">
              <input
                type="checkbox"
                :checked="selectedIds.includes(post.id)"
                @change="toggleSelect(post.id)"
                class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
            </td>
            <td class="py-3 px-2">
              <div class="font-medium text-gray-900 line-clamp-1">{{ post.title }}</div>
              <div v-if="post.excerpt" class="text-xs text-gray-400 line-clamp-1 mt-0.5">{{ post.excerpt }}</div>
            </td>
            <td class="py-3 px-2 hidden sm:table-cell">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                :class="post.type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
              >
                <Icon :name="post.type === 'news' ? 'ph:newspaper-bold' : 'ph:calendar-bold'" class="text-[10px]" />
                {{ post.type === 'news' ? 'Tin tức' : 'Sự kiện' }}
              </span>
            </td>
            <td class="py-3 px-2 text-gray-500 hidden md:table-cell">{{ post.authorName }}</td>
            <td class="py-3 px-2 text-gray-500 hidden md:table-cell">{{ formatDate(post.createdAt) }}</td>
            <td class="py-3 px-2">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                :class="post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
              >
                <Icon :name="post.published ? 'ph:check-circle-bold' : 'ph:pencil-bold'" class="text-[10px]" />
                {{ post.published ? 'Đã đăng' : 'Nháp' }}
              </span>
            </td>
            <td class="py-3 px-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <NuxtLink :to="`/admin/posts/${post.id}`" class="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Sửa">
                  <Icon name="ph:pencil-simple" />
                </NuxtLink>
                <button @click="confirmDelete(post)" class="p-1.5 rounded hover:bg-red-50 text-red-500" title="Xoá">
                  <Icon name="ph:trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="total > limit" class="flex justify-center mt-4 gap-2">
        <button
          v-for="p in Math.ceil(total / limit)"
          :key="p"
          @click="page = p"
          class="w-8 h-8 rounded text-sm"
          :class="p === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'"
        >{{ p }}</button>
      </div>
    </div>

    <ConfirmDialog
      v-model="showDeleteConfirm"
      :message="`Xoá bài viết '${deletingItem?.title}'?`"
      :loading="deleting"
      @confirm="doDelete"
    />
    <ConfirmDialog
      v-model="showBulkDeleteConfirm"
      :message="`Xoá ${selectedIds.length} bài viết đã chọn?`"
      :loading="bulkDeleting"
      @confirm="doBulkDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const filterType = ref('')
const filterPublished = ref('')
const page = ref(1)
const limit = 20

const queryParams = computed(() => {
  const p: any = { page: page.value, limit }
  if (filterType.value) p.type = filterType.value
  if (filterPublished.value !== '') p.published = filterPublished.value
  return p
})

const { data, pending, refresh } = useLazyFetch<any>('/api/posts', { query: queryParams })
const posts = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)

watch([filterType, filterPublished], () => { page.value = 1; selectedIds.value = [] })

// Checkbox selection
const selectedIds = ref<number[]>([])
const isAllSelected = computed(() => posts.value.length > 0 && selectedIds.value.length === posts.value.length)

function toggleSelectAll() {
  selectedIds.value = isAllSelected.value ? [] : posts.value.map((p: any) => p.id)
}

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

// Bulk delete
const showBulkDeleteConfirm = ref(false)
const bulkDeleting = ref(false)

async function doBulkDelete() {
  bulkDeleting.value = true
  try {
    await $fetch('/api/posts/bulk-delete', {
      method: 'DELETE',
      body: { ids: selectedIds.value },
    })
    showBulkDeleteConfirm.value = false
    selectedIds.value = []
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Xoá thất bại')
  } finally {
    bulkDeleting.value = false
  }
}

// Single delete
const showDeleteConfirm = ref(false)
const deletingItem = ref<any>(null)
const deleting = ref(false)

function confirmDelete(post: any) {
  deletingItem.value = post
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  try {
    await $fetch(`/api/posts/${deletingItem.value.id}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    deletingItem.value = null
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Xoá thất bại')
  } finally {
    deleting.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN')
}
</script>
