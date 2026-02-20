<template>
  <div class="flex flex-col" style="height:100dvh;height:100vh">
    <!-- Header bar -->
    <div class="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <NuxtLink to="/" class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
            <Icon name="ph:arrow-left-bold" />
          </NuxtLink>
          <div class="min-w-0">
            <h1 class="text-sm sm:text-lg font-bold text-gray-900 truncate">{{ treeData?.familyLine?.name || 'Cây Gia Phả' }}</h1>
            <p class="text-xs text-gray-500">{{ treeData?.totalMembers || 0 }} thành viên</p>
          </div>
        </div>

        <div class="flex items-center gap-1 sm:gap-3 shrink-0">
          <!-- Search toggle (mobile) -->
          <button @click="showMobileSearch = !showMobileSearch" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 sm:hidden">
            <Icon name="ph:magnifying-glass" />
          </button>

          <!-- Search (desktop) -->
          <div class="relative hidden sm:block">
            <input
              v-model="searchQuery"
              class="input-field pl-8 py-1.5 text-sm w-48"
              placeholder="Tìm thành viên..."
              @input="onSearch"
              @keydown.enter="selectSearchResult"
            />
            <Icon name="ph:magnifying-glass" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

            <!-- Search results dropdown -->
            <div
              v-if="searchResults.length > 0 && searchQuery.length > 0"
              class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              <button
                v-for="(result, i) in searchResults"
                :key="result.id"
                class="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors flex items-center gap-2"
                :class="i === selectedSearchIndex ? 'bg-primary-50' : ''"
                @click="goToMember(result.id)"
              >
                <span :class="result.gender === 'male' ? 'text-blue-500' : 'text-pink-500'" class="text-xs">
                  {{ result.gender === 'male' ? '♂' : '♀' }}
                </span>
                <span>{{ result.fullName }}</span>
                <span class="text-gray-400 text-xs ml-auto">Đời {{ result.generation }}</span>
              </button>
            </div>
          </div>

          <TreeControls
            :direction="direction"
            :exporting="exporting"
            :can-share="canEdit"
            :is-shared="!!treeData?.familyLine?.isPublic"
            @update:direction="direction = $event"
            @zoom-in="handleZoomIn"
            @zoom-out="handleZoomOut"
            @fit="handleFit"
            @open-export="showExportDialog = true"
            @find-relationship="showFindRelationship = true"
            @share="showShareDialog = true"
          />
        </div>
      </div>

      <!-- Mobile search bar -->
      <div v-if="showMobileSearch" class="mt-2 sm:hidden relative">
        <input
          v-model="searchQuery"
          class="input-field pl-8 py-2 text-sm w-full"
          placeholder="Tìm thành viên..."
          @input="onSearch"
          @keydown.enter="selectSearchResult"
          ref="mobileSearchInput"
        />
        <Icon name="ph:magnifying-glass" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

        <div
          v-if="searchResults.length > 0 && searchQuery.length > 0"
          class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <button
            v-for="(result, i) in searchResults"
            :key="result.id"
            class="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors flex items-center gap-2"
            :class="i === selectedSearchIndex ? 'bg-primary-50' : ''"
            @click="goToMember(result.id); showMobileSearch = false"
          >
            <span :class="result.gender === 'male' ? 'text-blue-500' : 'text-pink-500'" class="text-xs">
              {{ result.gender === 'male' ? '♂' : '♀' }}
            </span>
            <span>{{ result.fullName }}</span>
            <span class="text-gray-400 text-xs ml-auto">Đời {{ result.generation }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tree area -->
    <div class="flex-1 min-h-0 relative bg-gradient-to-br from-amber-50 to-orange-50">
      <LoadingSpinner v-if="pending" />

      <div v-else-if="!treeData?.tree?.length" class="flex items-center justify-center h-full">
        <div class="text-center">
          <Icon name="ph:tree-structure" class="text-gray-300 text-6xl mb-3" />
          <p class="text-gray-500">Chưa có dữ liệu gia phả</p>
          <NuxtLink v-if="isLoggedIn" to="/admin/members/create" class="btn-primary mt-4 inline-block">
            Thêm thành viên đầu tiên
          </NuxtLink>
        </div>
      </div>

      <ClientOnly v-else>
        <FamilyTree
          :ref="(el: any) => { treeRef = el }"
          :data="treeData.tree"
          :direction="direction"
          :highlight-id="highlightMemberId"
          @select-member="selectedMemberId = $event"
        />
        <template #fallback>
          <LoadingSpinner text="Đang vẽ cây gia phả..." />
        </template>
      </ClientOnly>
    </div>

    <!-- Member detail side panel -->
    <MemberCard
      v-if="selectedMemberId"
      :member-id="selectedMemberId"
      @close="selectedMemberId = null"
      @navigate="selectedMemberId = $event"
    />

    <!-- Overlay when side panel is open -->
    <div
      v-if="selectedMemberId"
      class="fixed inset-0 z-40"
      @click="selectedMemberId = null"
    />

    <!-- Export loading overlay -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="exporting" class="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
        <div class="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-2xl mx-4">
          <div class="relative">
            <Icon name="ph:spinner" class="text-5xl text-primary-500 animate-spin" />
          </div>
          <div class="text-center">
            <p class="text-gray-800 font-semibold text-base">Đang xuất gia phả...</p>
            <p class="text-gray-400 text-sm mt-1">Vui lòng không tắt trang này</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Export dialog -->
    <ExportDialog
      v-model="showExportDialog"
      @export-png="handleExportPng"
      @export-pdf="handleExportPdf"
    />

    <!-- Find relationship dialog -->
    <FindRelationship
      v-model="showFindRelationship"
      :family-line-id="Number(route.params.familyLineId)"
      :members="allMembers"
    />

    <!-- Share dialog -->
    <ShareDialog
      v-if="shareDialogData"
      v-model="showShareDialog"
      :family-line="shareDialogData"
      @updated="refreshTree"
    />

    <!-- Quick share link bar (shown when shared) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showQuickShare && treeData?.familyLine?.isPublic && treeData?.familyLine?.shareToken"
        class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3 max-w-lg w-[calc(100%-2rem)]"
      >
        <Icon name="ph:link-bold" class="text-green-600 shrink-0" />
        <input
          :value="shareUrl"
          readonly
          class="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 min-w-0"
          @focus="($event.target as HTMLInputElement)?.select()"
        />
        <button
          @click="copyShareLink"
          class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="copied ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'"
        >
          <Icon :name="copied ? 'ph:check-bold' : 'ph:copy'" />
          {{ copied ? 'Đã chép' : 'Sao chép' }}
        </button>
        <button @click="showQuickShare = false" class="shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400">
          <Icon name="ph:x-bold" class="text-sm" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const route = useRoute()
const { isLoggedIn, canEdit } = useAuth()

const direction = ref<'vertical' | 'horizontal'>('vertical')
const selectedMemberId = ref<number | null>(null)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedSearchIndex = ref(0)
const highlightMemberId = ref<number | null>(null)
const treeRef = ref<any>(null)
const showExportDialog = ref(false)
const showFindRelationship = ref(false)
const showShareDialog = ref(false)
const showQuickShare = ref(false)
const copied = ref(false)
const showMobileSearch = ref(false)
const mobileSearchInput = ref<HTMLInputElement | null>(null)

watch(showMobileSearch, (val) => {
  if (val) nextTick(() => mobileSearchInput.value?.focus())
})

function getTree() {
  return treeRef.value
}

function handleZoomIn() { getTree()?.zoomIn() }
function handleZoomOut() { getTree()?.zoomOut() }
function handleFit() { getTree()?.fit() }

const { exportTree, exportTreeAsPdf, exporting } = useTreeExport()

async function handleExportPng() {
  const tree = getTree()
  const svgElement = tree?.svgEl
  if (!svgElement || !treeData.value?.tree) return
  const familyName = treeData.value?.familyLine?.name || 'Gia Phả'
  await exportTree(svgElement, familyName, treeData.value.tree)
}

async function handleExportPdf(options: import('~/composables/useTreeExport').PdfExportOptions) {
  const tree = getTree()
  const svgElement = tree?.svgEl
  if (!svgElement) return
  await exportTreeAsPdf(svgElement, options)
}

const { data: treeData, pending, refresh: refreshTree } = useLazyFetch<any>(`/api/family-lines/${route.params.familyLineId}/tree`)

// Share
const shareDialogData = computed(() => {
  if (!treeData.value?.familyLine) return null
  const fl = treeData.value.familyLine
  return { id: fl.id, name: fl.name, isPublic: fl.isPublic, shareToken: fl.shareToken }
})

const shareUrl = computed(() => {
  const token = treeData.value?.familyLine?.shareToken
  if (!token || import.meta.server) return ''
  return `${window.location.origin}/share/${token}`
})

// Show quick share bar when share dialog closes after enabling sharing
watch(showShareDialog, (val) => {
  if (!val && treeData.value?.familyLine?.isPublic && treeData.value?.familyLine?.shareToken) {
    showQuickShare.value = true
  }
})

async function copyShareLink() {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
  }
}

