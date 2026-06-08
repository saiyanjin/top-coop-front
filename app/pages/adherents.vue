<template>
  <v-sheet 
    class="w-100 bg-white rounded-lg elevation-1"
    height="calc(100vh - 112px)"
  >
    <Adherents class="flex-grow-1"/>
  </v-sheet>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'nav'
})
</script>