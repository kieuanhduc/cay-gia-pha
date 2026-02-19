<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/posts" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
        <Icon name="ph:arrow-left-bold" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Sửa bài viết</h1>
      <a
        v-if="post"
        :href="post.type === 'news' ? `/news/${post.slug}` : `/events/${post.slug}`"
        target="_blank"
        class="ml-auto text-sm text-primary-600 hover:underline flex items-center gap-1"
      >
        <Icon name="ph:arrow-square-out" />
        Xem trang
      </a>
    </div>

    <LoadingSpinner v-if="pending" />

    <PostForm v-else-if="post" :initial="post" @save="onSave" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const id = route.params.id

const { data: post, pending } = await useFetch<any>(`/api/posts/${id}`)

function onSave() {
  navigateTo('/admin/posts')
}
</script>
