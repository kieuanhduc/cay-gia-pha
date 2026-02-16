<template>
  <div class="flex items-center gap-1 sm:gap-2">
    <!-- Direction toggle (hidden on very small screens) -->
    <div class="hidden sm:flex bg-gray-100 rounded-lg p-0.5">
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

    <!-- Zoom controls -->
    <div class="flex gap-0.5">
      <button @click="$emit('zoomIn')" class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Phóng to">
        <Icon name="ph:magnifying-glass-plus" />
      </button>
      <button @click="$emit('zoomOut')" class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Thu nhỏ">
        <Icon name="ph:magnifying-glass-minus" />
      </button>
      <button @click="$emit('fit')" class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Vừa màn hình">
        <Icon name="ph:arrows-out" />
      </button>
    </div>

    <div class="w-px h-5 bg-gray-200 hidden sm:block" />

    <!-- Action buttons -->
    <button
      @click="$emit('findRelationship')"
      class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-amber-50 text-amber-700 hover:bg-amber-100"
      title="Tìm quan hệ"
    >
      <Icon name="ph:git-merge-bold" />
      <span class="hidden md:inline">Tìm quan hệ</span>
    </button>
    <button
      @click="$emit('openExport')"
      :disabled="exporting"
      class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      :class="exporting ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'"
      title="Xuất ảnh / PDF"
    >
      <Icon :name="exporting ? 'ph:spinner' : 'ph:export-bold'" :class="{ 'animate-spin': exporting }" />
      <span class="hidden md:inline">{{ exporting ? 'Đang xuất...' : 'Xuất' }}</span>
    </button>
    <button
      v-if="canShare"
      @click="$emit('share')"
      class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
      :class="isShared ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
      title="Chia sẻ"
    >
      <Icon :name="isShared ? 'ph:link-bold' : 'ph:share-network-bold'" />
      <span class="hidden md:inline">{{ isShared ? 'Đang chia sẻ' : 'Chia sẻ' }}</span>
    </button>

    <!-- Mobile overflow menu -->
    <div class="relative sm:hidden">
      <button @click="showMenu = !showMenu" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
        <Icon name="ph:dots-three-vertical-bold" />
      </button>
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showMenu" class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-48 py-1 origin-top-right">
          <!-- Direction -->
          <button
            @click="$emit('update:direction', direction === 'vertical' ? 'horizontal' : 'vertical'); showMenu = false"
            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Icon :name="direction === 'vertical' ? 'ph:arrows-left-right' : 'ph:arrows-down-up'" class="text-gray-400" />
            {{ direction === 'vertical' ? 'Chuyển ngang' : 'Chuyển dọc' }}
          </button>
          <button @click="$emit('findRelationship'); showMenu = false" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
            <Icon name="ph:git-merge-bold" class="text-amber-600" />
            Tìm quan hệ
          </button>
          <button @click="$emit('openExport'); showMenu = false" :disabled="exporting" class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
            <Icon :name="exporting ? 'ph:spinner' : 'ph:export-bold'" class="text-primary-600" :class="{ 'animate-spin': exporting }" />
            {{ exporting ? 'Đang xuất...' : 'Xuất ảnh / PDF' }}
          </button>
          <button
            v-if="canShare"
            @click="$emit('share'); showMenu = false"
            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Icon :name="isShared ? 'ph:link-bold' : 'ph:share-network-bold'" class="text-green-600" />
            {{ isShared ? 'Đang chia sẻ' : 'Chia sẻ' }}
          </button>
        </div>
      </Transition>
    </div>
  </div>

  <!-- Click outside to close menu -->
  <Teleport to="body">
    <div v-if="showMenu" class="fixed inset-0 z-40" @click="showMenu = false" />
  </Teleport>
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

const showMenu = ref(false)
</script>
