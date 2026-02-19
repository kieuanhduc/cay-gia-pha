<template>
  <div>
    <LoadingSpinner v-if="loading" />

    <div v-else-if="!members.length" class="card text-center py-12">
      <Icon name="ph:magnifying-glass" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Không tìm thấy thành viên nào</p>
      <p class="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
    </div>

    <div v-else class="card overflow-x-auto">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-500">
          Tìm thấy <span class="font-semibold text-gray-900">{{ total }}</span> kết quả
        </p>
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left py-3 px-2 font-medium text-gray-500">Họ tên</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden sm:table-cell">Giới tính</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden sm:table-cell">Đời</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Ngày sinh</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden lg:table-cell">Nơi sinh</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden md:table-cell">Dòng họ</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500 hidden lg:table-cell">Vợ/Chồng</th>
            <th class="text-left py-3 px-2 font-medium text-gray-500">Tình trạng</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in members"
            :key="m.id"
            class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="$emit('selectMember', m)"
          >
            <td class="py-3 px-2">
              <div class="flex items-center gap-2">
                <img
                  :src="m.avatarUrl || defaultAvatar"
                  :alt="m.fullName"
                  class="w-8 h-8 rounded-full object-cover bg-gray-200 flex-shrink-0"
                  @error="($event.target as HTMLImageElement).src = defaultAvatar"
                />
                <span class="font-medium text-gray-900">{{ m.fullName }}</span>
              </div>
            </td>
            <td class="py-3 px-2 hidden sm:table-cell">
              <span :class="m.gender === 'male' ? 'text-blue-600' : 'text-pink-600'">
                {{ m.gender === 'male' ? 'Nam' : 'Nữ' }}
              </span>
            </td>
            <td class="py-3 px-2 text-gray-600 hidden sm:table-cell">Đời {{ m.generation }}</td>
            <td class="py-3 px-2 text-gray-500 hidden md:table-cell">{{ formatDate(m.birthDate) }}</td>
            <td class="py-3 px-2 text-gray-500 hidden lg:table-cell">{{ m.birthPlace || '—' }}</td>
            <td class="py-3 px-2 text-gray-500 hidden md:table-cell">{{ m.familyLine?.name || '—' }}</td>
            <td class="py-3 px-2 text-gray-500 hidden lg:table-cell">
              <span v-if="m.spouses?.length">
                {{ m.spouses.map((s: any) => s.fullName).join(', ') }}
              </span>
              <span v-else>—</span>
            </td>
            <td class="py-3 px-2">
              <span
                class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                :class="m.isAlive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
              >
                <Icon :name="m.isAlive ? 'ph:heart-fill' : 'ph:cross-bold'" class="text-[10px]" />
                {{ m.isAlive ? 'Còn sống' : 'Đã mất' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  members: any[]
  total: number
  loading: boolean
}>()

defineEmits<{
  selectMember: [member: any]
}>()

const defaultAvatar = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23e5e7eb" width="40" height="40" rx="20"/><circle cx="20" cy="16" r="7" fill="%239ca3af"/><path d="M5 38c0-8.3 6.7-15 15-15s15 6.7 15 15" fill="%239ca3af"/></svg>`

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return '—'
  }
}
</script>
