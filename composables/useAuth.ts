interface User {
  id: number
  username: string
  fullName: string
  role: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const canEdit = computed(() => user.value?.role === 'admin' || user.value?.role === 'editor')

  async function login(username: string, password: string) {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = data.user
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  async function fetchUser() {
    try {
      const headers: Record<string, string> = {}

      // Forward cookies when running on server (SSR)
      if (import.meta.server) {
        const event = useRequestEvent()
        const cookie = event?.node?.req?.headers?.cookie
        if (cookie) {
          headers.cookie = cookie
        }
      }

      const data = await $fetch('/api/auth/me', { headers })
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  return { user, isLoggedIn, isAdmin, canEdit, login, logout, fetchUser }
}
