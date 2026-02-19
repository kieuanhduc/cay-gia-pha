<template>
  <div class="relative" ref="containerRef">
    <!-- Input field -->
    <div
      class="input-field flex items-center cursor-pointer"
      @click="toggle"
    >
      <Icon name="ph:calendar-blank-bold" class="text-gray-400 mr-2 shrink-0" />
      <span v-if="modelValue" class="flex-1">{{ displayValue }}</span>
      <span v-else class="flex-1 text-gray-400">{{ placeholder }}</span>
      <button
        v-if="modelValue"
        type="button"
        class="ml-2 text-gray-400 hover:text-gray-600 shrink-0"
        @click.stop="clear"
      >
        <Icon name="ph:x-bold" class="text-sm" />
      </button>
    </div>

    <!-- Calendar dropdown -->
    <ClientOnly>
    <Teleport to="body">
      <div
        v-if="open"
        ref="dropdownRef"
        class="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 w-[300px]"
        :style="dropdownStyle"
      >
        <!-- Month/Year navigation -->
        <div class="flex items-center justify-between mb-3">
          <button
            type="button"
            class="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
            @click="prevMonth"
          >
            <Icon name="ph:caret-left-bold" />
          </button>
          <div class="flex items-center gap-2">
            <select
              :value="viewMonth"
              class="text-sm font-medium bg-transparent border-none cursor-pointer focus:ring-0 pr-6"
              @change="viewMonth = +($event.target as HTMLSelectElement).value"
            >
              <option v-for="(name, i) in monthNames" :key="i" :value="i">{{ name }}</option>
            </select>
            <select
              :value="viewYear"
              class="text-sm font-medium bg-transparent border-none cursor-pointer focus:ring-0 pr-8"
              @change="viewYear = +($event.target as HTMLSelectElement).value"
            >
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <button
            type="button"
            class="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
            @click="nextMonth"
          >
            <Icon name="ph:caret-right-bold" />
          </button>
        </div>

        <!-- Day headers -->
        <div class="grid grid-cols-7 mb-1">
          <div
            v-for="d in dayHeaders"
            :key="d"
            class="text-center text-xs font-medium text-gray-400 py-1"
          >
            {{ d }}
          </div>
        </div>

        <!-- Days grid -->
        <div class="grid grid-cols-7">
          <button
            v-for="(day, i) in calendarDays"
            :key="i"
            type="button"
            class="h-9 w-full rounded-lg text-sm transition-colors"
            :class="dayClass(day)"
            :disabled="!day.currentMonth"
            @click="selectDay(day)"
          >
            {{ day.date }}
          </button>
        </div>

        <!-- Today button -->
        <div class="mt-2 pt-2 border-t border-gray-100 flex justify-center">
          <button
            type="button"
            class="text-xs text-primary-600 hover:text-primary-700 font-medium px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors"
            @click="goToday"
          >
            Hôm nay
          </button>
        </div>
      </div>
    </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: 'Chọn ngày',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const open = ref(false)
const dropdownStyle = ref<Record<string, string>>({})

const monthNames = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Current view
const now = new Date()
const viewMonth = ref(now.getMonth())
const viewYear = ref(now.getFullYear())

const yearOptions = computed(() => {
  const years: number[] = []
  for (let y = 1800; y <= 2100; y++) years.push(y)
  return years
})

// Parse selected value
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  const [y, m, d] = props.modelValue.split('-').map(Number)
  return { year: y, month: m - 1, date: d }
})

// Display formatted date
const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const [y, m, d] = props.modelValue.split('-')
  return `${d}/${m}/${y}`
})

// When modelValue changes, sync view
watch(() => props.modelValue, (val) => {
  if (val) {
    const [y, m] = val.split('-').map(Number)
    viewMonth.value = m - 1
    viewYear.value = y
  }
}, { immediate: true })

interface CalendarDay {
  date: number
  month: number
  year: number
  currentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

const calendarDays = computed<CalendarDay[]>(() => {
  const y = viewYear.value
  const m = viewMonth.value
  const firstDay = new Date(y, m, 1).getDay() // 0=Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const daysInPrev = new Date(y, m, 0).getDate()

  const today = new Date()
  const todayY = today.getFullYear()
  const todayM = today.getMonth()
  const todayD = today.getDate()

  const days: CalendarDay[] = []

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    days.push({
      date: d,
      month: m - 1,
      year: m === 0 ? y - 1 : y,
      currentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: d,
      month: m,
      year: y,
      currentMonth: true,
      isToday: d === todayD && m === todayM && y === todayY,
      isSelected: !!(selectedDate.value && d === selectedDate.value.date && m === selectedDate.value.month && y === selectedDate.value.year),
    })
  }

  // Next month padding
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: d,
      month: m + 1,
      year: m === 11 ? y + 1 : y,
      currentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }

  return days
})

function dayClass(day: CalendarDay) {
  if (!day.currentMonth) return 'text-gray-300 cursor-default'
  if (day.isSelected) return 'bg-primary-600 text-white font-medium hover:bg-primary-700'
  if (day.isToday) return 'bg-primary-50 text-primary-600 font-medium hover:bg-primary-100'
  return 'text-gray-700 hover:bg-gray-100'
}

function positionDropdown() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dropdownHeight = 370

  if (spaceBelow >= dropdownHeight) {
    dropdownStyle.value = {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
    }
  } else {
    dropdownStyle.value = {
      bottom: `${window.innerHeight - rect.top + 4}px`,
      left: `${rect.left}px`,
    }
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    nextTick(positionDropdown)
  }
}

function selectDay(day: CalendarDay) {
  if (!day.currentMonth) return
  const m = String(day.month + 1).padStart(2, '0')
  const d = String(day.date).padStart(2, '0')
  emit('update:modelValue', `${day.year}-${m}-${d}`)
  open.value = false
}

function clear() {
  emit('update:modelValue', '')
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function goToday() {
  const today = new Date()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  emit('update:modelValue', `${today.getFullYear()}-${m}-${d}`)
  open.value = false
}

// Close on outside click
function onClickOutside(e: MouseEvent) {
  if (
    containerRef.value && !containerRef.value.contains(e.target as Node) &&
    dropdownRef.value && !dropdownRef.value.contains(e.target as Node)
  ) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>
