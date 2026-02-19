<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tìm kiếm nâng cao</h1>
        <p class="text-sm text-gray-500 mt-1">Tìm kiếm thành viên theo nhiều tiêu chí</p>
      </div>
    </div>

    <!-- Filters -->
    <SearchFilters v-model="filters" @search="doSearch" class="mb-6" />

    <!-- Results -->
    <SearchResults
      :members="members"
      :total="total"
      :loading="loading"
      @select-member="goToMember"
    />

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center mt-6 gap-2">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="ph:caret-left-bold" class="text-gray-600" />
      </button>
      <template v-for="p in displayedPages" :key="p">
        <span v-if="p === '...'" class="px-2 text-gray-400">...</span>
        <button
          v-else
          @click="goToPage(p as number)"
          class="w-9 h-9 rounded-lg text-sm font-medium"
          :class="p === currentPage ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'"
        >
          {{ p }}
        </button>
      </template>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="ph:caret-right-bold" class="text-gray-600" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const router = useRouter()

const filters = ref({
  q: '',
  gender: '',
  generation: '',
  birthYearFrom: '',
  birthYearTo: '',
  birthPlace: '',
  isAlive: '',
  familyLineId: '',
  hasAnniversary: '',
})

const currentPage = ref(1)
const limit = 20

function buildQuery() {
  const params: Record<string, any> = { page: currentPage.value, limit }
  const f = filters.value
  if (f.q) params.q = f.q
  if (f.gender) params.gender = f.gender
  if (f.generation) params.generation = f.generation
  if (f.birthYearFrom) params.birthYearFrom = f.birthYearFrom
  if (f.birthYearTo) params.birthYearTo = f.birthYearTo
  if (f.birthPlace) params.birthPlace = f.birthPlace
  if (f.isAlive) params.isAlive = f.isAlive
  if (f.familyLineId) params.familyLineId = f.familyLineId
  if (f.hasAnniversary) params.hasAnniversary = f.hasAnniversary
  return params
}

const { data, pending: loading, refresh } = useLazyAsyncData(
  'admin-members-search',
  () => $fetch<any>('/api/members/search', { query: buildQuery() }),
  { watch: false }
)

const members = computed(() => data.value?.members || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / limit))

const displayedPages = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  const cp = currentPage.value

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')

    const start = Math.max(2, cp - 1)
    const end = Math.min(tp - 1, cp + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }

  return pages
})

function doSearch() {
  currentPage.value = 1
  refresh()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  refresh()
}

function goToMember(member: any) {
  router.push(`/admin/members/${member.id}`)
}
</script>
