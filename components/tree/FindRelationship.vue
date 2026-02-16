<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Tìm quan hệ" size="lg">
    <div class="space-y-5">
      <!-- Member A select -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Chọn thành viên A</label>
        <div class="relative">
          <input
            v-model="searchA"
            class="input-field w-full pl-8"
            placeholder="Tìm và chọn thành viên..."
            @focus="showDropdownA = true"
            @input="showDropdownA = true"
          />
          <Icon name="ph:user" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <div v-if="selectedA" class="absolute right-2 top-1/2 -translate-y-1/2">
            <button @click="clearA" class="p-0.5 rounded hover:bg-gray-100">
              <Icon name="ph:x-bold" class="text-gray-400 text-xs" />
            </button>
          </div>
          <div
            v-if="showDropdownA && filteredMembersA.length > 0"
            class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            <button
              v-for="m in filteredMembersA"
              :key="m.id"
              class="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors flex items-center gap-2"
              @click="selectMemberA(m)"
            >
              <span :class="m.gender === 'male' ? 'text-blue-500' : 'text-pink-500'" class="text-xs">
                {{ m.gender === 'male' ? '\u2642' : '\u2640' }}
              </span>
              <span>{{ m.fullName }}</span>
              <span class="text-gray-400 text-xs ml-auto">Đời {{ m.generation }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Member B select -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Chọn thành viên B</label>
        <div class="relative">
          <input
            v-model="searchB"
            class="input-field w-full pl-8"
            placeholder="Tìm và chọn thành viên..."
            @focus="showDropdownB = true"
            @input="showDropdownB = true"
          />
          <Icon name="ph:user" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <div v-if="selectedB" class="absolute right-2 top-1/2 -translate-y-1/2">
            <button @click="clearB" class="p-0.5 rounded hover:bg-gray-100">
              <Icon name="ph:x-bold" class="text-gray-400 text-xs" />
            </button>
          </div>
          <div
            v-if="showDropdownB && filteredMembersB.length > 0"
            class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            <button
              v-for="m in filteredMembersB"
              :key="m.id"
              class="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors flex items-center gap-2"
              @click="selectMemberB(m)"
            >
              <span :class="m.gender === 'male' ? 'text-blue-500' : 'text-pink-500'" class="text-xs">
                {{ m.gender === 'male' ? '\u2642' : '\u2640' }}
              </span>
              <span>{{ m.fullName }}</span>
              <span class="text-gray-400 text-xs ml-auto">Đời {{ m.generation }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Search button -->
      <button
        class="btn-primary w-full flex items-center justify-center gap-2"
        :disabled="!selectedA || !selectedB || loading"
        @click="search"
      >
        <Icon :name="loading ? 'ph:spinner' : 'ph:magnifying-glass-bold'" :class="{ 'animate-spin': loading }" />
        {{ loading ? 'Đang tìm...' : 'Tìm quan hệ' }}
      </button>

      <!-- Error message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-start gap-2">
        <Icon name="ph:warning-bold" class="text-red-500 mt-0.5 shrink-0" />
        <span>{{ error }}</span>
      </div>

      <!-- Result -->
      <div v-if="result" class="space-y-4">
        <!-- Relationship name -->
        <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
          <p class="text-xs text-primary-600 mb-1">Mối quan hệ</p>
          <p class="text-xl font-bold text-primary-800">{{ result.relationship }}</p>
        </div>

        <!-- Description -->
        <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
          <p>{{ result.description }}</p>
        </div>

        <!-- Path visualization -->
        <div>
          <p class="text-sm font-medium text-gray-700 mb-3">Đường đi quan hệ</p>
          <div class="flex flex-wrap items-center gap-2">
            <template v-for="(node, idx) in result.path" :key="node.id">
              <div
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                :class="idx === 0 || idx === result.path.length - 1
                  ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-300'
                  : 'bg-gray-100 text-gray-700'"
              >
                <span :class="node.gender === 'male' ? 'text-blue-500' : 'text-pink-500'" class="text-xs">
                  {{ node.gender === 'male' ? '\u2642' : '\u2640' }}
                </span>
                {{ node.fullName }}
                <span class="text-xs opacity-60">(Đời {{ node.generation }})</span>
              </div>
              <Icon v-if="idx < result.path.length - 1" name="ph:arrow-right-bold" class="text-gray-400 shrink-0" />
            </template>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
interface MemberOption {
  id: number
  fullName: string
  gender: string
  generation: number
}

interface PathNode {
  id: number
  fullName: string
  gender: string
  generation: number
}

interface RelationshipResult {
  path: PathNode[]
  relationship: string
  description: string
}

const props = defineProps<{
  familyLineId: number
  members: MemberOption[]
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const searchA = ref('')
const searchB = ref('')
const selectedA = ref<MemberOption | null>(null)
const selectedB = ref<MemberOption | null>(null)
const showDropdownA = ref(false)
const showDropdownB = ref(false)
const loading = ref(false)
const error = ref('')
const result = ref<RelationshipResult | null>(null)

const filteredMembersA = computed(() => {
  const q = searchA.value.trim().toLowerCase()
  if (!q && selectedA.value) return []
  return props.members
    .filter((m) => {
      if (selectedB.value && m.id === selectedB.value.id) return false
      if (!q) return true
      return m.fullName.toLowerCase().includes(q)
    })
    .slice(0, 20)
})

const filteredMembersB = computed(() => {
  const q = searchB.value.trim().toLowerCase()
  if (!q && selectedB.value) return []
  return props.members
    .filter((m) => {
      if (selectedA.value && m.id === selectedA.value.id) return false
      if (!q) return true
      return m.fullName.toLowerCase().includes(q)
    })
    .slice(0, 20)
})

function selectMemberA(m: MemberOption) {
  selectedA.value = m
  searchA.value = m.fullName
  showDropdownA.value = false
}

function selectMemberB(m: MemberOption) {
  selectedB.value = m
  searchB.value = m.fullName
  showDropdownB.value = false
}

function clearA() {
  selectedA.value = null
  searchA.value = ''
  result.value = null
  error.value = ''
}

function clearB() {
  selectedB.value = null
  searchB.value = ''
  result.value = null
  error.value = ''
}

async function search() {
  if (!selectedA.value || !selectedB.value) return

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const data = await $fetch<RelationshipResult>(
      `/api/family-lines/${props.familyLineId}/relationship`,
      {
        params: {
          memberA: selectedA.value.id,
          memberB: selectedB.value.id,
        },
      },
    )
    result.value = data
  } catch (err: any) {
    error.value = err?.data?.message || 'Không tìm thấy mối quan hệ giữa hai thành viên'
  } finally {
    loading.value = false
  }
}

// Close dropdowns when clicking outside
function handleClickOutside() {
  showDropdownA.value = false
  showDropdownB.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Reset state when modal opens/closes
watch(() => props.modelValue, (val) => {
  if (!val) {
    selectedA.value = null
    selectedB.value = null
    searchA.value = ''
    searchB.value = ''
    result.value = null
    error.value = ''
  }
})
</script>
