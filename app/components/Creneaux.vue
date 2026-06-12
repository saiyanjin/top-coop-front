<template>
    <div class="pa-10">
      <div class="d-flex align-center text-title-large text-orange font-weight-bold mb-6">
        <v-icon icon="mdi-database" class="mr-2"></v-icon>
        <span>Créneaux</span>
      </div>

      <v-sheet class="overflow-hidden">
        <v-data-table
          :headers="headers"
          :items="creneaux"
          :search="schemaSearch"
          :hide-default-footer="creneaux.length < 11"
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
              Ajouter un créneau
            </v-btn>
          </v-toolbar>
        </template>

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
            <p class="mb-4 text-grey">Aucun créneau trouvé.</p>
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
      :title="isEditing ? 'Modifier le créneau' : 'Ajouter un créneau'"
      :submit-text="isEditing ? 'Modifier' : 'Ajouter'"
      @cancel="fermerDialog"
      @submit="save"
    >
      <v-form class="d-flex flex-column">
        <v-row>
          <v-col cols="12">
              <v-text-field
                label="Nom"
                v-model="formModel.nom"
                variant="outlined"
                rounded="lg"
                color="vertFonce"
                hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row class="d-flex align-center">
          <v-col cols="6">
            <v-date-input
              label="Date de début"
              v-model="formModel.dateDebut"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar"
              hide-details
            ></v-date-input>
          </v-col>
          <v-col cols="1" class="d-flex justify-center">-</v-col>
          <v-col cols="5">
            <v-text-field
              :model-value="timeDebut"
              label="Heure de début"
              variant="outlined"
              rounded="lg"
              prepend-icon=""
              prepend-inner-icon="mdi-clock-time-four-outline"
              readonly
              hide-details
            >
              <v-dialog 
                v-model="showDialogDebut"
                activator="parent"
                width="auto"
                rounded="xl"
                
              >
                <v-card class="rounded-xl pa-6">
                  <v-card-title class="d-flex justify-center text-title-large text-orange font-weight-bold pa-4">Sélectionner une heure</v-card-title>
                  <v-card-text>
                    <v-time-picker v-model="timeDebut" rounded="xl" format="24hr" hide-title/>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn size="large" rounded="lg" color="white" class="px-8 bg-orange font-weight-bold" @click="fermerHeure">Valider</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-text-field>
          </v-col>
          <v-col cols="6">
            <v-date-input
              label="Date de fin"
              v-model="formModel.dateFin"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar"
              hide-details
            ></v-date-input>
          </v-col>
          <v-col cols="1" class="d-flex justify-center">-</v-col>
          <v-col cols="5">
            <v-text-field
              :model-value="timeFin"
              label="Heure de fin"
              variant="outlined"
              rounded="lg"
              prepend-icon=""
              prepend-inner-icon="mdi-clock-time-four-outline"
              readonly
              format="24hr"
              hide-details
            >
              <v-dialog 
                v-model="showDialogFin"
                activator="parent"
                width="auto"
                rounded="xl"
                
              >
                <v-card class="rounded-xl pa-6">
                  <v-card-title class="d-flex justify-center text-title-large text-orange font-weight-bold pa-4">Sélectionner une heure</v-card-title>
                  <v-card-text>
                    <v-time-picker v-model="timeFin" rounded="xl" format="24hr" hide-title/>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn size="large" rounded="lg" color="white" class="px-8 bg-orange font-weight-bold" @click="fermerHeure">Valider</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-textarea
              clearable
              label="Description"
              v-model="formModel.description"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              no-resize
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-number-input
              label="Capacité"
              v-model="formModel.capacite"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
              :min="0"
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
      <div class="text-center">
        Souhaitez-vous vraiment supprimer le créneau
        <span class="text-orange font-weight-bold">
          {{ itemToDelete ? `${itemToDelete.nom} du ${formatDateAffichage(itemToDelete.dateDebut)} au ${formatDateAffichage(itemToDelete.dateFin)}` : "" }}
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
  creneaux,
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
  snackbarAlert,
  timeDebut,
  timeFin,
  showDialogDebut,
  showDialogFin,
  fermerHeure
} = useCreneaux()
</script>