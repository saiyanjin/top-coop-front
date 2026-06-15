<template>
  <div class="pa-10">
    <div
      class="d-flex align-center text-title-large text-orange font-weight-bold mb-6"
    >
      <v-icon icon="mdi-database" class="mr-2"></v-icon>
      <span>Commandes</span>
    </div>

    <v-sheet class="overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="commandes"
        :search="schemaSearch"
        :hide-default-footer="commandes.length < 11"
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
              @click="openCreateDialog"
            >
              Ajouter une commande
            </v-btn>
          </v-toolbar>
        </template>

        <template v-slot:item.client="{ item }">
          <span>
            {{ listeAdherents.find(u => u.id === item.utilisateurId)?.email || 'Email introuvable' }}
          </span>
        </template>

        <template v-slot:item.dateCreation="{ item }">
          <span>
            {{ formatDateAffichage(item.dateCreation) || '-' }}
          </span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-3 justify-end">
            <v-icon
              color="vertFonce"
              icon="mdi-pencil"
              class="cursor-pointer"
              @click="openEditDialog(item)"
            ></v-icon>
            <v-icon
              color="orange"
              icon="mdi-delete"
              class="cursor-pointer"
              @click="openDeleteDialog(item)"
            ></v-icon>
          </div>
        </template>
      </v-data-table>
    </v-sheet>

    <BaseModal
      v-model="dialog"
      :title="isEditing ? 'Modifier la commande' : 'Ajouter une commande'"
      submit-text="Enregistrer"
      cancel-text="Annuler"
      max-width="500"
      min-width="300"
      @cancel="dialog = false"
      @submit="isEditing ? updateCommande(formModel.id!) : createCommande()"
    >
      <v-form class="mt-4">
        <v-select
          v-model="formModel.utilisateurId"
          :items="listeAdherents"
          item-title="email"
          item-value="id"
          label="Sélectionner l'adhérent (Email)"
          variant="outlined"
          color="vertFonce"
          hide-details
        ></v-select>
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
        Souhaitez-vous vraiment supprimer la commande 
        <span class="text-orange font-weight-bold">
          {{ itemToDelete ? itemToDelete.id : "" }}
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
      <div v-html="snackbarText" class="text-grey-darken-3"></div>
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
  commandes,
  listeAdherents,
  formModel,
  schemaSearch,
  dialog,
  dialogDelete,
  itemToDelete,
  isEditing,
  headers,
  openCreateDialog,
  openEditDialog,
  openDeleteDialog,
  createCommande,
  updateCommande,
  confirmDelete,
  snackbarShow,
  snackbarText,
  formatDateAffichage
} = useCommandes();
</script>