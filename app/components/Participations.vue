<template>
    <div class="pa-10">
      <div class="d-flex align-center text-title-large text-orange font-weight-bold mb-6">
        <v-icon icon="mdi-database" class="mr-2"></v-icon>
        <span>Participations</span>
      </div>

      <v-sheet class="overflow-hidden">
        <v-data-table
          :headers="headers"
          :items="rechercheParticipations"
          :search="schemaSearch"
          :hide-default-footer="participations.length < 11"
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
              Ajouter une participation
            </v-btn>
          </v-toolbar>
        </template>

        <template v-slot:item.dateCreation="{ value }">
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
            <p class="mb-4 text-grey">Aucune participation trouvée.</p>
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
      :title="isEditing ? 'Modifier la participation' : 'Ajouter une participation'"
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
            <v-autocomplete
              v-model="formModel.creneauId"
              label="Créneau"
              :items="creneauxOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-autocomplete>
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
        Souhaitez-vous vraiment supprimer la participation de
        <span class="text-orange font-weight-bold">
          {{ itemToDelete ? `${getUtilisateurNom(itemToDelete.utilisateurId)} - ${getCreneauNom(itemToDelete.creneauId)}` : "" }}
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
  participations,
  rechercheParticipations,
  adherentsOptions,
  creneauxOptions,
  formModel,
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
  getUtilisateurNom,
  getCreneauNom,
  fermerDialog,
  snackbarShow,
  snackbarText
} = useParticipations()
</script>