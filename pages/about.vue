<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Giới thiệu</h1>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="content" class="prose prose-gray max-w-none" v-html="content"></div>

    <div v-else class="text-center py-20 text-gray-400">
      <Icon name="ph:info" class="text-5xl mb-3" />
      <p>Nội dung đang được cập nhật</p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Giới thiệu - Cây Gia Phả' })

const { data, pending } = useLazyFetch<any>('/api/site-content/about')
const content = computed(() => data.value?.content || '')
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
</style>
