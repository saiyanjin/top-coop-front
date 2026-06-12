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
        :items="typeProduits"
        :search="schemaSearch"
        :hide-default-footer="typeProduits.length < 11"
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
              Ajouter un type de produit
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
            <p class="mb-4 text-grey">Aucun type de produit trouvés.</p>
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
      :title="isEditing ? 'Modifier le type de produit' : 'Ajouter un type de produit'"
      :submit-text="isEditing ? 'Modifier' : 'Ajouter'"
      @cancel="fermerDialog"
      @submit="save"
    >
      <v-form class="d-flex flex-column ga-5">
        <v-row>
          <v-col cols="12">
            <v-text-field
              label="Nom"
              v-model="formModel.nom"
              return-object
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              required
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-number-input
              label="Quantité"
              v-model="formModel.quantiteMax"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-number-input>
          </v-col>
          <v-col cols="6">
            <v-select
              label="Unité"
              v-model="formModel.unite"
              :items="typeUnite"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <v-number-input
              label="Prix"
              v-model="formModel.prix"
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
        Souhaitez-vous vraiment supprimer le type de produit
        <span class="text-orange font-weight-bold">
          {{ itemToDelete ? itemToDelete.nom : ""}}
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
  typeUnite,
  typeProduits,
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
} = useTypeProduits();
</script>
