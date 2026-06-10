<template>
  <v-sheet 
    class="w-100 bg-blanc rounded-lg elevation-1" 
    height="calc(100vh - 128px)" 
  >
  
    <!-- <Calendrier class=""/> -->
    <!-- <Adherents class=""/> -->
    <!-- <produits /> -->
    <Participations />
  </v-sheet>
</template>

<script setup lang="ts">
import Participations from '~/components/Participations.vue';
import Produits from '~/components/Produits.vue';

definePageMeta({
  layout: 'nav'
})
</script>