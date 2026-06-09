<template>
  <div>
    <v-app-bar class="bg-vertFonce border-b-sm border-vertClair pe-5" elevation="0" height="80">
      <v-btn @click.stop="drawer = !drawer" :icon="drawer ? 'mdi-menu-open' : 'mdi-menu-close'"/>
      <span class="mr-15">Menu</span>

      <div class="ml-15 d-flex align-center">
        <div class="d-flex align-center text-white ml-14">
          <img src="/images/Logo_TopCoop.svg" alt="Logo TopCoop" class="mr-2" width="140" />
        </div>

        <v-btn-toggle
          v-model="activeTopTab"
          variant="text"
          class="h-100 align-center rounded-0"
          @update:model-value="onTopTabChange"
        >
          <v-btn value="calendrier" prepend-icon="mdi-calendar-month-outline" class="custom-nav-btn text-white mx-8 text-title-medium pa-3 rounded-lg">
            Calendrier
          </v-btn>
          <v-btn value="commandes" prepend-icon="mdi-file-document-outline" class="custom-nav-btn text-white text-title-medium pa-3 rounded-lg">
            Gestion des stocks
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-spacer></v-spacer>

      <v-btn @click="toggleTheme" :icon="isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" />
      <v-btn icon="mdi-logout" variant="text" class="text-white" @click="logout"></v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      class="bg-vertFonce border-0"
      width="260"
      permanent
    >
      <div class="position-sticky top-0 pt-4 pb-2 w-100 bg-vertFonce z-index-2">
        <v-text-field
          v-model="schemaSearch"
          prepend-inner-icon="mdi-magnify"
          label="Rechercher une entité"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          color="vertClair"
          base-color="vertClair"
          class="mx-3 text-white"
        />
      </div>

      <v-list 
        v-model:selected="selectedLeftItem" 
        active-class="bg-vertClair text-SlightlyDark"
        class="bg-transparent"
        @update:selected="onLeftItemChange"
      >
        <v-list-item
          v-for="item in filteredItems"
          :key="item.value"
          :title="item.title"
          :value="item.value"
          prepend-icon="mdi-database"
          class="smooth-item mb-1 text-white"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-fond min-vh-100">
      <div class="pa-6 h-100">
        <NuxtPage />
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
const {
  isDark,
  toggleTheme,
  drawer,
  schemaSearch,
  activeTopTab,
  selectedLeftItem,
  filteredItems,
  onTopTabChange,
  onLeftItemChange,
  logout
} = useNav()
</script>

<style scoped>
.custom-nav-btn {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.smooth-item { 
  transition: background-color 0.25s ease-in-out, color 0.25s ease-in-out !important; 
}
.smooth-item :deep(.v-list-item__prepend .v-icon) { 
  opacity: 1 !important; 
}
:deep(.v-list-item--active .v-list-item__prepend .v-icon) { 
  color: #3C3C3C !important; 
}
</style>