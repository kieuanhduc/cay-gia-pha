<template>
  <div class="card">
    <form @submit.prevent="save" class="space-y-5">
      <!-- Family Line -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Dòng họ *</label>
        <select v-model="form.familyLineId" class="input-field" required :disabled="!!member">
          <option value="">-- Chọn dòng họ --</option>
          <option v-for="fl in familyLines" :key="fl.id" :value="fl.id">{{ fl.name }}</option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
          <input v-model="form.fullName" class="input-field" placeholder="VD: Nguyễn Văn An" required />
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
          <div class="flex gap-4 mt-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.gender" value="male" class="text-primary-600" />
              <span class="text-sm">Nam</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.gender" value="female" class="text-primary-600" />
              <span class="text-sm">Nữ</span>
            </label>
          </div>
        </div>

        <!-- Birth Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
          <DatePicker v-model="form.birthDate" placeholder="Chọn ngày sinh" />
        </div>

        <!-- Is Alive -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
          <div class="flex gap-4 mt-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.isAlive" :value="true" class="text-primary-600" />
              <span class="text-sm">Còn sống</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.isAlive" :value="false" class="text-primary-600" />
              <span class="text-sm">Đã mất</span>
            </label>
          </div>
        </div>

        <!-- Death Date -->
        <div v-if="!form.isAlive">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ngày mất</label>
          <DatePicker v-model="form.deathDate" placeholder="Chọn ngày mất" />
        </div>

        <!-- Death Anniversary Lunar -->
        <div v-if="!form.isAlive">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ngày giỗ (âm lịch)</label>
          <div class="flex items-center gap-2">
            <select v-model="lunarDay" class="input-field flex-1" @change="lunarAutoFilled = false">
              <option value="">Ngày</option>
              <option v-for="d in 30" :key="d" :value="d">{{ d }}</option>
            </select>
            <span class="text-gray-400">/</span>
            <select v-model="lunarMonth" class="input-field flex-1" @change="lunarAutoFilled = false">
              <option value="">Tháng</option>
              <option v-for="m in 12" :key="m" :value="m">Tháng {{ m }}</option>
            </select>
          </div>
          <p v-if="lunarAutoFilled" class="text-xs text-primary-500 mt-1">Tự động tính từ ngày mất</p>
        </div>

        <!-- Death Anniversary Note -->
        <div v-if="!form.isAlive">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú ngày giỗ</label>
          <input v-model="form.deathAnniversaryNote" class="input-field" placeholder="VD: Giỗ tại nhà thờ họ" />
        </div>

        <!-- Birth Place -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nơi sinh</label>
          <input v-model="form.birthPlace" class="input-field" placeholder="VD: Hà Nội" />
        </div>

        <!-- Generation -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Đời thứ</label>
          <input v-model.number="form.generation" type="number" min="1" class="input-field" />
        </div>

        <!-- Birth Order -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Thứ tự (con thứ mấy)</label>
          <input v-model.number="form.birthOrder" type="number" min="1" class="input-field" />
        </div>
      </div>

      <!-- Father -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Cha</label>
        <select v-model="form.fatherId" class="input-field">
          <option :value="null">-- Không chọn --</option>
          <option
            v-for="m in maleMembers"
            :key="m.id"
            :value="m.id"
          >
            {{ m.fullName }} (Đời {{ m.generation }})
          </option>
        </select>
      </div>

      <!-- Mother -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Mẹ</label>
        <select v-model="form.motherId" class="input-field">
          <option :value="null">-- Không chọn --</option>
          <option
            v-for="m in femaleMembers"
            :key="m.id"
            :value="m.id"
          >
            {{ m.fullName }} (Đời {{ m.generation }})
          </option>
        </select>
      </div>

      <!-- Spouse (only for new members) -->
      <div v-if="!member">
        <label class="block text-sm font-medium text-gray-700 mb-1">Vợ/Chồng</label>
        <select v-model="form.spouseId" class="input-field">
          <option :value="null">-- Không chọn --</option>
          <option v-for="m in potentialSpouses" :key="m.id" :value="m.id">
            {{ m.fullName }} (Đời {{ m.generation }})
          </option>
        </select>
      </div>

      <!-- Bio -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tiểu sử</label>
        <textarea v-model="form.bio" class="input-field" rows="3" placeholder="Giới thiệu ngắn..." />
      </div>

      <div v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{{ error }}</div>

      <div class="flex gap-3">
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Đang lưu...' : member ? 'Cập nhật' : 'Tạo mới' }}
        </button>
        <NuxtLink to="/admin/members" class="btn-secondary">Hủy</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  member?: any
}>()

