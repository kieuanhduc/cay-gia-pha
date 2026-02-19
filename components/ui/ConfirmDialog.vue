<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="sm">
    <div class="text-center">
      <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="ph:warning-bold" class="text-red-600 text-2xl" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-500 text-sm">{{ message }}</p>
    </div>
    <div class="flex gap-3 mt-6">
      <button class="btn-secondary flex-1" :disabled="loading" @click="$emit('update:modelValue', false)">
        Hủy
      </button>
      <button class="btn-danger flex-1 inline-flex items-center justify-center gap-2" :disabled="loading" @click="$emit('confirm')">
        <Icon v-if="loading" name="ph:spinner-bold" class="animate-spin" />
        {{ loading ? 'Đang xóa...' : confirmText }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  loading?: boolean
}>(), {
  title: 'Xác nhận xóa',
  message: 'Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.',
  confirmText: 'Xóa',
  loading: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>
