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
          <input v-model="form.birthDate" type="date" class="input-field" />
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
          <input v-model="form.deathDate" type="date" class="input-field" />
        </div>

        <!-- Death Anniversary Lunar -->
        <div v-if="!form.isAlive">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ngày giỗ (âm lịch)</label>
          <input v-model="form.deathAnniversaryLunar" class="input-field" placeholder="VD: 15/01 hoặc 15/01/2024" />
          <p class="text-xs text-gray-400 mt-1">Nhập theo định dạng DD/MM hoặc DD/MM/YYYY (âm lịch)</p>
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
