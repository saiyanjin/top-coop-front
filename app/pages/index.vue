<template>
  <v-sheet 
    class="w-100 bg-white rounded-lg elevation-1"
    height="calc(100vh - 112px)"
  >
    <Calendrier />
  </v-sheet>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'nav'
})
</script>