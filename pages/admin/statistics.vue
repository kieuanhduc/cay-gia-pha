<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Thống kê chi tiết</h1>

    <LoadingSpinner v-if="pending" />

    <template v-else-if="stats">
      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Icon name="ph:users-bold" class="text-primary-600 text-xl" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            <p class="text-sm text-gray-500">Tổng thành viên</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Icon name="ph:heart-bold" class="text-green-600 text-xl" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.byAlive.alive }}</p>
            <p class="text-sm text-gray-500">Còn sống</p>
          </div>
        </div>
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Icon name="ph:cross-bold" class="text-gray-500 text-xl" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ stats.byAlive.deceased }}</p>
            <p class="text-sm text-gray-500">Đã mất</p>
          </div>
        </div>
      </div>

      <!-- Charts grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Thành viên theo đời</h2>
          <div class="h-72">
            <ClientOnly>
              <GenerationChart :data="stats.byGeneration" />
            </ClientOnly>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ giới tính</h2>
          <div class="h-72">
            <ClientOnly>
              <GenderChart :data="stats.byGender" />
            </ClientOnly>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Phân bố độ tuổi</h2>
          <div class="h-72">
            <ClientOnly>
              <AgeDistributionChart :data="stats.ageDistribution" />
            </ClientOnly>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Thành viên theo dòng họ</h2>
          <div class="h-72">
            <ClientOnly>
              <FamilyLineChart :data="stats.byFamilyLine" />
            </ClientOnly>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="card text-center py-12">
      <Icon name="ph:chart-bar" class="text-gray-300 text-5xl mb-3" />
      <p class="text-gray-500">Không thể tải dữ liệu thống kê</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: stats, pending } = useLazyFetch('/api/stats')
</script>
