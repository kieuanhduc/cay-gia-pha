<template>
  <div class="flex items-center justify-center py-12">
    <div class="text-center">
      <Icon name="ph:spinner" class="animate-spin text-primary-600 text-3xl mb-2" />
      <p class="text-sm text-gray-500">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), { text: 'Đang tải...' })
</script>
