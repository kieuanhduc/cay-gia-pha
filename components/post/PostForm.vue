<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span class="text-red-500">*</span></label>
            <input v-model="form.title" class="input-field" placeholder="Nhập tiêu đề bài viết..." />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
            <textarea v-model="form.excerpt" class="input-field" rows="2" placeholder="Mô tả ngắn hiển thị ở danh sách..." />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nội dung <span class="text-red-500">*</span></label>
            <ClientOnly>
              <RichTextEditor v-model="form.content" />
              <template #fallback>
                <textarea v-model="form.content" class="input-field" rows="10" />
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- Sidebar settings -->
      <div class="space-y-4">
        <!-- Publish settings -->
        <div class="card space-y-4">
          <h3 class="font-semibold text-gray-900">Cài đặt đăng bài</h3>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Loại bài viết <span class="text-red-500">*</span></label>
            <select v-model="form.type" class="input-field" :disabled="!!initial">
              <option value="news">Tin tức</option>
              <option value="event">Sự kiện</option>
            </select>
          </div>

          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.published" class="rounded border-gray-300 text-primary-600" />
            <span class="text-sm font-medium text-gray-700">Đăng công khai</span>
          </label>

          <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</div>

          <div class="flex gap-2 pt-1">
            <button class="btn-secondary flex-1" type="button" @click="save(false)" :disabled="saving">
              {{ saving && !form.published ? 'Đang lưu...' : 'Lưu nháp' }}
            </button>
            <button class="btn-primary flex-1" type="button" @click="save(true)" :disabled="saving">
              {{ saving && form.published ? 'Đang đăng...' : 'Đăng bài' }}
            </button>
          </div>
        </div>

        <!-- Event settings -->
        <div v-if="form.type === 'event'" class="card space-y-4">
          <h3 class="font-semibold text-gray-900">Thông tin sự kiện</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày diễn ra</label>
            <input type="date" v-model="form.eventDate" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
            <input v-model="form.eventPlace" class="input-field" placeholder="VD: Nhà thờ họ Nguyễn..." />
          </div>
        </div>

        <!-- Cover image -->
        <div class="card space-y-3">
          <h3 class="font-semibold text-gray-900">Ảnh bìa</h3>
          <div v-if="form.coverImage" class="relative">
            <img :src="form.coverImage" class="w-full h-40 object-cover rounded-lg" />
            <button
              @click="form.coverImage = ''"
              class="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white"
              type="button"
            >
              <Icon name="ph:x-bold" class="text-gray-600 text-sm" />
            </button>
          </div>
          <div
            v-else
            class="border-2 border-dashed border-gray-200 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors"
            @click="coverInput?.click()"
          >
            <Icon name="ph:image-bold" class="text-gray-300 text-3xl mb-1" />
            <span class="text-xs text-gray-400">Chọn ảnh bìa</span>
          </div>
          <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="uploadCover" />
          <p class="text-xs text-gray-400">Khuyến nghị: 1200×630px, tối đa 5MB</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  initial?: any
}>()

const emit = defineEmits<{
  save: [post: any]
}>()

const coverInput = ref<HTMLInputElement>()
const saving = ref(false)
const error = ref('')

const form = reactive({
  type: props.initial?.type || 'news',
  title: props.initial?.title || '',
  excerpt: props.initial?.excerpt || '',
  content: props.initial?.content || '',
  published: props.initial?.published ?? false,
  eventDate: props.initial?.eventDate ? new Date(props.initial.eventDate).toISOString().split('T')[0] : '',
  eventPlace: props.initial?.eventPlace || '',
  coverImage: props.initial?.coverImage || '',
})

async function save(publish: boolean) {
  error.value = ''
  if (!form.title.trim()) { error.value = 'Vui lòng nhập tiêu đề'; return }
  if (!form.content.trim() || form.content === '<p></p>') { error.value = 'Vui lòng nhập nội dung'; return }

  saving.value = true
  try {
    const body = {
      type: form.type,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      published: publish,
      eventDate: form.eventDate || null,
      eventPlace: form.eventPlace || null,
    }

    let post
    if (props.initial) {
      post = await $fetch(`/api/posts/${props.initial.id}`, { method: 'PUT', body })
    } else {
      post = await $fetch('/api/posts', { method: 'POST', body })
      // Upload cover if selected after creation
    }

    emit('save', post)
  } catch (e: any) {
    error.value = e.data?.message || 'Lưu thất bại'
  } finally {
    saving.value = false
  }
}

async function uploadCover(event: Event) {
  if (!props.initial?.id) {
    alert('Hãy lưu bài viết trước khi tải ảnh bìa')
    return
  }
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('cover', file)

  try {
    const res = await $fetch<any>(`/api/posts/${props.initial.id}/cover`, {
      method: 'POST',
      body: formData,
    })
    form.coverImage = res.coverImage
  } catch (e: any) {
    alert(e.data?.message || 'Tải ảnh thất bại')
  }
}
</script>
