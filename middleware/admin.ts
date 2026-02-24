export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser, isAdmin } = useAuth()


  await fetchUser()

  if (!user.value) {
    return navigateTo('/login', { redirectCode: 302 })
  }

  if (!isAdmin.value) {
    return navigateTo({ path: '/', query: { noAccess: 'admin' } }, { redirectCode: 302 })
  }
})