const emit = defineEmits<{
  saved: [member: any]
}>()

const { data: familyLinesData } = await useFetch<any[]>('/api/family-lines')
const familyLines = computed(() => familyLinesData.value || [])

const form = ref({
  familyLineId: props.member?.familyLineId || '',
  fullName: props.member?.fullName || '',
  gender: props.member?.gender || 'male',
  birthDate: props.member?.birthDate?.split('T')[0] || '',
  deathDate: props.member?.deathDate?.split('T')[0] || '',
  isAlive: props.member?.isAlive !== false,
  birthPlace: props.member?.birthPlace || '',
  bio: props.member?.bio || '',
  generation: props.member?.generation || 1,
  birthOrder: props.member?.birthOrder || 1,
  fatherId: props.member?.fatherId || null,
  motherId: props.member?.motherId || null,
  deathAnniversaryLunar: props.member?.deathAnniversaryLunar || '',
  deathAnniversaryNote: props.member?.deathAnniversaryNote || '',
  spouseId: null as number | null,
})

// Lunar date helpers
function parseLunar(val: string) {
  if (!val) return { day: '' as '' | number, month: '' as '' | number }
  const parts = val.split('/')
  return { day: parseInt(parts[0]) || '', month: parseInt(parts[1]) || '' }
}

const parsed = parseLunar(form.value.deathAnniversaryLunar)
const lunarDay = ref<number | ''>(parsed.day)
const lunarMonth = ref<number | ''>(parsed.month)

watch([lunarDay, lunarMonth], ([d, m]) => {
  if (d && m) {
    form.value.deathAnniversaryLunar = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
  } else {
    form.value.deathAnniversaryLunar = ''
  }
})

// Auto-convert death date (solar) to lunar anniversary
const lunarAutoFilled = ref(false)

async function fillLunarFromDeathDate(date: string) {
  if (!date) return
  try {
    const result = await $fetch<{ lunarDay: number; lunarMonth: number }>('/api/utils/solar-to-lunar', {
      params: { date },
    })
    lunarDay.value = result.lunarDay
    lunarMonth.value = result.lunarMonth
    lunarAutoFilled.value = true
  } catch {
    // ignore
  }
}

// Auto-fill on load if lunar is empty but death date exists
if (!lunarDay.value && !lunarMonth.value && form.value.deathDate) {
  fillLunarFromDeathDate(form.value.deathDate)
}

// Auto-fill when death date changes
watch(() => form.value.deathDate, (newDate) => {
  if (newDate) fillLunarFromDeathDate(newDate)
})

// Fetch members of same family line for parent selection
const { data: membersData } = await useFetch<any>('/api/members', {
  query: computed(() => ({
    familyLineId: form.value.familyLineId || undefined,
    limit: 1000,
  })),
})

const allMembers = computed(() => {
  const list = membersData.value?.members || []
  // Exclude current member from selection
  return props.member ? list.filter((m: any) => m.id !== props.member.id) : list
})

const maleMembers = computed(() => allMembers.value.filter((m: any) => m.gender === 'male'))
const femaleMembers = computed(() => allMembers.value.filter((m: any) => m.gender === 'female'))
const potentialSpouses = computed(() => {
  if (form.value.gender === 'male') return femaleMembers.value
  return maleMembers.value
})

const error = ref('')
const saving = ref(false)

async function save() {
  error.value = ''
  saving.value = true
  try {
    let result
    const body = { ...form.value }
    if (props.member) {
      result = await $fetch(`/api/members/${props.member.id}`, { method: 'PUT', body })
    } else {
      result = await $fetch('/api/members', { method: 'POST', body })
    }
    emit('saved', result)
  } catch (e: any) {
    error.value = e.data?.message || 'Có lỗi xảy ra'
  } finally {
    saving.value = false
  }
}
</script>
