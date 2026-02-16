<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/members" class="p-2 rounded-lg hover:bg-gray-100">
        <Icon name="ph:arrow-left-bold" class="text-gray-500" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900">Thêm thành viên</h1>
    </div>

    <MemberForm @saved="onSaved" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { canEdit } = useAuth()
if (!canEdit.value) {
  navigateTo('/admin/members')
}

function onSaved(member: any) {
  navigateTo(`/admin/members/${member.id}`)
}
</script>
