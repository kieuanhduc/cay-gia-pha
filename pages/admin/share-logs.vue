<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      <Icon name="ph:eye-bold" class="text-primary-600 mr-2" />
      Lịch sử xem chia sẻ
    </h1>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Dòng họ</label>
          <select v-model="filterFamilyLine" class="input-field" @change="loadData(1)">
            <option value="">Tất cả</option>
            <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">{{ fl.name }}</option>
          </select>
        </div>
        <div class="text-sm text-gray-500">
          Tổng: <span class="font-semibold text-gray-900">{{ total }}</span> lượt xem
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="!logs.length" class="card text-center py-12">
      <Icon name="ph:eye-slash" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Chưa có ai xem qua link chia sẻ</p>
    </div>

    <div v-else>
      <div class="card overflow-x-auto !p-0">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-left">
              <th class="px-4 py-3 font-medium text-gray-600">Thời gian</th>
              <th class="px-4 py-3 font-medium text-gray-600">Dòng họ</th>
              <th class="px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Địa chỉ IP</th>
              <th class="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Thiết bị</th>
              <th class="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Nguồn</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in logs"
              :key="log.id"
              class="border-b border-gray-50 hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-gray-700 whitespace-nowrap">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td class="px-4 py-3">
                <span class="font-medium text-gray-900">{{ log.familyLine?.name || '—' }}</span>
              </td>
              <td class="px-4 py-3 text-gray-600 font-mono text-xs hidden sm:table-cell">
                {{ log.ip || '—' }}
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs max-w-[250px] hidden md:table-cell">
                <span :title="log.userAgent">{{ parseDevice(log.userAgent) }}</span>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate hidden lg:table-cell">
                {{ log.referer || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-4">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="loadData(p)"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="p === page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: familyLinesData } = await useFetch<any[]>('/api/family-lines')
const familyLines = computed(() => familyLinesData.value || [])

const filterFamilyLine = ref('')
const logs = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const limit = 50

const totalPages = computed(() => Math.ceil(total.value / limit))

async function loadData(p = 1) {
  loading.value = true
  page.value = p
  try {
    const params: any = { page: p, limit }
    if (filterFamilyLine.value) params.familyLineId = filterFamilyLine.value
    const query = new URLSearchParams(params).toString()
    const data = await $fetch<any>(`/api/share-logs?${query}`)
    logs.value = data.logs
    total.value = data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())

function formatDateTime(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parseDevice(ua: string | null): string {
  if (!ua) return '—'
  // Simple UA parsing
  if (ua.includes('iPhone')) return 'iPhone'
  if (ua.includes('iPad')) return 'iPad'
  if (ua.includes('Android')) {
    const match = ua.match(/Android\s[\d.]+;\s([^)]+)\)/)
    return match ? `Android - ${match[1].split(' Build')[0].trim()}` : 'Android'
  }
  if (ua.includes('Macintosh')) return 'Mac'
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Linux')) return 'Linux'
  return ua.slice(0, 50)
}
</script>
