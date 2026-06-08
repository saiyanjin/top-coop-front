<template>
  <div style="max-width: 420px;" class="mx-auto w-100">
    
    <h2 class="text-center text-orange">
      Connexion au <br>
      <span class="d-flex align-center justify-center ga-2">
        <v-icon icon="mdi-view-dashboard-outline"></v-icon>Dashboard Top'Coop
      </span>
    </h2>

    <v-form ref="formRef" class="mt-10" v-model="isFormValid" @submit.prevent="authentification">
      <v-text-field
        v-model="email"
        label="Adresse email"
        type="email"
        variant="outlined"
        density="comfortable"
        color="vertFonce"
        prepend-inner-icon="mdi-email-outline"
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
const {
  email,
  password,
  isFormValid,
  isSubmitting,
  showPassword,
  // emailRules,
  // passwordRules,
  authentification
} = useConnexionForm()
</script>