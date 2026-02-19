<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <NuxtLink to="/events" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
      <Icon name="ph:arrow-left" />
      Quay lại sự kiện
    </NuxtLink>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="!post" class="text-center py-20 text-gray-400">
      <Icon name="ph:file-x" class="text-5xl mb-3" />
      <p>Không tìm thấy sự kiện</p>
    </div>

    <article v-else>
      <div v-if="post.coverImage" class="rounded-xl overflow-hidden mb-6 h-64 sm:h-80">
        <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover" />
      </div>

      <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          <Icon name="ph:calendar-bold" class="text-[10px]" />Sự kiện
        </span>
        <span v-if="post.eventDate" class="flex items-center gap-1">
          <Icon name="ph:clock" />{{ formatDate(post.eventDate) }}
        </span>
        <span v-if="post.eventPlace" class="flex items-center gap-1">
          <Icon name="ph:map-pin" />{{ post.eventPlace }}
        </span>
      </div>

      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{{ post.title }}</h1>

      <div class="prose prose-gray max-w-none" v-html="post.content"></div>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: listData, pending } = useLazyFetch<any>('/api/posts', {
  query: { type: 'event', published: 'true', limit: 1000 },
})

const post = computed(() => listData.value?.items?.find((p: any) => p.slug === slug) || null)

watchEffect(() => {
  if (post.value) useHead({ title: `${post.value.title} - Cây Gia Phả` })
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<style>
.prose h2 { font-size: 1.4rem; font-weight: 700; margin: 1.5em 0 0.5em; color: #111827; }
.prose h3 { font-size: 1.15rem; font-weight: 700; margin: 1.2em 0 0.5em; color: #111827; }
.prose p { margin: 0.75em 0; color: #374151; line-height: 1.75; }
.prose ul { list-style: disc; padding-left: 1.5em; margin: 0.75em 0; color: #374151; }
.prose ol { list-style: decimal; padding-left: 1.5em; margin: 0.75em 0; color: #374151; }
.prose blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; color: #6b7280; margin: 1em 0; font-style: italic; }
.prose hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
.prose strong { font-weight: 700; }
.prose em { font-style: italic; }
</style>
