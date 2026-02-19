<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/posts" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
        <Icon name="ph:arrow-left-bold" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Thêm bài viết</h1>
    </div>

    <PostForm @save="onSave" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const router = useRouter()

function onSave(post: any) {
  router.push(`/admin/posts/${post.id}`)
}
</script>
