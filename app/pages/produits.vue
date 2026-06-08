<template>
  <v-sheet 
    class="w-100 bg-blanc rounded-lg elevation-1 d-flex"
    height="calc(100vh - 112px)"
  >
    <Produits class="flex-grow-1"/>
  </v-sheet>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'nav'
})
</script>