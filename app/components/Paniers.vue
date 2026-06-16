<template>
    <div class="pa-10">
      <div class="d-flex align-center text-title-large text-orange font-weight-bold mb-6">
        <v-icon icon="mdi-database" class="mr-2"></v-icon>
        <span>Paniers</span>
      </div>

      <v-sheet class="overflow-hidden">
        <v-data-table
          :headers="headers"
          :items="recherchePaniers"
          :search="schemaSearch"
          :hide-default-footer="paniers.length < 11"
          sort-asc-icon="mdi-sort-ascending"
          sort-desc-icon="mdi-sort-descending"
          sort-icon="mdi-swap-vertical"
          hover
        >
        <template v-slot:top>
          <v-toolbar flat class="bg-blanc">
            <v-text-field
              v-model="schemaSearch"
              prepend-inner-icon="mdi-magnify"
              label="Rechercher..."
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              color="vertFonce"
              max-width="400"
              rounded="lg"
            />
            <!-- <v-spacer></v-spacer>
            <v-btn
              class="bg-vertFonce text-white font-weight-bold"
              size="large"
              prepend-icon="mdi-plus"
              rounded="lg"
              variant="flat"
              @click="add"
            >
              Ajouter un panier
            </v-btn> -->
          </v-toolbar>
        </template>

        <template v-slot:item.dateCreation="{ value }">
          {{ formatDateAffichage(value) }}
        </template>

        <template v-slot:item.nomDesProduits="{ item }">
          {{ item.nomDesProduits }}
        </template>

        <template v-slot:item.prix="{ item }">
          {{ item.prix.toFixed(2) }} €
        </template>

        <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
          <v-btn
            :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            :text="isExpanded(internalItem) ? 'Fermer' : 'Voir les produits'"
            class="text-vertFonce"
            density="comfortable"
            variant="text"
            @click="toggleExpand(internalItem)"
          ></v-btn>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="py-2">
              <v-sheet rounded="lg">
                <div v-html="formatProduitPanier(item.produitPaniers)"></div>
                <!-- <v-list lines="one">
                  <v-list-item
                    v-for="elem in item.produitPaniers.length"
                    :key="elem"
                    :title="formatProduitPanier(item.produitPaniers) + elem"
                    subtitle="test"
                  ></v-list-item>
                </v-list> -->
              </v-sheet>
            </td>
          </tr>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-3 justify-end">
            <v-icon
              color="vertFonce"
              icon="mdi-pencil"
              class="cursor-pointer"
              @click="edit(item)"
            ></v-icon>
            <v-icon
              color="orange"
              icon="mdi-delete"
              class="cursor-pointer"
              @click="remove(item)"
            ></v-icon>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="pa-4 text-center">
            <p class="mb-4 text-grey">Aucun panier trouvé.</p>
            <v-btn
              prepend-icon="mdi-backup-restore"
              rounded="lg"
              text="Réinitialiser les données"
              variant="outlined"
              color="vertFonce"
              @click="reset"
            ></v-btn>
          </div>
        </template>
      </v-data-table>

    </v-sheet>

    <BaseModal
      v-model="dialog"
      :title="isEditing ? 'Modifier le panier' : 'Ajouter un panier'"
      :submit-text="isEditing ? 'Modifier' : 'Ajouter'"
      @cancel="fermerDialog"
      @submit="save"
    >
      <v-form class="d-flex flex-column">
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              v-model="formModel.utilisateurId"
              label="Utilisateur"
              :items="adherentsOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <div class="text-subtitle-2 text-vertFonce font-weight-bold mb-4">
              Contenu du panier
            </div>

            <div
              v-for="(pp, index) in produitsEnEdition"
              :key="pp.id ?? `nouveau-${index}`"
              class="d-flex align-center ga-2 mb-2"
            >
              <div class="flex-grow-1 font-weight-medium">
                {{ pp.produit.typeProduit.nom }}
              </div>
              <v-number-input
                v-model="pp.quantite"
                label="Quantité"
                :min="1"
                :step="1"
                control-variant="split"
                variant="outlined"
                rounded="lg"
                color="vertFonce"
                hide-details
                density="compact"
                max-width="130"
                @update:model-value="majPrixLigne(pp)"
              ></v-number-input>
              <v-number-input
                v-model="pp.prix"
                label="Prix €"
                :precision="2"
                :step="0.5"
                :min="0"
                variant="outlined"
                rounded="lg"
                color="vertFonce"
                hide-details
                density="compact"
                max-width="150"
              ></v-number-input>
              <v-icon
                icon="mdi-delete"
                color="orange"
                class="cursor-pointer"
                @click="retirerProduit(index)"
              ></v-icon>
            </div>

            <div v-if="!produitsEnEdition.length" class="text-grey mb-3">
              Aucun produit dans ce panier.
            </div>

          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              label="Ajouter un produit"
              :items="produitsDisponiblesOptions"
              item-title="title"
              item-value="value"
              prepend-inner-icon="mdi-plus"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
              :model-value="null"
              @update:model-value="(id) => id && ajouterProduit(id)"
            ></v-autocomplete>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="d-flex justify-end align-center ga-2">
            <span class="text-subtitle-1">Prix total :</span>
            <span class="text-h6 text-orange font-weight-bold">
              {{ prixTotal.toFixed(2) }} €
            </span>
          </v-col>
        </v-row>

      </v-form>
    </BaseModal>

    <BaseModal
      v-model="dialogDelete"
      title="Suppression"
      submit-text="Oui"
      cancel-text="Non"
      max-width="450"
      min-width="300"
      @cancel="dialogDelete = false"
      @submit="confirmDelete"
    >
      <div class="text-center">
        Souhaitez-vous vraiment supprimer le panier de
        <span class="text-orange font-weight-bold">
          {{ itemToDelete ? `${getUtilisateurNom(itemToDelete.utilisateurId)}` : "" }}
        </span>
        ? Cette action est irréversible.
      </div>
    </BaseModal>

    <v-snackbar
      v-model="snackbarShow"
      :timer-color="snackbarAlert ? 'orange' : 'vertFonce'"
      timer="top"
      location="bottom right"
      rounded="lg"
      color="white"
    >
      <div class="d-flex align-center ga-2">
        <v-icon v-if="snackbarAlert" icon="mdi-alert" color="error"/>
        <div v-html="snackbarText">
        </div>
      </div>
      <template v-slot:actions>
            <v-btn
              variant="text"
              icon="mdi-close"
              @click="snackbarShow = false"
            />
          </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
const {
  paniers,
  adherentsOptions,
  recherchePaniers,
  formModel,
  produitsEnEdition,
  produitsDisponiblesOptions,
  prixTotal,
  ajouterProduit,
  retirerProduit,
  majPrixLigne,
  schemaSearch,
  dialog,
  dialogDelete,
  itemToDelete,
  isEditing,
  headers,
  add,
  edit,
  remove,
  confirmDelete,
  save,
  reset,
  formatDateAffichage,
  formatProduitPanier,
  getUtilisateurNom,
  fermerDialog,
  snackbarShow,
  snackbarText,
  snackbarAlert
} = usePaniers()
</script>