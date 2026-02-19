<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div v-if="member" class="fixed right-0 top-0 bottom-0 w-full sm:w-80 bg-white shadow-2xl z-50 overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">Chi tiết thành viên</h3>
        <button @click="$emit('close')" class="p-1 rounded-lg hover:bg-gray-100">
          <Icon name="ph:x-bold" class="text-gray-400" />
        </button>
      </div>

      <div v-if="pending" class="p-4">
        <LoadingSpinner text="Đang tải..." />
      </div>

      <div v-else-if="member" class="p-4">
        <!-- Avatar & Name -->
        <div class="text-center mb-6">
          <img
            :src="member.avatarUrl || defaultAvatar"
            :alt="member.fullName"
            class="w-24 h-24 rounded-full mx-auto mb-3 object-cover bg-gray-200"
            @error="($event.target as HTMLImageElement).src = defaultAvatar"
          />
          <h2 class="text-lg font-bold text-gray-900">{{ member.fullName }}</h2>
          <p class="text-sm" :class="member.gender === 'male' ? 'text-blue-600' : 'text-pink-600'">
            {{ member.gender === 'male' ? 'Nam' : 'Nữ' }}
          </p>
          <p class="text-sm text-amber-700 font-medium">Đời {{ member.generation }}</p>
        </div>

        <!-- Info -->
        <div class="space-y-3 text-sm">
          <div v-if="member.birthDate" class="flex justify-between">
            <span class="text-gray-500">Ngày sinh</span>
            <span>{{ formatDate(member.birthDate) }}</span>
          </div>
          <div v-if="!member.isAlive && member.deathDate" class="flex justify-between">
            <span class="text-gray-500">Ngày mất</span>
            <span>{{ formatDate(member.deathDate) }}</span>
          </div>
          <div v-if="member.birthPlace" class="flex justify-between">
            <span class="text-gray-500">Nơi sinh</span>
            <span>{{ member.birthPlace }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Tình trạng</span>
            <span :class="member.isAlive ? 'text-green-600' : 'text-gray-400'">
              {{ member.isAlive ? 'Còn sống' : 'Đã mất' }}
            </span>
          </div>
          <div v-if="member.deathAnniversaryLunar" class="flex justify-between">
            <span class="text-gray-500">Ngày giỗ (ÂL)</span>
            <span class="text-amber-700">{{ member.deathAnniversaryLunar }}</span>
          </div>
          <div v-if="member.deathAnniversaryNote" class="flex justify-between">
            <span class="text-gray-500">Ghi chú giỗ</span>
            <span class="text-gray-700 text-right max-w-[150px]">{{ member.deathAnniversaryNote }}</span>
          </div>
        </div>

        <!-- Bio -->
        <div v-if="member.bio" class="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-gray-700">
          {{ member.bio }}
        </div>

        <!-- Relationships -->
        <div class="mt-6 space-y-4">
          <div v-if="member.father">
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Cha</p>
            <button @click="$emit('navigate', member.father.id)" class="text-sm text-primary-600 hover:underline">
              {{ member.father.fullName }}
            </button>
          </div>
          <div v-if="member.mother">
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Mẹ</p>
            <button @click="$emit('navigate', member.mother.id)" class="text-sm text-primary-600 hover:underline">
              {{ member.mother.fullName }}
            </button>
          </div>
          <div v-if="member.spouses?.length">
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Vợ/Chồng</p>
            <div v-for="s in member.spouses" :key="s.id">
              <button @click="$emit('navigate', s.id)" class="text-sm text-primary-600 hover:underline">
                {{ s.fullName }}
              </button>
            </div>
          </div>
          <div v-if="member.children?.length">
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Con ({{ member.children.length }})</p>
            <div v-for="c in member.children" :key="c.id" class="ml-2">
              <button @click="$emit('navigate', c.id)" class="text-sm text-primary-600 hover:underline">
                {{ c.fullName }}
              </button>
            </div>
          </div>
        </div>

        <!-- Admin link -->
        <div v-if="canEdit" class="mt-6 pt-4 border-t border-gray-100">
          <NuxtLink :to="`/admin/members/${member.id}`" class="btn-secondary w-full text-center block text-sm">
            <Icon name="ph:pencil-simple" class="mr-1" />Chỉnh sửa
          </NuxtLink>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{ memberId: number | null }>()
defineEmits<{
  close: []
  navigate: [id: number]
}>()

const { canEdit } = useAuth()

const defaultAvatar = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100" rx="50"/><circle cx="50" cy="40" r="18" fill="%239ca3af"/><path d="M10 95c0-22 18-40 40-40s40 18 40 40" fill="%239ca3af"/></svg>`

const member = ref<any>(null)
const pending = ref(false)

watch(() => props.memberId, async (id) => {
  if (!id) {
    member.value = null
    return
  }
  pending.value = true
  try {
    member.value = await $fetch(`/api/members/${id}`)
  } catch {
    member.value = null
  } finally {
    pending.value = false
  }
}, { immediate: true })

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}
</script>
