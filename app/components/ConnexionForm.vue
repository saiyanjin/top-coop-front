<template>
  <div style="max-width: 420px;" class="mx-auto w-100">
    
    <h2 class="text-center text-orange">
      Connexion au <br>
      <span class="d-flex align-center justify-center ga-2">
        <v-icon icon="mdi-view-dashboard-outline"></v-icon>Dashboard Top'Coop
      </span>
    </h2>

    <v-form ref="formRef" class="mt-10" v-model="isFormValid" @submit.prevent="Authentification">
      <v-text-field
        v-model="email"
        label="Adresse email"
        type="email"
        variant="outlined"
        density="comfortable"
        color="vertFonce"
        prepend-inner-icon="mdi-email-outline"
        :rules="emailRules"
        required
        rounded="lg"
        class="mb-3"
      ></v-text-field>

      <v-text-field
        v-model="password"
        label="Mot de passe"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        density="comfortable"
        color="vertFonce"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        @click:append-inner="showPassword = !showPassword"
        :rules="passwordRules"
        required
        rounded="lg"
        class="mb-6"
      ></v-text-field>

      <v-btn
        type="submit"
        color="orange"
        size="large"
        block
        rounded="lg"
        :loading="isSubmitting"
        :disabled="!isFormValid"
        class="text-text font-weight-bold"
        elevation="1"
      >
        Connexion
      </v-btn>
    </v-form>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToken } from '~/composables/useToken'

const isFormValid = ref(false)
const isSubmitting = ref(false)
const showPassword = ref(false)
const email = ref('')
const password = ref('')

// ---------- les règles ----------
const emailRules = [
  (v: string) => !!v || "L'adresse email est requise.",
  (v: string) => /.+@.+\..+/.test(v) || "L'adresse email doit être valide."
]

const passwordRules = [
  (v: string) => !!v || 'Le mot de passe est requis.',
]



const Authentification = async () => {
  if (!isFormValid) {
    return 
  }
  isSubmitting.value = true

  try {
      let data;
      data = await $fetch<{access_token: string}>('http://localhost:3002/auth/login', {
      body: {email : email.value, motDePasse : password.value},
      method : "POST"
    })
    
    console.log(data)

    if (data && data.access_token) {
      useToken().setToken(data.access_token)
      await navigateTo("/")
    } else {
      console.log(data)
    }

  } catch (error:any) {
    console.error("Erreur API Nest :", error.message)
  } finally {
    isSubmitting.value = false
  }

}
</script>