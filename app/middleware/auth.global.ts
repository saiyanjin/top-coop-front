import { useToken } from '~/composables/useToken'

export default defineNuxtRouteMiddleware((to) => {
  const { getToken } = useToken()
  const token = getToken()

  if (!token && to.path !== '/connexion') {
    return navigateTo('/connexion')
  }

  if (token && to.path === '/connexion') {
    return navigateTo('/')
  }
})