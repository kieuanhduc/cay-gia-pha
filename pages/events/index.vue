<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Sự kiện</h1>
    <p class="text-gray-500 mb-8">Các sự kiện của dòng họ</p>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="!posts.length" class="text-center py-20 text-gray-400">
      <Icon name="ph:calendar-x" class="text-5xl mb-3" />
      <p>Chưa có sự kiện nào</p>
    </div>

    <div v-else class="space-y-4">
      <NuxtLink
        v-for="post in posts"
        :key="post.id"
        :to="`/events/${post.slug}`"
        class="card hover:shadow-md transition-shadow group flex gap-4 overflow-hidden"
      >
        <div class="w-24 sm:w-32 h-24 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <img
            v-if="post.coverImage"
            :src="post.coverImage"
            :alt="post.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="ph:calendar-bold" class="text-gray-300 text-3xl" />
          </div>
        </div>
        <div class="flex-1 min-w-0 py-1">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              <Icon name="ph:calendar-bold" class="text-[10px]" />Sự kiện
            </span>
            <span v-if="post.eventDate" class="text-xs text-gray-500 font-medium">
              <Icon name="ph:clock" class="mr-0.5" />
              {{ formatDate(post.eventDate) }}
            </span>
            <span v-if="post.eventPlace" class="text-xs text-gray-500">
              <Icon name="ph:map-pin" class="mr-0.5" />
              {{ post.eventPlace }}
            </span>
          </div>
          <h2 class="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">{{ post.title }}</h2>
          <p v-if="post.excerpt" class="text-sm text-gray-500 mt-1 line-clamp-2 hidden sm:block">{{ post.excerpt }}</p>
        </div>
      </NuxtLink>

      <div v-if="total > limit" class="flex justify-center gap-2 mt-6">
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
useHead({ title: 'Sự kiện - Cây Gia Phả' })

const page = ref(1)
const limit = 10

const { data, pending } = await useFetch<any>('/api/posts', {
  query: computed(() => ({ type: 'event', published: 'true', page: page.value, limit })),
})

const posts = computed(() => data.value?.items || [])
const total = computed(() => data.value?.total || 0)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>
