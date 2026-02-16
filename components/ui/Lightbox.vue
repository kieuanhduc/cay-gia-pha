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
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
        @keydown.left="prev"
        @keydown.right="next"
        @keydown.escape="close"
        tabindex="0"
        ref="lightboxRef"
      >
        <!-- Close button -->
        <button
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          @click="close"
        >
          <Icon name="ph:x-bold" class="text-xl" />
        </button>

        <!-- Counter -->
        <div
          v-if="images.length > 1"
          class="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/40 text-white text-sm"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Previous button -->
        <button
          v-if="images.length > 1"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          @click="prev"
        >
          <Icon name="ph:caret-left-bold" class="text-2xl" />
        </button>

        <!-- Next button -->
        <button
          v-if="images.length > 1"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          @click="next"
        >
          <Icon name="ph:caret-right-bold" class="text-2xl" />
        </button>

        <!-- Image area -->
        <div class="flex flex-col items-center max-w-full max-h-full px-16 py-16" @click.self="close">
          <img
            :src="currentImage?.url"
            :alt="currentImage?.caption || 'Ảnh'"
            class="max-w-full max-h-[80vh] object-contain rounded-lg select-none"
            @click.stop
          />
          <!-- Caption -->
          <div
            v-if="currentImage?.caption"
            class="mt-4 px-4 py-2 bg-black/40 rounded-lg text-white text-sm text-center max-w-lg"
          >
            {{ currentImage.caption }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface LightboxImage {
  url: string
  caption?: string | null
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  images: LightboxImage[]
  startIndex?: number
}>(), {
  startIndex: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const lightboxRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)

const currentImage = computed(() => props.images[currentIndex.value])

function close() {
  emit('update:modelValue', false)
}

function prev() {
  if (props.images.length <= 1) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function next() {
  if (props.images.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'Escape') close()
}

watch(() => props.modelValue, (val) => {
  if (val) {
    currentIndex.value = props.startIndex
    nextTick(() => {
      lightboxRef.value?.focus()
    })
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
