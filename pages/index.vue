<template>
  <div class="overflow-hidden">
    <!-- No-access banner -->
    <Transition name="slide-down">
      <div
        v-if="showNoAccessBanner"
        class="relative bg-amber-50 border-b border-amber-200"
      >
        <div class="max-w-7xl mx-auto px-4 py-3.5 flex items-start gap-3 sm:items-center">
          <Icon name="ph:lock-bold" class="text-amber-500 text-xl flex-shrink-0 mt-0.5 sm:mt-0" />
          <p class="text-sm text-amber-800 flex-1">
            <span class="font-semibold">Tài khoản của bạn chưa được cấp quyền.</span>
            Nếu bạn là thành viên trong dòng họ, hãy liên hệ quản trị viên để được cấp quyền truy cập gia phả.
          </p>
          <button
            @click="showNoAccessBanner = false; sessionStorage.removeItem('noAccessBanner')"
            class="flex-shrink-0 p-1 rounded-md hover:bg-amber-100 text-amber-500 hover:text-amber-700 transition-colors"
            aria-label="Đóng"
          >
            <Icon name="ph:x-bold" class="text-base" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- No-access popup -->
    <Transition name="fade">
      <div
        v-if="showNoAccessPopup"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="showNoAccessPopup = false"
      >
        <Transition name="pop">
          <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="ph:lock-key-bold" class="text-amber-500 text-3xl" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Chưa có quyền truy cập</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-6">
              Tài khoản của bạn chưa được cấp quyền xem gia phả.<br />
              Nếu bạn là thành viên trong dòng họ, hãy liên hệ quản trị viên để được cấp quyền.
            </p>
            <button
              @click="showNoAccessPopup = false"
              class="btn-primary w-full"
            >
              Đã hiểu
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl" />
        <div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
        <!-- Subtle pattern overlay -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" />
      </div>

      <div class="relative max-w-6xl mx-auto px-4 py-20 lg:py-32">
        <div class="text-center">
          <!-- Logo -->
          <div class="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 ring-1 ring-white/20">
            <Icon name="ph:tree-structure-bold" class="text-amber-300 text-4xl" />
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span class="block">Cây Gia Phả</span>
            <span class="block text-xl sm:text-2xl lg:text-3xl font-normal text-primary-200 mt-3">
              Giữ gìn cội nguồn — Lưu truyền thế hệ
            </span>
          </h1>

          <p class="text-lg text-primary-200/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Xây dựng, quản lý và chia sẻ cây gia phả dòng họ một cách trực quan.
            Kết nối quá khứ với hiện tại, gìn giữ truyền thống gia đình.
          </p>

          <div class="flex flex-wrap gap-4 justify-center">
            <!-- Single family line: direct link -->
            <NuxtLink
              v-if="isLoggedIn && familyLines?.length === 1"
              :to="`/tree/${familyLines[0].id}`"
              class="inline-flex items-center gap-2 bg-white text-primary-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Icon name="ph:tree-structure-bold" class="text-lg" />
              Xem gia phả
            </NuxtLink>

            <!-- Multiple family lines: dropdown -->
            <div v-else-if="isLoggedIn && familyLines?.length > 1" class="relative">
              <button
                @click="showFamilyPicker = !showFamilyPicker"
                class="inline-flex items-center gap-2 bg-white text-primary-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Icon name="ph:tree-structure-bold" class="text-lg" />
                Xem gia phả
                <Icon
                  name="ph:caret-down-bold"
                  class="text-sm transition-transform duration-200"
                  :class="showFamilyPicker ? 'rotate-180' : ''"
                />
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-2"
              >
                <div
                  v-if="showFamilyPicker"
                  class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                  <div class="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chọn dòng họ</p>
                  </div>
                  <div class="max-h-72 overflow-y-auto py-1">
                    <NuxtLink
                      v-for="(fl, i) in familyLines"
                      :key="fl.id"
                      :to="`/tree/${fl.id}`"
                      class="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors group"
                      @click="showFamilyPicker = false"
                    >
                      <div
                        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        :class="iconBgColors[i % iconBgColors.length]"
                      >
                        <Icon name="ph:tree-structure-bold" class="text-sm" :class="iconTextColors[i % iconTextColors.length]" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-700 transition-colors">{{ fl.name }}</p>
                        <p v-if="fl.originPlace" class="text-xs text-gray-400 truncate">{{ fl.originPlace }}</p>
                        <p v-else class="text-xs text-gray-400">{{ fl.memberCount }} thành viên</p>
                      </div>
                      <Icon name="ph:arrow-right-bold" class="text-gray-300 group-hover:text-primary-500 text-sm shrink-0 transition-colors" />
                    </NuxtLink>
                  </div>
                </div>
              </Transition>

              <!-- Click outside to close -->
              <Teleport to="body">
                <div v-if="showFamilyPicker" class="fixed inset-0 z-40" @click="showFamilyPicker = false" />
              </Teleport>
            </div>
            <NuxtLink
              v-if="canEdit"
              to="/admin"
              class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-7 py-3.5 rounded-xl font-semibold ring-1 ring-white/20 hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              <Icon name="ph:gear-bold" class="text-lg" />
              Quản trị
            </NuxtLink>
          </div>
        </div>

        <div v-if="isLoggedIn && familyLines?.length" class="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          <div class="text-center px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl ring-1 ring-white/10">
            <p class="text-2xl sm:text-3xl font-bold text-amber-300">{{ familyLines.length }}</p>
            <p class="text-sm text-primary-300 mt-1">Dòng họ</p>
          </div>
          <div class="text-center px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl ring-1 ring-white/10">
            <p class="text-2xl sm:text-3xl font-bold text-amber-300">{{ totalMembers }}</p>
            <p class="text-sm text-primary-300 mt-1">Thành viên</p>
          </div>
          <div class="hidden sm:block text-center px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl ring-1 ring-white/10">
            <p class="text-2xl sm:text-3xl font-bold text-amber-300">{{ maxGeneration }}</p>
            <p class="text-sm text-primary-300 mt-1">Thế hệ</p>
          </div>
        </div>
      </div>

      <!-- Wave separator -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
          <path d="M0 80V40C240 70 480 20 720 40C960 60 1200 10 1440 40V80H0Z" fill="#f9fafb" />
        </svg>
      </div>
    </section>

    <!-- Family Lines -->
    <section class="max-w-6xl mx-auto px-4 py-16 lg:py-20">
      <div class="text-center mb-12">
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Các dòng họ</h2>
        <p class="text-gray-500 mt-2 text-lg">Khám phá và tìm hiểu cội nguồn dòng họ</p>
      </div>

      <div v-if="!isLoggedIn" class="text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-2xl mx-auto mb-6">
          <Icon name="ph:lock-key-bold" class="text-primary-600 text-4xl" />
        </div>
        <p class="text-gray-500 mb-6 max-w-md mx-auto">
          Thông tin dòng họ chỉ hiển thị cho thành viên đã đăng nhập
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Icon name="ph:sign-in-bold" />
          Đăng nhập
        </NuxtLink>
      </div>

      <template v-else>
        <LoadingSpinner v-if="pending" />

        <div v-else-if="!familyLines?.length" class="text-center py-16">
          <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="ph:users-three" class="text-gray-300 text-4xl" />
          </div>
          <p class="text-gray-500 text-lg">Chưa có dòng họ nào được tạo</p>
          <NuxtLink v-if="canEdit" to="/admin/family-lines" class="btn-primary mt-4 inline-block">
            Tạo dòng họ đầu tiên
          </NuxtLink>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <NuxtLink
          v-for="(fl, index) in familyLines"
          :key="fl.id"
          :to="`/tree/${fl.id}`"
          class="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-2xl hover:shadow-primary-900/10 hover:border-primary-200 transition-all duration-300 hover:-translate-y-2"
        >
          <!-- Accent bar -->
          <div
            class="absolute top-0 left-6 right-6 h-1 rounded-b-full transition-all duration-300 group-hover:left-4 group-hover:right-4"
            :class="accentColors[index % accentColors.length]"
          />

          <div class="flex items-start gap-4 mt-2">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
              :class="iconBgColors[index % iconBgColors.length]"
            >
              <Icon name="ph:tree-structure-bold" :class="iconTextColors[index % iconTextColors.length]" class="text-xl" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 text-lg group-hover:text-primary-700 transition-colors">
                {{ fl.name }}
              </h3>
              <p v-if="fl.originPlace" class="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Icon name="ph:map-pin-fill" class="text-primary-400 shrink-0" />
                {{ fl.originPlace }}
              </p>
            </div>
          </div>

          <p v-if="fl.description" class="text-sm text-gray-500 mt-4 line-clamp-2 leading-relaxed">
            {{ fl.description }}
          </p>

          <div class="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
            <span class="text-sm font-medium text-gray-500">
              <Icon name="ph:users-bold" class="mr-1" />{{ fl.memberCount }} thành viên
            </span>
            <span class="text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0 flex items-center gap-1">
              Xem cây
              <Icon name="ph:arrow-right-bold" />
            </span>
          </div>
        </NuxtLink>
        </div>
      </template>
    </section>



    <!-- Latest News -->
    <section v-if="latestNews.length" class="py-16 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Tin tức mới nhất</h2>
            <p class="text-gray-500 mt-1">Cập nhật tin tức về dòng họ</p>
          </div>
          <NuxtLink v-if="latestNews.length" to="/news" class="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors">
            Xem tất cả <Icon name="ph:arrow-right" />
          </NuxtLink>
        </div>
        <div v-if="latestNews.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="post in latestNews"
            :key="post.id"
            :to="`/news/${post.slug}`"
            class="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
              <img
                v-if="post.coverImage"
                :src="post.coverImage"
                :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="ph:newspaper" class="text-blue-200 text-5xl" />
              </div>
              <div class="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                Tin tức
              </div>
            </div>
            <div class="p-5">
              <p class="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Icon name="ph:clock" class="text-[10px]" />
                {{ formatDate(post.createdAt) }}
              </p>
              <h3 class="font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2 text-base">
                {{ post.title }}
              </h3>
              <p v-if="post.excerpt" class="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {{ post.excerpt }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section v-if="upcomingEvents.length" class="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Sự kiện sắp diễn ra</h2>
            <p class="text-gray-500 mt-1">Các hoạt động và sự kiện của dòng họ</p>
          </div>
          <NuxtLink v-if="upcomingEvents.length" to="/events" class="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors">
            Xem tất cả <Icon name="ph:arrow-right" />
          </NuxtLink>
        </div>
        <div v-if="upcomingEvents.length" class="space-y-4">
          <NuxtLink
            v-for="post in upcomingEvents"
            :key="post.id"
            :to="`/events/${post.slug}`"
            class="flex items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200 group-hover:shadow-xl group-hover:shadow-purple-300 transition-all">
              <span class="text-[10px] font-bold text-purple-100 uppercase tracking-wide">
                {{ post.eventDate ? new Date(post.eventDate).toLocaleDateString('vi-VN', { month: 'short' }) : 'TBD' }}
              </span>
              <span class="text-2xl sm:text-3xl font-black text-white leading-none mt-0.5">
                {{ post.eventDate ? new Date(post.eventDate).getDate() : '?' }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1.5">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  <Icon name="ph:calendar-bold" class="text-[10px]" />Sự kiện
                </span>
                <span v-if="post.eventPlace" class="text-xs text-gray-500 flex items-center gap-1">
                  <Icon name="ph:map-pin-fill" class="text-purple-400" />
                  {{ post.eventPlace }}
                </span>
              </div>
              <h3 class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 text-base sm:text-lg">
                {{ post.title }}
              </h3>
              <p v-if="post.excerpt" class="text-sm text-gray-500 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                {{ post.excerpt }}
              </p>
            </div>
            <Icon name="ph:arrow-right-bold" class="hidden sm:block text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0 text-xl" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section v-if="!isLoggedIn" class="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-20">
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-400 rounded-full blur-3xl" />
      </div>
      
      <div class="relative max-w-4xl mx-auto px-4 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 ring-1 ring-white/20">
          <Icon name="ph:user-circle-plus-bold" class="text-amber-300 text-3xl" />
        </div>
        <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
          Bắt đầu xây dựng gia phả của bạn
        </h2>
        <p class="text-lg text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Đăng nhập để quản lý và chỉnh sửa cây gia phả, kết nối với dòng họ và gìn giữ truyền thống gia đình
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 bg-white text-primary-900 px-10 py-4 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-1 text-lg"
        >
          <Icon name="ph:sign-in-bold" class="text-xl" />
          Đăng nhập ngay
        </NuxtLink>
      </div>
    </section>

        <!-- Features -->
        <section class="bg-gradient-to-b from-white to-gray-50 py-16 lg:py-24 border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900">Tính năng nổi bật</h2>
          <p class="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">Mọi thứ bạn cần để quản lý và lưu giữ gia phả dòng họ một cách hiện đại</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div v-for="feature in features" :key="feature.title" class="group text-center">
            <div class="relative">
              <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 shadow-lg group-hover:shadow-xl"
                :class="feature.bgColor"
              >
                <Icon :name="feature.icon" class="text-2xl transition-transform group-hover:scale-110" :class="feature.iconColor" />
              </div>
              <div class="absolute inset-0 w-16 h-16 mx-auto rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" :class="feature.bgColor" />
            </div>
            <h3 class="font-bold text-gray-900 text-base mb-2 group-hover:text-primary-600 transition-colors">{{ feature.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, canEdit } = useAuth()
const route = useRoute()
const router = useRouter()

const showNoAccessBanner = ref(false)
const showNoAccessPopup = ref(false)

onMounted(() => {
  if (route.query.noAccess === 'admin') {
    sessionStorage.setItem('noAccessBanner', '1')
    showNoAccessPopup.value = true
    router.replace({ path: '/', query: {} })
  }
  if (sessionStorage.getItem('noAccessBanner')) {
    showNoAccessBanner.value = true
  }
})

watch(isLoggedIn, (val) => {
  if (!val) {
    showNoAccessBanner.value = false
    showNoAccessPopup.value = false
  }
})

const showFamilyPicker = ref(false)

// Chỉ fetch family lines khi đã login, client-side only để cookie được gửi đúng
const { data: familyLines, pending } = isLoggedIn.value
  ? useLazyFetch<any[]>('/api/family-lines', { server: false })
  : { data: ref([]), pending: ref(false) }

// Lazy load để không block SSR
const { data: newsData } = await useLazyFetch<any>('/api/posts', {
  query: { type: 'news', published: 'true', limit: 3 },
  server: false, // Client-side only
})
const latestNews = computed(() => newsData.value?.items || [])

const { data: eventsData } = await useLazyFetch<any>('/api/posts', {
  query: { type: 'event', published: 'true', limit: 3 },
  server: false, // Client-side only
})
const upcomingEvents = computed(() => eventsData.value?.items || [])

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const totalMembers = computed(() =>
  familyLines.value?.reduce((sum, fl) => sum + (fl.memberCount || 0), 0) || 0
)

const maxGeneration = computed(() => {
  if (!familyLines.value?.length) return 0
  return Math.max(...familyLines.value.map((fl: any) => fl.maxGeneration || 0), 0)
})

const accentColors = [
  'bg-primary-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
]

const iconBgColors = [
  'bg-primary-100',
  'bg-blue-100',
  'bg-emerald-100',
  'bg-violet-100',
  'bg-amber-100',
  'bg-rose-100',
]

const iconTextColors = [
  'text-primary-600',
  'text-blue-600',
  'text-emerald-600',
  'text-violet-600',
  'text-amber-600',
  'text-rose-600',
]

const features = [
  {
    icon: 'ph:tree-structure-bold',
    title: 'Cây trực quan',
    desc: 'Hiển thị gia phả dạng cây tương tác, hỗ trợ xem dọc và ngang, thu phóng linh hoạt',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: 'ph:user-circle-plus-bold',
    title: 'Quản lý thành viên',
    desc: 'Thêm, sửa thành viên với đầy đủ thông tin: ngày sinh, quê quán, tiểu sử, ảnh đại diện',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    icon: 'ph:heart-bold',
    title: 'Quan hệ gia đình',
    desc: 'Quản lý quan hệ cha-con, vợ-chồng. Tìm mối quan hệ giữa hai thành viên bất kỳ',
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: 'ph:flower',
    title: 'Ngày giỗ âm lịch',
    desc: 'Ghi nhận và nhắc nhở ngày giỗ theo âm lịch, không bỏ sót ngày quan trọng',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: 'ph:images-bold',
    title: 'Album ảnh',
    desc: 'Lưu trữ ảnh đại diện và album ảnh kỷ niệm cho từng thành viên trong gia phả',
    bgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    icon: 'ph:share-network-bold',
    title: 'Chia sẻ gia phả',
    desc: 'Tạo link chia sẻ công khai có mật khẩu bảo vệ để người thân cùng xem',
    bgColor: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    icon: 'ph:users-three-bold',
    title: 'Phân quyền',
    desc: 'Hệ thống 3 vai trò: Admin, Editor, Viewer. Phân quyền xem theo từng dòng họ',
    bgColor: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    icon: 'ph:database-bold',
    title: 'Sao lưu & Xuất dữ liệu',
    desc: 'Xuất JSON, Excel. Nhập dữ liệu và khôi phục từ bản sao lưu',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-leave-active {
  transition: all 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
