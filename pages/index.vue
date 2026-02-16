<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50 py-16 lg:py-24">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <div class="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Icon name="ph:tree-structure-bold" class="text-primary-600 text-4xl" />
        </div>
        <h1 class="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
          Cây Gia Phả
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Giữ gìn và lưu truyền truyền thống gia đình. Xây dựng, quản lý và chia sẻ cây gia phả dòng họ một cách trực quan.
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink v-if="familyLines?.length" :to="`/tree/${familyLines[0].id}`" class="btn-primary text-lg px-6 py-3">
            <Icon name="ph:tree-structure" class="mr-2" />Xem gia phả
          </NuxtLink>
          <NuxtLink v-if="isLoggedIn" to="/admin" class="btn-secondary text-lg px-6 py-3">
            <Icon name="ph:gear" class="mr-2" />Quản trị
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Family Lines -->
    <section class="max-w-5xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Các dòng họ</h2>

      <LoadingSpinner v-if="pending" />

      <div v-else-if="!familyLines?.length" class="text-center py-12">
        <Icon name="ph:users-three" class="text-gray-300 text-5xl mb-3" />
        <p class="text-gray-500">Chưa có dòng họ nào được tạo</p>
        <NuxtLink v-if="isLoggedIn" to="/admin/family-lines" class="btn-primary mt-4 inline-block">
          Tạo dòng họ đầu tiên
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="fl in familyLines"
          :key="fl.id"
          :to="`/tree/${fl.id}`"
          class="card hover:shadow-md hover:border-primary-200 transition-all group"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
              <Icon name="ph:users-three-bold" class="text-primary-600" />
            </div>
            <div class="min-w-0">
              <h3 class="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{{ fl.name }}</h3>
              <p v-if="fl.originPlace" class="text-sm text-gray-500 mt-0.5">
                <Icon name="ph:map-pin" class="mr-0.5" />{{ fl.originPlace }}
              </p>
              <p class="text-sm text-gray-400 mt-1">{{ fl.memberCount }} thành viên</p>
            </div>
          </div>
          <p v-if="fl.description" class="text-sm text-gray-500 mt-3 line-clamp-2">{{ fl.description }}</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Features -->
    <section class="bg-white py-12 border-t border-gray-100">
      <div class="max-w-5xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Tính năng</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon name="ph:tree-structure-bold" class="text-blue-600 text-xl" />
            </div>
            <h3 class="font-medium text-gray-900">Cây trực quan</h3>
            <p class="text-sm text-gray-500 mt-1">Hiển thị gia phả dạng cây, hỗ trợ dọc và ngang</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon name="ph:user-plus-bold" class="text-green-600 text-xl" />
            </div>
            <h3 class="font-medium text-gray-900">Quản lý dễ dàng</h3>
            <p class="text-sm text-gray-500 mt-1">Thêm, sửa, xóa thành viên với giao diện trực quan</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon name="ph:image-bold" class="text-purple-600 text-xl" />
            </div>
            <h3 class="font-medium text-gray-900">Ảnh đại diện</h3>
            <p class="text-sm text-gray-500 mt-1">Upload ảnh cho từng thành viên trong gia phả</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon name="ph:download-bold" class="text-amber-600 text-xl" />
            </div>
            <h3 class="font-medium text-gray-900">Nhập/Xuất</h3>
            <p class="text-sm text-gray-500 mt-1">Sao lưu và chia sẻ dữ liệu gia phả dạng JSON</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { isLoggedIn } = useAuth()
const { data: familyLines, pending } = await useFetch<any[]>('/api/family-lines')
</script>
