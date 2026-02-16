<template>
  <div class="card">
    <!-- Main search bar -->
    <div class="flex flex-wrap gap-3 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-1">Tìm theo tên</label>
        <div class="relative">
          <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            :value="modelValue.q"
            @input="updateFilter('q', ($event.target as HTMLInputElement).value)"
            class="input-field pl-9"
            placeholder="Nhập họ tên thành viên..."
          />
        </div>
      </div>
      <div class="w-auto">
        <label class="block text-sm font-medium text-gray-700 mb-1">Dòng họ</label>
        <select
          :value="modelValue.familyLineId"
          @change="updateFilter('familyLineId', ($event.target as HTMLSelectElement).value)"
          class="input-field w-auto min-w-[180px]"
        >
          <option value="">Tất cả dòng họ</option>
          <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">{{ fl.name }}</option>
        </select>
      </div>
      <div class="flex gap-2">
        <button @click="emitSearch" class="btn-primary inline-flex items-center gap-2">
          <Icon name="ph:magnifying-glass-bold" />
          Tìm kiếm
        </button>
        <button @click="resetFilters" class="btn-secondary inline-flex items-center gap-2">
          <Icon name="ph:x-bold" />
          Xóa bộ lọc
        </button>
      </div>
    </div>

    <!-- Toggle advanced filters -->
    <button
      @click="showAdvanced = !showAdvanced"
      class="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
    >
      <Icon :name="showAdvanced ? 'ph:caret-up-bold' : 'ph:caret-down-bold'" />
      {{ showAdvanced ? 'Ẩn bộ lọc nâng cao' : 'Bộ lọc nâng cao' }}
    </button>

    <!-- Advanced filters -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-from-class="opacity-100 max-h-96"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="showAdvanced" class="mt-4 pt-4 border-t border-gray-100 overflow-hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Gender -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
            <select
              :value="modelValue.gender"
              @change="updateFilter('gender', ($event.target as HTMLSelectElement).value)"
              class="input-field"
            >
              <option value="">Tất cả</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <!-- Generation -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Đời</label>
            <input
              type="number"
              :value="modelValue.generation"
              @input="updateFilter('generation', ($event.target as HTMLInputElement).value)"
              class="input-field"
              placeholder="Nhập số đời"
              min="1"
            />
          </div>

          <!-- Birth year from -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Năm sinh từ</label>
            <input
              type="number"
              :value="modelValue.birthYearFrom"
              @input="updateFilter('birthYearFrom', ($event.target as HTMLInputElement).value)"
              class="input-field"
              placeholder="VD: 1950"
              min="1800"
              max="2100"
            />
          </div>

          <!-- Birth year to -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Năm sinh đến</label>
            <input
              type="number"
              :value="modelValue.birthYearTo"
              @input="updateFilter('birthYearTo', ($event.target as HTMLInputElement).value)"
              class="input-field"
              placeholder="VD: 2000"
              min="1800"
              max="2100"
            />
          </div>

          <!-- Birth place -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nơi sinh</label>
            <input
              :value="modelValue.birthPlace"
              @input="updateFilter('birthPlace', ($event.target as HTMLInputElement).value)"
              class="input-field"
              placeholder="Nhập nơi sinh..."
            />
          </div>

          <!-- Is alive -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
            <select
              :value="modelValue.isAlive"
              @change="updateFilter('isAlive', ($event.target as HTMLSelectElement).value)"
              class="input-field"
            >
              <option value="">Tất cả</option>
              <option value="true">Còn sống</option>
              <option value="false">Đã mất</option>
            </select>
          </div>

          <!-- Has anniversary -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày giỗ</label>
            <select
              :value="modelValue.hasAnniversary"
              @change="updateFilter('hasAnniversary', ($event.target as HTMLSelectElement).value)"
              class="input-field"
            >
              <option value="">Tất cả</option>
              <option value="true">Có ngày giỗ</option>
            </select>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Filters {
  q: string
  gender: string
  generation: string
  birthYearFrom: string
  birthYearTo: string
  birthPlace: string
  isAlive: string
  familyLineId: string
  hasAnniversary: string
}

const props = defineProps<{
  modelValue: Filters
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Filters]
  search: []
}>()

const showAdvanced = ref(false)

const { data: familyLinesData } = await useFetch('/api/family-lines')
const familyLines = computed(() => familyLinesData.value || [])

function updateFilter(key: keyof Filters, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function emitSearch() {
  emit('search')
}

function resetFilters() {
  emit('update:modelValue', {
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
  emit('search')
}
</script>
