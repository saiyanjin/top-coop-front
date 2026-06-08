<template class=" d-flex justify-center">
  <v-container 
    class="rounded-xl elevation-1 bg-white pa-15"
    max-width="600"
    min-width="400"
  >
    <connexion-form />
  </v-container>
</template>

<script setup lang="ts">
import ConnexionForm from '~/components/ConnexionForm.vue';

definePageMeta({
  layout: 'login'
})
</script>