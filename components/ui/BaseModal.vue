<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="$emit('update:modelValue', false)" />
        <div
          class="relative bg-white rounded-xl shadow-xl w-full overflow-hidden"
          :class="sizeClass"
        >
          <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900">{{ title }}</h3>
            <button @click="$emit('update:modelValue', false)" class="p-1 rounded-lg hover:bg-gray-100">
              <Icon name="ph:x-bold" class="text-gray-400" />
            </button>
          </div>
          <div class="p-6">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}>(), { size: 'md' })

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
}[props.size]))
</script>
