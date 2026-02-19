<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Tổng quan</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div class="card flex items-center gap-4">
        <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Icon name="ph:users-three-bold" class="text-primary-600 text-xl" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.familyLines }}</p>
          <p class="text-sm text-gray-500">Dòng họ</p>
        </div>
      </div>
      <div class="card flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Icon name="ph:user-bold" class="text-blue-600 text-xl" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.members }}</p>
          <p class="text-sm text-gray-500">Thành viên</p>
        </div>
      </div>
      <div class="card flex items-center gap-4">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Icon name="ph:tree-structure-bold" class="text-green-600 text-xl" />
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900">{{ stats.generations }}</p>
          <p class="text-sm text-gray-500">Thế hệ nhiều nhất</p>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mb-8">
      <NuxtLink to="/admin/family-lines" class="btn-primary inline-flex items-center gap-2">
        <Icon name="ph:plus-bold" />
        Thêm dòng họ
      </NuxtLink>
      <NuxtLink to="/admin/members/create" class="btn-secondary inline-flex items-center gap-2">
        <Icon name="ph:user-plus-bold" />
        Thêm thành viên
      </NuxtLink>
    </div>

    <!-- Ngày giỗ sắp tới -->
    <UpcomingAnniversaries />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const stats = ref({ familyLines: 0, members: 0, generations: 0 })

// Dùng /api/stats thay vì fetch members thủ công, lazy để không block navigation
const { data: statsData } = useLazyFetch('/api/stats')

watchEffect(() => {
  if (!statsData.value) return
  stats.value.familyLines = (statsData.value as any).byFamilyLine?.length || 0
  stats.value.members = (statsData.value as any).total || 0
  const gens: number[] = (statsData.value as any).byGeneration?.map((g: any) => g.generation) || []
  stats.value.generations = gens.length ? Math.max(...gens) : 0
})
</script>
