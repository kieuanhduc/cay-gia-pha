<template>
  <div class="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
    <!-- Direction toggle (từ sm / 640px) -->
    <div class="hidden sm:flex bg-gray-100 rounded-lg p-0.5 shrink-0">
      <button
        @click="$emit('update:direction', 'vertical')"
        class="px-2 md:px-2.5 lg:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1"
        :class="direction === 'vertical' ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'"
      >
        <Icon name="ph:arrows-down-up" class="text-sm" />
        <span class="hidden md:inline">Dọc</span>
      </button>
      <button
        @click="$emit('update:direction', 'horizontal')"
        class="px-2 md:px-2.5 lg:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1"
        :class="direction === 'horizontal' ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'"
      >
        <Icon name="ph:arrows-left-right" class="text-sm" />
        <span class="hidden md:inline">Ngang</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="w-px h-5 bg-gray-200 hidden sm:block shrink-0" />

    <!-- Zoom controls (luôn hiển thị cả mobile) -->
    <div class="flex gap-0.5 sm:gap-1 shrink-0">
      <button @click="$emit('zoomIn')" class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Phóng to">
        <Icon name="ph:magnifying-glass-plus" class="text-base" />
      </button>
      <button @click="$emit('zoomOut')" class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Thu nhỏ">
        <Icon name="ph:magnifying-glass-minus" class="text-base" />
      </button>
      <button @click="$emit('fit')" class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Vừa màn hình">
        <Icon name="ph:arrows-out" class="text-base" />
      </button>
    </div>

    <!-- Divider -->
    <div class="w-px h-5 bg-gray-200 hidden sm:block shrink-0" />

    <!-- Action buttons (từ sm / 640px) -->
    <div class="hidden sm:flex items-center gap-1 md:gap-1.5 shrink-0">
      <button
        @click="$emit('findRelationship')"
        class="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-amber-50 text-amber-700 hover:bg-amber-100 whitespace-nowrap"
        title="Tìm quan hệ"
      >
        <Icon name="ph:git-merge-bold" class="text-base" />
        <span class="hidden md:inline">Tìm quan hệ</span>
      </button>
      <button
        @click="$emit('openExport')"
        :disabled="exporting"
        class="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
        :class="exporting ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'"
        title="Xuất ảnh / PDF"
      >
        <Icon :name="exporting ? 'ph:spinner' : 'ph:export-bold'" class="text-base" :class="{ 'animate-spin': exporting }" />
        <span class="hidden md:inline">{{ exporting ? 'Đang xuất...' : 'Xuất' }}</span>
      </button>
      <button
        v-if="canShare"
        @click="$emit('share')"
        class="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
        :class="isShared ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
        title="Chia sẻ"
      >
        <Icon :name="isShared ? 'ph:link-bold' : 'ph:share-network-bold'" class="text-base" />
        <span class="hidden md:inline">{{ isShared ? 'Đang chia sẻ' : 'Chia sẻ' }}</span>
      </button>
    </div>

    <!-- Overflow menu cho actions (chỉ hiện trên mobile < 640px) -->
    <div class="relative sm:hidden shrink-0">
      <button @click="showMenu = !showMenu" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Menu">
        <Icon name="ph:dots-three-vertical-bold" class="text-base" />
      </button>
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showMenu" class="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-48 py-1 origin-top-right">
          <!-- Direction -->
          <button
            @click="$emit('update:direction', direction === 'vertical' ? 'horizontal' : 'vertical'); showMenu = false"
            class="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <Icon :name="direction === 'vertical' ? 'ph:arrows-left-right' : 'ph:arrows-down-up'" class="text-base text-gray-500" />
            <span class="font-medium text-gray-700">{{ direction === 'vertical' ? 'Chuyển ngang' : 'Chuyển dọc' }}</span>
          </button>

          <div class="h-px bg-gray-100 my-1" />

          <!-- Actions -->
          <button @click="$emit('findRelationship'); showMenu = false" class="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
            <Icon name="ph:git-merge-bold" class="text-base text-amber-600" />
            <span class="font-medium text-gray-700">Tìm quan hệ</span>
          </button>
          <button @click="$emit('openExport'); showMenu = false" :disabled="exporting" class="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors disabled:opacity-50">
            <Icon :name="exporting ? 'ph:spinner' : 'ph:export-bold'" class="text-base text-primary-600" :class="{ 'animate-spin': exporting }" />
            <span class="font-medium text-gray-700">{{ exporting ? 'Đang xuất...' : 'Xuất ảnh / PDF' }}</span>
          </button>
          <button
            v-if="canShare"
            @click="$emit('share'); showMenu = false"
            class="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
          >
            <Icon :name="isShared ? 'ph:link-bold' : 'ph:share-network-bold'" class="text-base text-green-600" />
            <span class="font-medium text-gray-700">{{ isShared ? 'Đang chia sẻ' : 'Chia sẻ' }}</span>
          </button>
        </div>
      </Transition>
    </div>
  </div>

  <!-- Click outside to close menu -->
  <Teleport to="body">
    <div v-if="showMenu" class="fixed inset-0 z-40" @click="showMenu = false" aria-hidden="true" />
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
