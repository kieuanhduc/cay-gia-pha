<template>
  <div class="flex items-center gap-2">
    <div class="flex bg-gray-100 rounded-lg p-0.5">
      <button
        @click="$emit('update:direction', 'vertical')"
        class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
        :class="direction === 'vertical' ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'"
      >
        <Icon name="ph:arrows-down-up" class="mr-1" />Dọc
      </button>
      <button
        @click="$emit('update:direction', 'horizontal')"
        class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
        :class="direction === 'horizontal' ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'"
      >
        <Icon name="ph:arrows-left-right" class="mr-1" />Ngang
      </button>
    </div>
    <div class="flex gap-1">
      <button @click="$emit('zoomIn')" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Phóng to">
        <Icon name="ph:magnifying-glass-plus" />
      </button>
      <button @click="$emit('zoomOut')" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Thu nhỏ">
        <Icon name="ph:magnifying-glass-minus" />
      </button>
      <button @click="$emit('fit')" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Vừa màn hình">
        <Icon name="ph:arrows-out" />
      </button>
      <div class="w-px h-6 bg-gray-200 self-center mx-1" />
      <button
        @click="$emit('findRelationship')"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-amber-50 text-amber-700 hover:bg-amber-100"
        title="Tìm quan hệ"
      >
        <Icon name="ph:git-merge-bold" />
        <span class="hidden sm:inline">Tìm quan hệ</span>
      </button>
      <button
        @click="$emit('openExport')"
        :disabled="exporting"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="exporting ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'"
        title="Xuất ảnh / PDF"
      >
        <Icon :name="exporting ? 'ph:spinner' : 'ph:export-bold'" :class="{ 'animate-spin': exporting }" />
        <span class="hidden sm:inline">{{ exporting ? 'Đang xuất...' : 'Xuất' }}</span>
      </button>
      <button
        v-if="canShare"
        @click="$emit('share')"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="isShared ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
        title="Chia sẻ"
      >
        <Icon :name="isShared ? 'ph:link-bold' : 'ph:share-network-bold'" />
        <span class="hidden sm:inline">{{ isShared ? 'Đang chia sẻ' : 'Chia sẻ' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  direction: 'vertical' | 'horizontal'
  exporting?: boolean
  canShare?: boolean
  isShared?: boolean
}>()
defineEmits<{
  'update:direction': [value: 'vertical' | 'horizontal']
  zoomIn: []
  zoomOut: []
  fit: []
  openExport: []
  findRelationship: []
  share: []
}>()
</script>
