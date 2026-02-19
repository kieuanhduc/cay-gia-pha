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
    navigateTo('/')
  }

  async function fetchUser() {
    try {
    
      if (import.meta.server) {
        const $api = useRequestFetch()
        const data = await $api('/api/auth/me') as any
        user.value = data.user
      } else {
        const data = await $fetch('/api/auth/me')
        user.value = data.user
      }
    } catch {
      user.value = null
    }
  }

  return { user, isLoggedIn, isAdmin, canEdit, login, logout, fetchUser }
}
