// composables/useToken.ts
export const useToken = () => {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: true,
  })
  return {
    getToken: () => token.value,
    setToken: (value: string | null) => { token.value = value },
  }
}