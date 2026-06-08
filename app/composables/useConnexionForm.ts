import { ref } from 'vue'
import { API_ROUTES } from '~/constants/api'
import { useToken } from '~/composables/useToken'

export const useConnexionForm = () => {
  const config = useRuntimeConfig()
  const routes = API_ROUTES(config.public.apiBase)
  
  // ---------- États réactifs ----------
  const isFormValid = ref(false)
  const isSubmitting = ref(false)
  const showPassword = ref(false)
  const email = ref('')
  const password = ref('')

  // ---------- Règles de validation ----------
  // const emailRules = [
  //   (v: string) => !!v || "L'adresse email est requise.",
  //   (v: string) => /.+@.+\..+/.test(v) || "L'adresse email doit être valide."
  // ]

  // const passwordRules = [
  //   (v: string) => !!v || 'Le mot de passe est requis.',
  // ]

  // ---------- Logique d'authentification ----------
  const authentification = async () => {
    if (!isFormValid.value) return 

    isSubmitting.value = true

    try {
      const data = await $fetch<{ access_token: string }>(routes.NEST_LOGIN, {
        body: { email: email.value, motDePasse: password.value },
        method: "POST"
      })

      if (data?.access_token) {
        useToken().setToken(data.access_token)
        await navigateTo("/")
      } else {
        console.log("Structure de réponse inattendue :", data)
      }

    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    email,
    password,
    isFormValid,
    isSubmitting,
    showPassword,
    // emailRules,
    // passwordRules,
    authentification
  }
}