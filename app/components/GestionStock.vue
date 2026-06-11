<template>
      <v-sheet
        class="px-15 py-10 overflow-hidden d-flex flex-column bg-transparent h-100"
      >
      <div class="d-flex align-center text-title-large text-orange font-weight-bold">
        <v-icon icon="mdi-archive-outline" class="mr-2"></v-icon>
        <span>Gestion des stocks</span>
      </div>
        <div class="d-flex my-10">
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

        <v-sheet class="flex-grow-1 overflow-y-auto bg-transparent mb-4">
          <v-row v-if="paginatedProduit.length > 0">
            <v-col
              v-for="(produit, index) in paginatedProduit"
              :key="index"
              cols="12"
              lg="6"
            >
              <v-sheet
                class="d-flex align-center justify-space-between  px-4 py-3 rounded-lg border-md border-gris"
                :class="(index + 1) % 4 < 2 ? 'bg-vertClair' : 'bg-vertClair60'"
                elevation="0"
              >
                <span class="text-subtitle-1 font-weight-bold text-black">
                  {{ produit.typeProduit.nom }}
                </span>

                <!-- <span class="text-body-2 text-grey-darken-3">
                  Quantité :
                  <strong class="text-black">{{ produit.quantite }}</strong>
                </span> -->

                <div class="d-flex align-center ga-2">
                    <v-btn
                      icon="mdi-reload"
                      @click="resetQuantite(produit)"
                      variant="text"
                      class="bg-transparent"
                    />

                  <!-- INPUT SI C'EST VRAC OU UNITE -->

                  <v-number-input
                    v-if="produit.typeProduit.unite == 'VRAC'"
                    label="Quantité en vrac"
                    v-model="produit.quantite"
                    variant="outlined"
                    control-variant="split"
                    inset
                    density="comfortable"
                    hide-details
                    :min="produit.quantiteInitiale"
                    :precision="2"
                    min-width="175"
                  />

                  <v-number-input
                    v-if="produit.typeProduit.unite == 'UNITE'"
                    label="Quantité à l'unité"
                    v-model="produit.quantite"
                    variant="outlined"
                    control-variant="split"
                    inset
                    density="comfortable"
                    hide-details
                    :min="produit.quantiteInitiale"
                    min-width="175"
                  />

                  <!-- INPUT SI C'EST VRAC OU UNITE -->

                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row v-else justify="center" class="mt-5">
            <v-col cols="12" class="text-center text-grey text-body-1">
              Aucun produit ne correspond à votre recherche.
            </v-col>
          </v-row>
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
          title="Récapitulatif du restockage"
          submit-text="Confirmer le restockage"
          cancel-text="Annuler"
          @cancel="isModalOpen = false"
          @submit="submitRestock"
        >
          <v-list density="compact" class="bg-transparent">
            <v-list-item v-for="p in modifiedProduits" :key="p.id" class="px-0">
              <div class="d-flex justify-space-between w-100 align-center">
                <span class="font-weight-bold">{{ p.typeProduit.nom }}</span>
                <div class="text-body-2">
                  <span class="text-grey">Ancien : {{ p.quantiteInitiale }}</span>
                  <v-icon icon="mdi-arrow-right" size="small" class="mx-2" color="orange"></v-icon>
                  <span class="text-orange font-weight-bold">Nouveau : {{ p.quantite }}</span>
                </div>
              </div>
              <v-divider class="mt-2"></v-divider>
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
  totalModifies
} = useGestionStock();
</script>
