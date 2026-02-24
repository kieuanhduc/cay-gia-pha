interface User {
  id: number
  username: string
  fullName: string
  role: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  // Tracks whether auth state has been initialized (server→client hydrated)
  const authInitialized = useState<boolean>('auth-initialized', () => false)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const canEdit = computed(() => user.value?.role === 'admin' || user.value?.role === 'editor')

  async function login(username: string, password: string) {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = data.user
    authInitialized.value = true
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    authInitialized.value = false
    sessionStorage.removeItem('noAccessBanner')
    navigateTo('/')
  }

  async function fetchUser() {
    // On client-side: skip only if user is already loaded.
    // Do NOT skip when user is null — it could mean we just returned from
    // Google OAuth (cookie set but Vue state not yet updated).
    if (import.meta.client && user.value) return

    try {
      if (import.meta.server) {
        const $api = useRequestFetch()
        const data = await $api('/api/auth/me') as any
        user.value = data.user
      } else {
        const data = await $fetch('/api/auth/me') as any
        user.value = data.user
      }
    } catch {
      user.value = null
    } finally {
      authInitialized.value = true
    }
  }

  return { user, isLoggedIn, isAdmin, canEdit, login, logout, fetchUser }
}
