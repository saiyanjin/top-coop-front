<template>
  <v-sheet 
    class="w-100 bg-white rounded-lg elevation-1 d-flex flex-column overflow-hidden"
    height="calc(100vh - 112px)"
  >
    <Calendrier class="flex-grow-1 overflow-hidden"/>
  </v-sheet>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'nav'
})
</script>