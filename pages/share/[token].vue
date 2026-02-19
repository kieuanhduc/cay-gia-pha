<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <NuxtLink to="/" class="flex items-center gap-2">
          <Icon name="ph:tree-structure-bold" class="text-primary-600 text-2xl" />
          <span class="font-bold text-lg text-gray-900">Cây Gia Phả</span>
        </NuxtLink>
        <span class="text-sm text-gray-400 flex items-center gap-1.5">
          <Icon name="ph:share-network" />
          Chế độ chia sẻ
        </span>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="pending" class="flex-1 flex items-center justify-center">
      <LoadingSpinner />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Icon name="ph:warning-circle" class="text-red-300 text-6xl mb-3" />
        <p class="text-gray-600 text-lg">{{ error.data?.message || 'Không thể tải dữ liệu' }}</p>
        <NuxtLink to="/" class="btn-primary mt-4 inline-block">Về trang chủ</NuxtLink>
      </div>
    </div>

    <!-- Password required -->
    <div v-else-if="treeData?.requiresPassword && !authenticated" class="flex-1 flex items-center justify-center p-4">
      <div class="card max-w-md w-full">
        <div class="text-center mb-6">
          <Icon name="ph:lock-simple" class="text-primary-500 text-5xl mb-3" />
          <h2 class="text-xl font-bold text-gray-900">{{ treeData.familyLineName }}</h2>
          <p class="text-gray-500 mt-1">Nhập mật khẩu để xem cây gia phả</p>
        </div>
        <form @submit.prevent="submitPassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              v-model="passwordInput"
              type="password"
              class="input-field"
              placeholder="Nhập mật khẩu..."
              required
              autofocus
            />
          </div>
          <div v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</div>
          <button type="submit" class="btn-primary w-full" :disabled="submitting">
            {{ submitting ? 'Đang xác thực...' : 'Xem cây gia phả' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Tree view -->
    <template v-else-if="displayData">
      <!-- Tree header -->
      <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div>
          <h1 class="text-lg font-bold text-gray-900">{{ displayData.familyLine?.name }}</h1>
          <p class="text-xs text-gray-500">
            {{ displayData.totalMembers }} thành viên
            <span v-if="displayData.familyLine?.description" class="ml-2 text-gray-400">
              &mdash; {{ displayData.familyLine.description }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-1">
          <button @click="handleZoomIn" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Phóng to">
            <Icon name="ph:magnifying-glass-plus" />
          </button>
          <button @click="handleZoomOut" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Thu nhỏ">
            <Icon name="ph:magnifying-glass-minus" />
          </button>
          <button @click="handleFit" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Vừa màn hình">
            <Icon name="ph:arrows-out" />
          </button>
        </div>
      </div>

      <!-- Tree area -->
      <div class="flex-1 min-h-0 relative bg-gradient-to-br from-amber-50 to-orange-50">
        <div v-if="!displayData.tree?.length" class="flex items-center justify-center h-full">
          <div class="text-center">
            <Icon name="ph:tree-structure" class="text-gray-300 text-6xl mb-3" />
            <p class="text-gray-500">Chưa có dữ liệu gia phả</p>
          </div>
        </div>

        <ClientOnly v-else>
          <FamilyTree
            :ref="(el: any) => { treeRef = el }"
            :data="displayData.tree"
            direction="vertical"
            @select-member="selectedMemberId = $event"
          />
          <template #fallback>
            <LoadingSpinner text="Đang vẽ cây gia phả..." />
          </template>
        </ClientOnly>
      </div>

      <!-- Member detail side panel -->
      <MemberCard
        v-if="selectedMemberId"
        :member-id="selectedMemberId"
        @close="selectedMemberId = null"
        @navigate="selectedMemberId = $event"
      />

      <!-- Overlay when side panel is open -->
      <div
        v-if="selectedMemberId"
        class="fixed inset-0 z-40"
        @click="selectedMemberId = null"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const token = route.params.token as string

const treeRef = ref<any>(null)
const selectedMemberId = ref<number | null>(null)
const passwordInput = ref('')
const passwordError = ref('')
const submitting = ref(false)
const authenticated = ref(false)
const displayData = ref<any>(null)

function getTree() {
  return treeRef.value
}

function handleZoomIn() { getTree()?.zoomIn() }
function handleZoomOut() { getTree()?.zoomOut() }
function handleFit() { getTree()?.fit() }

// Initial fetch (without password)
const { data: treeData, pending, error } = useLazyFetch<any>(`/api/share/${token}`)

// If data loaded without needing password, use it directly
if (treeData.value && !treeData.value.requiresPassword) {
  displayData.value = treeData.value
}

async function submitPassword() {
  passwordError.value = ''
  submitting.value = true
  try {
    const data = await $fetch<any>(`/api/share/${token}`, {
      params: { password: passwordInput.value },
    })
    if (data.requiresPassword) {
      passwordError.value = 'Mật khẩu không đúng'
    } else {
      authenticated.value = true
      displayData.value = data
    }
  } catch (e: any) {
    passwordError.value = e.data?.message || 'Có lỗi xảy ra'
  } finally {
    submitting.value = false
  }
}

useHead({
  title: computed(() => {
    const name = displayData.value?.familyLine?.name || treeData.value?.familyLineName
    return name ? `${name} - Cây Gia Phả` : 'Cây Gia Phả - Chia sẻ'
  }),
})
</script>
