<template>
  <div class="card">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Icon name="ph:candle-bold" class="text-primary-600" />
        Ngày giỗ sắp tới
      </h2>
      <span
        v-if="anniversaries.length"
        class="text-xs text-gray-400"
      >
        Trong 60 ngày
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-6">
      <LoadingSpinner text="Đang tải..." />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!anniversaries.length"
      class="text-center py-8 text-gray-400 text-sm"
    >
      <Icon name="ph:candle" class="text-3xl mb-2 block mx-auto opacity-40" />
      Không có ngày giỗ trong 60 ngày tới
    </div>

    <!-- Anniversary list -->
    <div v-else class="space-y-2">
      <div
        v-for="item in anniversaries"
        :key="`${item.source}-${item.memberId || item.fullName}`"
        class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <!-- Icon -->
        <div class="shrink-0">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center"
            :class="urgencyBg(item.daysUntil)"
          >
            <Icon name="ph:candle-bold" class="text-sm" :class="urgencyIcon(item.daysUntil)" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-medium text-sm text-gray-900 truncate">{{ item.fullName }}</span>
            <span v-if="item.generation" class="text-xs text-gray-400">Đời {{ item.generation }}</span>
          </div>
          <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
            <span>{{ item.lunarDate }} âm lịch</span>
            <span class="text-gray-300">&middot;</span>
            <span>DL: {{ formatSolarDate(item.solarDate) }}</span>
          </div>
          <div v-if="item.familyLineName || item.note" class="text-xs text-gray-400 mt-0.5">
            <span v-if="item.familyLineName">{{ item.familyLineName }}</span>
            <span v-if="item.familyLineName && item.note"> · </span>
            <span v-if="item.note" class="italic">{{ item.note }}</span>
          </div>
        </div>

        <!-- Days badge -->
        <div class="shrink-0">
          <span
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
            :class="urgencyBadge(item.daysUntil)"
          >
            <template v-if="item.daysUntil === 0">Hôm nay</template>
            <template v-else>Còn {{ item.daysUntil }} ngày</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AnniversaryItem {
  memberId: number | null
  fullName: string
  generation: number | null
  familyLineName: string
  lunarDate: string
  solarDate: string
  daysUntil: number
  note?: string | null
  source: 'member' | 'anniversary'
}

const loading = ref(true)
const anniversaries = ref<AnniversaryItem[]>([])

async function fetchAnniversaries() {
  loading.value = true
  try {
    anniversaries.value = await $fetch<AnniversaryItem[]>(
      '/api/anniversaries/upcoming',
      { params: { days: 60 } },
    )
  } catch {
    anniversaries.value = []
  } finally {
    loading.value = false
  }
}

function formatSolarDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function urgencyBadge(daysUntil: number): string {
  if (daysUntil === 0) return 'bg-red-100 text-red-700'
  if (daysUntil <= 7) return 'bg-red-100 text-red-700'
  if (daysUntil <= 30) return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

function urgencyBg(daysUntil: number): string {
  if (daysUntil <= 7) return 'bg-red-100'
  if (daysUntil <= 30) return 'bg-amber-100'
  return 'bg-gray-100'
}

function urgencyIcon(daysUntil: number): string {
  if (daysUntil <= 7) return 'text-red-600'
  if (daysUntil <= 30) return 'text-amber-600'
  return 'text-gray-500'
}

onMounted(() => {
  fetchAnniversaries()
})
</script>
