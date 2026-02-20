<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      <Icon name="ph:calendar-bold" class="text-primary-600 mr-2" />
      Lịch ngày giỗ
    </h1>

    <!-- Filter bar -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[180px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Dòng họ</label>
          <select v-model="filterFamilyLine" class="input-field" @change="loadData">
            <option value="">Tất cả</option>
            <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">{{ fl.name }}</option>
          </select>
        </div>
        <div class="text-sm text-gray-500 mb-2">
          <Icon name="ph:moon-bold" class="text-amber-500 mr-1" />
          Ngày hiển thị theo dương lịch · Ngày giỗ theo âm lịch
        </div>
      </div>
    </div>

    <!-- Calendar nav -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="prevMonth"
          class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Icon name="ph:caret-left-bold" class="text-lg" />
        </button>

        <div class="text-center">
          <div class="text-lg font-bold text-gray-900">
            Tháng {{ currentMonth }}/{{ currentYear }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">{{ totalAnniversaries }} ngày giỗ</div>
        </div>

        <button
          @click="nextMonth"
          class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Icon name="ph:caret-right-bold" class="text-lg" />
        </button>
      </div>

      <!-- Today button -->
      <div class="flex justify-center mb-4">
        <button
          @click="goToToday"
          class="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Icon name="ph:calendar-check-bold" class="mr-1" />
          Hôm nay
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-8 text-center">
        <LoadingSpinner text="Đang tải..." />
      </div>

      <template v-else>
        <!-- Day-of-week header -->
        <div class="grid grid-cols-7 mb-1">
          <div
            v-for="d in ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']"
            :key="d"
            class="text-center text-xs font-semibold py-1"
            :class="d === 'CN' ? 'text-red-500' : 'text-gray-500'"
          >
            {{ d }}
          </div>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
          <!-- Empty leading cells -->
          <div
            v-for="i in leadingEmptyCells"
            :key="`empty-${i}`"
            class="bg-gray-50 min-h-[80px] md:min-h-[100px]"
          />

          <!-- Day cells -->
          <div
            v-for="day in daysInMonth"
            :key="day"
            class="bg-white p-1.5 min-h-[80px] md:min-h-[100px] transition-colors relative"
            :class="[
              getDayItems(day).length > 0 ? 'cursor-pointer hover:bg-amber-50' : '',
              isToday(day) ? 'ring-2 ring-primary-400 ring-inset' : '',
            ]"
            @click="selectDay(day)"
          >
            <!-- Day number + lunar date -->
            <div class="flex items-start justify-between mb-1">
              <div
                class="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full shrink-0"
                :class="isToday(day)
                  ? 'bg-primary-600 text-white'
                  : isSunday(day) ? 'text-red-500' : 'text-gray-700'"
              >
                {{ day }}
              </div>
              <div
                class="text-[10px] leading-tight text-right"
                :class="lunarGrid[day]?.includes('/') ? 'text-amber-600 font-semibold' : 'text-gray-400'"
              >
                {{ lunarGrid[day] }}
              </div>
            </div>

            <!-- Anniversary badges -->
            <div class="space-y-0.5">
              <div
                v-for="(item, idx) in getDayItems(day).slice(0, 2)"
                :key="idx"
                class="text-xs px-1 py-0.5 rounded truncate bg-amber-50 text-amber-800 border border-amber-100"
                :title="item.fullName + ' · ' + item.lunarDate + ' âm'"
              >
                <Icon name="ph:flower" class="text-amber-500 mr-0.5" style="font-size:9px" />
                {{ item.fullName }}
              </div>
              <div
                v-if="getDayItems(day).length > 2"
                class="text-xs text-amber-600 pl-1 font-medium"
              >
                +{{ getDayItems(day).length - 2 }} nữa
              </div>
            </div>
          </div>

          <!-- Empty trailing cells to complete grid -->
          <div
            v-for="i in trailingEmptyCells"
            :key="`trail-${i}`"
            class="bg-gray-50 min-h-[80px] md:min-h-[100px]"
          />
        </div>
      </template>
    </div>

    <!-- Empty month state -->
    <div v-if="!loading && totalAnniversaries === 0" class="card mt-4 text-center py-8">
      <Icon name="ph:calendar-blank" class="text-gray-300 text-5xl mb-2" />
      <p class="text-gray-400 text-sm">Không có ngày giỗ nào trong tháng này</p>
    </div>

    <!-- Modal popup khi click ngày giỗ -->
    <Transition name="modal">
      <div
        v-if="selectedDay !== null"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="selectedDay = null"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="selectedDay = null" />

        <!-- Modal box -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h3 class="font-bold text-gray-900 flex items-center gap-2">
                <Icon name="ph:flower" class="text-amber-500" />
                Ngày {{ selectedDay }} tháng {{ currentMonth }} dương lịch
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ getDayItems(selectedDay!).length }} ngày giỗ
              </p>
            </div>
            <button
              @click="selectedDay = null"
              class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <Icon name="ph:x-bold" />
            </button>
          </div>

          <!-- List -->
          <div class="overflow-y-auto p-4 space-y-3">
            <div
              v-for="item in getDayItems(selectedDay!)"
              :key="`${item.source}-${item.memberId ?? item.fullName}`"
              class="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-amber-50 hover:border-amber-200 transition-colors"
            >
              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-amber-200">
                <img
                  v-if="item.avatarUrl"
                  :src="item.avatarUrl"
                  :alt="item.fullName"
                  class="w-full h-full object-cover"
                />
                <Icon v-else name="ph:user-bold" class="text-amber-500 text-xl" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="font-semibold text-gray-900">{{ item.fullName }}</div>
                  <NuxtLink
                    v-if="item.memberId"
                    :to="`/admin/members/${item.memberId}`"
                    class="shrink-0 text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors flex items-center gap-1"
                    @click="selectedDay = null"
                  >
                    <Icon name="ph:arrow-square-out" style="font-size:11px" />
                    Xem
                  </NuxtLink>
                </div>

                <div class="text-xs text-gray-500 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  <span class="flex items-center gap-1">
                    <Icon name="ph:moon-bold" class="text-amber-500" style="font-size:11px" />
                    {{ item.lunarDate }} âm lịch
                  </span>
                  <span v-if="item.generation" class="flex items-center gap-1">
                    <Icon name="ph:tree-structure" style="font-size:11px" class="text-gray-400" />
                    Đời {{ item.generation }}
                  </span>
                  <span v-if="item.familyLineName" class="flex items-center gap-1">
                    <Icon name="ph:users" style="font-size:11px" class="text-gray-400" />
                    {{ item.familyLineName }}
                  </span>
                </div>

                <div v-if="item.note" class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1 mt-1.5 italic">
                  {{ item.note }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface CalendarItem {
  solarDay: number
  memberId: number | null
  fullName: string
  generation: number | null
  familyLineName: string
  lunarDate: string
  note?: string | null
  source: 'member' | 'anniversary'
  avatarUrl?: string | null
}

const nuxtApp = useNuxtApp()
const { data: familyLinesData } = useLazyFetch<any[]>('/api/family-lines', {
  getCachedData: (key) => nuxtApp.payload.data[key] as any,
})
const familyLines = computed(() => familyLinesData.value || [])

// Current view month/year
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)

