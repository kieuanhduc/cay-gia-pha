<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/members" class="p-2 rounded-lg hover:bg-gray-100">
        <Icon name="ph:arrow-left-bold" class="text-gray-500" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">{{ canEdit ? 'Sửa thành viên' : 'Chi tiết thành viên' }}</h1>
    </div>

    <LoadingSpinner v-if="pending" />

    <div v-else-if="member" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Avatar section -->
      <div class="card text-center">
        <div class="mb-4">
          <img
            :src="member.avatarUrl || defaultAvatar"
            :alt="member.fullName"
            class="w-32 h-32 rounded-full mx-auto object-cover bg-gray-200"
            @error="($event.target as HTMLImageElement).src = defaultAvatar"
          />
        </div>
        <h2 class="font-semibold text-lg">{{ member.fullName }}</h2>
        <p class="text-sm text-gray-500">Đời {{ member.generation }}</p>

        <div v-if="canEdit" class="mt-4">
          <label class="btn-secondary cursor-pointer inline-flex items-center gap-2 text-sm">
            <Icon name="ph:camera" />
            Đổi ảnh
            <input type="file" accept="image/*" class="hidden" @change="uploadAvatar" />
          </label>
        </div>

        <!-- Relationships -->
        <div class="mt-6 text-left space-y-3">
          <div v-if="member.father">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Cha</p>
            <p class="text-sm font-medium">{{ member.father.fullName }}</p>
          </div>
          <div v-if="member.mother">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Mẹ</p>
            <p class="text-sm font-medium">{{ member.mother.fullName }}</p>
          </div>
          <div v-if="member.spouses?.length">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Vợ/Chồng</p>
            <p v-for="s in member.spouses" :key="s.id" class="text-sm font-medium">{{ s.fullName }}</p>
          </div>
          <div v-if="member.children?.length">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Con ({{ member.children.length }})</p>
            <p v-for="c in member.children" :key="c.id" class="text-sm">{{ c.fullName }}</p>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <div class="lg:col-span-2">
        <MemberForm v-if="canEdit" :member="member" @saved="onSaved" />

        <!-- Photo Gallery -->
        <MemberGallery
          :member-id="member.id"
          :can-edit="canEdit"
          class="mt-6"
        />

        <MemberVersionHistory
          :member-id="member.id"
          :current-member="member"
          class="mt-6"
          @reverted="onSaved"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { canEdit } = useAuth()
const route = useRoute()
const id = route.params.id

const defaultAvatar = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100" rx="50"/><circle cx="50" cy="40" r="18" fill="%239ca3af"/><path d="M10 95c0-22 18-40 40-40s40 18 40 40" fill="%239ca3af"/></svg>`

const { data: member, pending, refresh } = useLazyFetch<any>(`/api/members/${id}`)

async function uploadAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('Ảnh không được lớn hơn 2MB')
    return
  }
  const formData = new FormData()
  formData.append('avatar', file)
  try {
    await $fetch(`/api/members/${id}/avatar`, { method: 'POST', body: formData })
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || 'Upload thất bại')
  }
}

async function onSaved() {
  await refresh()
}
</script>
