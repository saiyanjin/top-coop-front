<template>
  <v-row class="fill-height ma-0 d-flex align-center justify-center">
    <v-col cols="12" sm="10" md="8" lg="6" class="d-flex justify-center">
      
      <v-container 
        class="rounded-xl elevation-1 bg-white pa-8 pa-sm-15"
        max-width="600"
      >
        <connexion-form />
      </v-container>

    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import ConnexionForm from '~/components/ConnexionForm.vue';

definePageMeta({
  layout: 'login'
})
</script>