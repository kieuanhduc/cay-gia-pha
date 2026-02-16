<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Xuất cây gia phả"
    size="sm"
  >
    <div class="space-y-5">
      <!-- Format -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Định dạng</label>
        <div class="flex gap-3">
          <label
            class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors"
            :class="format === 'png' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input v-model="format" type="radio" value="png" class="sr-only" />
            <Icon name="ph:image-bold" class="text-lg" :class="format === 'png' ? 'text-primary-600' : 'text-gray-400'" />
            <span class="text-sm font-medium" :class="format === 'png' ? 'text-primary-700' : 'text-gray-600'">PNG</span>
          </label>
          <label
            class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors"
            :class="format === 'pdf' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input v-model="format" type="radio" value="pdf" class="sr-only" />
            <Icon name="ph:file-pdf-bold" class="text-lg" :class="format === 'pdf' ? 'text-primary-600' : 'text-gray-400'" />
            <span class="text-sm font-medium" :class="format === 'pdf' ? 'text-primary-700' : 'text-gray-600'">PDF</span>
          </label>
        </div>
      </div>

      <!-- PDF options -->
      <template v-if="format === 'pdf'">
        <!-- Paper size -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Khổ giấy</label>
          <div class="flex gap-2">
            <button
              v-for="size in paperSizes"
              :key="size.value"
              @click="paperSize = size.value"
              class="flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors"
              :class="paperSize === size.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'"
            >
              {{ size.label }}
            </button>
          </div>
        </div>

        <!-- Orientation -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hướng</label>
          <div class="flex gap-3">
            <label
              class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors"
              :class="orientation === 'portrait' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input v-model="orientation" type="radio" value="portrait" class="sr-only" />
              <Icon name="ph:file-bold" class="text-lg" :class="orientation === 'portrait' ? 'text-primary-600' : 'text-gray-400'" />
              <span class="text-sm font-medium" :class="orientation === 'portrait' ? 'text-primary-700' : 'text-gray-600'">Dọc</span>
            </label>
            <label
              class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors"
              :class="orientation === 'landscape' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input v-model="orientation" type="radio" value="landscape" class="sr-only" />
              <Icon name="ph:file-bold" class="text-lg rotate-90" :class="orientation === 'landscape' ? 'text-primary-600' : 'text-gray-400'" />
              <span class="text-sm font-medium" :class="orientation === 'landscape' ? 'text-primary-700' : 'text-gray-600'">Ngang</span>
            </label>
          </div>
        </div>
      </template>

      <!-- Quality (shared for both formats) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Chất lượng</label>
        <div class="flex gap-3">
          <label
            class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors"
            :class="quality === 'standard' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input v-model="quality" type="radio" value="standard" class="sr-only" />
            <span class="text-sm font-medium" :class="quality === 'standard' ? 'text-primary-700' : 'text-gray-600'">Tiêu chuẩn</span>
          </label>
          <label
            class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors"
            :class="quality === 'high' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input v-model="quality" type="radio" value="high" class="sr-only" />
            <span class="text-sm font-medium" :class="quality === 'high' ? 'text-primary-700' : 'text-gray-600'">Cao</span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <button class="btn-secondary" @click="$emit('update:modelValue', false)">
          Huỷ
        </button>
        <button class="btn-primary flex items-center gap-2" @click="handleExport">
          <Icon name="ph:export-bold" />
          Xuất
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { PdfExportOptions } from '~/composables/useTreeExport'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  exportPng: []
  exportPdf: [options: PdfExportOptions]
}>()

const format = ref<'png' | 'pdf'>('png')
const paperSize = ref<'a4' | 'a3' | 'a2'>('a4')
const orientation = ref<'portrait' | 'landscape'>('portrait')
const quality = ref<'standard' | 'high'>('standard')

const paperSizes = [
  { value: 'a4' as const, label: 'A4' },
  { value: 'a3' as const, label: 'A3' },
  { value: 'a2' as const, label: 'A2' },
]

function handleExport() {
  if (format.value === 'png') {
    emit('exportPng')
  } else {
    emit('exportPdf', {
      paperSize: paperSize.value,
      orientation: orientation.value,
      quality: quality.value,
    })
  }
  emit('update:modelValue', false)
}
</script>