// Flatten tree for search
function flattenTree(nodes: any[]): any[] {
  const result: any[] = []
  function walk(node: any) {
    result.push({ id: node.id, fullName: node.fullName, gender: node.gender, generation: node.generation })
    if (node.children) node.children.forEach(walk)
  }
  nodes.forEach(walk)
  return result
}

const allMembers = computed(() => {
  if (!treeData.value?.tree) return []
  return flattenTree(treeData.value.tree)
})

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
function onSearch() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    selectedSearchIndex.value = 0
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) {
      searchResults.value = []
      highlightMemberId.value = null
      return
    }
    searchResults.value = allMembers.value.filter((m: any) =>
      m.fullName.toLowerCase().includes(q)
    ).slice(0, 10)
  }, 200)
}

function selectSearchResult() {
  if (searchResults.value.length > 0) {
    goToMember(searchResults.value[selectedSearchIndex.value]?.id)
  }
}

function goToMember(id: number) {
  searchQuery.value = ''
  searchResults.value = []
  highlightMemberId.value = id
  treeRef.value?.panToMember(id)

  // Clear highlight after 3 seconds
  setTimeout(() => { highlightMemberId.value = null }, 3000)
}

useHead({
  title: computed(() => treeData.value?.familyLine?.name ? `${treeData.value.familyLine.name} - Cây Gia Phả` : 'Cây Gia Phả'),
})
</script>
