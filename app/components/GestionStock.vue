<template>
      <v-sheet
        class="px-15 py-10 overflow-hidden d-flex flex-column bg-transparent h-100"
      >
      <div class="d-flex align-center pa-1 text-title-large text-orange font-weight-bold">
        <v-icon icon="mdi-archive-outline" class="mr-2"></v-icon>
        <span>Gestion des stocks</span>
      </div>
        <div class="d-flex pa-1 my-10">
          <v-text-field
            v-model="searchQuery"
            label="Rechercher..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="vertFonce"
            hide-details
            clearable
            max-width="400"
          ></v-text-field>
        </div>

        <v-sheet class="flex-grow-1 overflow-y-auto bg-transparent pa-1 pb-4 rounded-lg">
          <v-row v-if="paginatedProduit.length > 0">
            <v-col
              v-for="(produit, index) in paginatedProduit"
              :key="produit.typeProduitId"
              cols="12"
              lg="6"
            >
              <v-sheet
                class="d-flex align-center justify-space-between px-4 py-3 rounded-lg border-md border-gris"
                elevation="1"
                :class="(index + 1) % 2 == 0 ? 'bg-transparent' : 'bg-transparent'"
              >
                <div class="d-flex flex-column text-body-1 font-weight-bold text-vertFonce">
                  <span>{{ produit.typeProduit.nom }}</span>
                  <span class="text-caption text-grey-darken-1 font-weight-medium">
                    Stock actuel : {{ produit.quantiteEnStock }} <span v-if="produit.typeProduit.unite == 'VRAC'">kg</span> en stock
                  </span>
                </div>

                <div class="d-flex align-center ga-4">
                  <v-number-input
                    v-if="produit.typeProduit.unite == 'VRAC'"
                    label="Ajouter (kg)"
                    v-model.number="produit.quantiteAAjouter"
                    variant="outlined"
                    control-variant="split"
                    inset
                    density="comfortable"
                    hide-details
                    :min="0"
                    :precision="2"
                    min-width="175"
                  />

                  <v-number-input
                    v-if="produit.typeProduit.unite == 'UNITE'"
                    label="Ajouter"
                    v-model.number="produit.quantiteAAjouter"
                    variant="outlined"
                    control-variant="split"
                    inset
                    density="comfortable"
                    hide-details
                    :min="0"
                    min-width="175"
                  />

                  <v-btn
                    icon="mdi-refresh"
                    variant="text"
                    color="orange"
                    size="small"
                    :disabled="produit.quantiteAAjouter === 0"
                    @click="resetQuantite(produit)"
                  />
                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <div v-else class="text-center text-grey py-10">
            Aucun produit trouvé.
          </div>
        </v-sheet>

        <div class="d-flex align-center justify-end">
          <v-btn
            color="orange"
            size="x-large"
            rounded="lg"
            class="mb-4"
            elevation="1"
            density="comfortable"
            :disabled="modifiedProduits.length === 0"
            @click="isModalOpen = true"
          >
            Valider le restockage ({{ modifiedProduits.length }})
          </v-btn>
        </div>

        <BaseModal
          v-model="isModalOpen"
          title="Récapitulatif du Restockage"
          cancelText="Annuler"
          submitText="Confirmer"
          maxWidth="600"
          @cancel="isModalOpen = false"
          @submit="submitRestock"
        >
          <v-list v-if="modifiedProduits.length > 0" class="bg-transparent">
            <v-list-item v-for="p in modifiedProduits" :key="p.typeProduitId" class="px-0">
              <div class="d-flex justify-space-between align-center w-100 text-body-1 text-vertFonce">
                <span class="font-weight-medium">{{ p.typeProduit.nom }}</span>
                <span class="font-weight-bold text-orange">
                  +{{ p.quantiteAAjouter }} {{ p.typeProduit.unite.toLowerCase() }}
                </span>
              </div>
            </v-list-item>
          </v-list>
          <div v-if="modifiedProduits.length === 0" class="text-center py-4">
            Aucune modification détectée.
          </div>
        </BaseModal>

        <v-divider></v-divider>

        <div
          class="d-flex align-center justify-end flex-shrink-0 pt-3 ga-2 pa-0 text-body-2"
        >
          <span>Page {{ currentPage }} sur {{ totalPages }}</span>

          <v-btn
            icon="mdi-chevron-double-left"
            variant="text"
            size="small"
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          />

          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            size="small"
            :disabled="currentPage === 1"
            @click="currentPage--"
          />

          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            size="small"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />

          <v-btn
            icon="mdi-chevron-double-right"
            variant="text"
            size="small"
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          />
        </div>
        <v-snackbar
          v-model="snackbarShow"
          timer-color="vertFonce"
          timer="top"
          location="bottom right"
          rounded="lg"
          color="white"
        >
          <span v-html="snackbarText"></span>

          <template v-slot:actions>
            <v-btn
              variant="text"
              icon="mdi-close"
              @click="snackbarShow = false"
            />
          </template>
        </v-snackbar>
      </v-sheet>
</template>

<script setup lang="ts">
const { 
  searchQuery, 
  currentPage, 
  totalPages, 
  paginatedProduit,
  modifiedProduits,
  isModalOpen,
  resetQuantite,
  submitRestock,
  snackbarShow,
  snackbarText,
} = useGestionStock();
</script>
