<template>
  <v-tabs v-model="tab" color="vertFonce" class="rounded-ts-lg">
    <v-tab value="restock">Restock</v-tab>
    <v-tab value="catalogue">Catalogue</v-tab>
  </v-tabs>

  <v-divider></v-divider>

  <v-tabs-window v-model="tab">
    <v-tabs-window-item value="restock">
      <v-sheet
        height="calc(100vh - 200px)"
        class="px-15 py-5 overflow-hidden d-flex flex-column bg-transparent"
      >
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
                    :min="0"
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
                    :min="0"
                  />

                  <!-- INPUT SI C'EST VRAC OU UNITE -->

                </div>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row v-else justify="center" class="mt-5">
            <v-col cols="12" class="text-center text-grey text-body-1">
              Aucun participant ne correspond à votre recherche.
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
          >
            Valider la commande
          </v-btn>
        </div>
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
      </v-sheet>
    </v-tabs-window-item>

    <v-tabs-window-item value="catalogue">
      <v-sheet
        height="calc(100vh - 200px)"
        class="pa-5 overflow-hidden d-flex flex-column"
      >
      </v-sheet>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup lang="ts">
const { 
  tab, 
  searchQuery, 
  currentPage, 
  totalPages, 
  paginatedProduit,
  resetQuantite,
} = useGestionStock();
</script>
