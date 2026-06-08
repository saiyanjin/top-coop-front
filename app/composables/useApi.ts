// composables/useApi.ts

import { useToken } from './useToken'

export const useApi = (url: string, options: any = {}) => {
  const { getToken } = useToken()
  const token = getToken()
  return useFetch(url, {
    baseURL: useRuntimeConfig().public.apiBase,
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}