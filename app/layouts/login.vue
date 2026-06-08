<template>
  <div>
    <v-app-bar class="bg-vertFonce border-b-sm border-vertClair px-5" elevation="0" height="80">

      <div class="d-flex align-center">
        <div class="d-flex align-center text-white">
          <img src="/images/Logo_TopCoop.svg" alt="Logo TopCoop" width="150" />
        </div>
      </div>

      <v-spacer></v-spacer>

      <v-btn class="" @click="toggleTheme" :icon="isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" />
    </v-app-bar>

    <v-main class="bg-fond h-screen">
      <div class="pa-6">
        <NuxtPage />
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')
function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>