const filterFamilyLine = ref('')
const loading = ref(false)
const items = ref<CalendarItem[]>([])
const lunarGrid = ref<Record<number, string>>({})
const selectedDay = ref<number | null>(null)

async function loadData() {
  loading.value = true
  selectedDay.value = null
  try {
    const params: any = { year: currentYear.value, month: currentMonth.value }
    if (filterFamilyLine.value) params.familyLineId = filterFamilyLine.value
    const res = await $fetch<{ items: CalendarItem[], lunarGrid: Record<number, string> }>('/api/anniversaries/calendar', { params })
    items.value = res.items
    lunarGrid.value = res.lunarGrid
  } catch {
    items.value = []
    lunarGrid.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())

// Calendar helpers
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  const d = new Date(currentYear.value, currentMonth.value - 1, 1).getDay()
  return d === 0 ? 6 : d - 1
})

const leadingEmptyCells = computed(() => firstDayOfWeek.value)

const trailingEmptyCells = computed(() => {
  const total = leadingEmptyCells.value + daysInMonth.value
  const remainder = total % 7
  return remainder === 0 ? 0 : 7 - remainder
})

const totalAnniversaries = computed(() => items.value.length)

function getDayItems(day: number): CalendarItem[] {
  return items.value.filter((i) => i.solarDay === day)
}

function isToday(day: number): boolean {
  return (
    day === now.getDate() &&
    currentMonth.value === now.getMonth() + 1 &&
    currentYear.value === now.getFullYear()
  )
}

function isSunday(day: number): boolean {
  const d = new Date(currentYear.value, currentMonth.value - 1, day).getDay()
  return d === 0
}

function selectDay(day: number) {
  if (getDayItems(day).length === 0) return
  selectedDay.value = day
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadData()
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadData()
}

function goToToday() {
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth() + 1
  loadData()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
