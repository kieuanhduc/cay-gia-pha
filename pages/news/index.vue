<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Tin tức</h1>
    <p class="text-gray-500 mb-8">Cập nhật tin tức mới nhất về dòng họ</p>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="!posts.length" class="text-center py-20 text-gray-400">
      <Icon name="ph:newspaper" class="text-5xl mb-3" />
      <p>Chưa có tin tức nào</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="post in posts"
          :key="post.id"
          :to="`/news/${post.slug}`"
          class="card hover:shadow-md transition-shadow group overflow-hidden !p-0"
        >
          <div class="h-44 bg-gray-100 overflow-hidden">
            <img
              v-if="post.coverImage"
              :src="post.coverImage"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon name="ph:newspaper" class="text-gray-300 text-4xl" />
            </div>
          </div>
          <div class="p-4">
            <p class="text-xs text-gray-400 mb-1">{{ formatDate(post.createdAt) }}</p>
            <h2 class="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">{{ post.title }}</h2>
            <p v-if="post.excerpt" class="text-sm text-gray-500 mt-2 line-clamp-2">{{ post.excerpt }}</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="total > limit" class="flex justify-center gap-2 mt-10">
        <button
          v-for="p in Math.ceil(total / limit)"
          :key="p"
          @click="page = p"
          class="w-9 h-9 rounded-lg text-sm font-medium"
          :class="p === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600 border border-gray-200'"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Tin tức - Cây Gia Phả' })

const page = ref(1)
const limit = 9

const { data, pending } = await useFetch<any>('/api/posts', {
  query: computed(() => ({ type: 'news', published: 'true', page: page.value, limit })),
})

const posts = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>
