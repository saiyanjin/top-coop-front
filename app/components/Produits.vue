<template>
  <div class="pa-10">
    <div
      class="d-flex align-center text-title-large text-orange font-weight-bold mb-6"
    >
      <v-icon icon="mdi-database" class="mr-2"></v-icon>
      <span>Produits</span>
    </div>

    <v-sheet class="overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="produits"
        :search="schemaSearch"
        :hide-default-footer="produits.length < 11"
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
            <v-spacer></v-spacer>
            <v-btn
              class="bg-vertFonce text-white font-weight-bold"
              size="large"
              prepend-icon="mdi-plus"
              rounded="lg"
              variant="flat"
              @click="add"
            >
              Ajouter un produit
            </v-btn>
          </v-toolbar>
        </template>

        <!-- <template v-slot:item.dateSortie="{ value }">
          {{ formatDateAffichage(value) }}
        </template>
        <template v-slot:item.dateArrive="{ value }">
          {{ formatDateAffichage(value) }}
        </template>
        <template v-slot:item.datePeremption="{ value }">
          {{ formatDateAffichage(value) }}
        </template> -->

        <template
          v-for="col in dateColumns"
          :key="col"
          v-slot:[`item.${col}`]="{ value }"
        >
          {{ formatDateAffichage(value) }}
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
            <p class="mb-4 text-grey">Aucun produits trouvés.</p>
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
      :title="isEditing ? 'Modifier le produit' : 'Ajouter un produit'"
      :submit-text="isEditing ? 'Modifier' : 'Ajouter'"
      @cancel="fermerDialog"
      @submit="save"
    >
      <v-form class="d-flex flex-column ga-5">
        <v-row>
          <v-col cols="6">
            <v-select
              label="Type de produit"
              :items="typeProduit"
              item-title="nom"
              v-model="formModel.typeProduit"
              return-object
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              required
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-date-input
              label="Date d'arrivée"
              v-model="formModel.dateArrive"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              prepend-icon=""
            ></v-date-input>
          </v-col>
          <v-col cols="6">
            <v-date-input
              label="Date de sortie"
              v-model="formModel.dateSortie"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              prepend-icon=""
              :disabled = "!isEditing"
            ></v-date-input>
          </v-col>
        </v-row>

        <v-date-input
          label="Date de péremption"
          v-model="formModel.datePeremption"
          variant="outlined"
          rounded="lg"
          color="vertFonce"
          prepend-icon=""
          hide-details
        ></v-date-input>

        <v-row>
          <v-col cols="4">
            <v-number-input
              label="Quantité"
              v-model="formModel.quantite"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-number-input>
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
      <div class="text-center pt-2">
        Souhaitez-vous vraiment supprimer le produit
        <span class="text-orange font-weight-bold">
          {{ itemToDelete?.typeProduit?.nom ?? "" }}
        </span>
        ? Cette action est irréversible.
      </div>
    </BaseModal>

    <v-snackbar
      v-model="snackbarShow"
      timer-color="vertFonce"
      timer="top"
      location="bottom right"
      rounded="lg"
      color="white"
    >
      <div v-html="snackbarText">
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
const {
  produits,
  typeProduit,
  formModel,
  schemaSearch,
  dialog,
  dialogDelete,
  itemToDelete,
  isEditing,
  headers,
  dateColumns,
  add,
  edit,
  remove,
  confirmDelete,
  save,
  reset,
  formatDateAffichage,
  fermerDialog,
  snackbarShow,
  snackbarText,
} = useProduits();
</script>
