<template>
  <v-sheet 
    class="w-100 bg-blanc rounded-lg elevation-1"
  >
    <component :is="composantSelec" />
  </v-sheet>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'nav'
})

const composants: Record<string, ReturnType<typeof resolveComponent>> = {
  Produits: resolveComponent('Produits'),
  Paniers: resolveComponent('Paniers'),
  Type_produits: resolveComponent('Type_produits'),
  Adherents: resolveComponent('Adherents'),
  Commandes: resolveComponent('Commandes'),
  Participations: resolveComponent('Participations'),
  Creneaux: resolveComponent('Creneaux'),
  Calendrier: resolveComponent('Calendrier'),
  GestionStock: resolveComponent('GestionStock'),
}

const composantSelec = computed(() => 
  composants[pageActive.value]
)


const { 
    pageActive
  } = useNav()
</script>