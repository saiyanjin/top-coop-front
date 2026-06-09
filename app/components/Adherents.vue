<template>
  <div class="pa-10">
    <div
      class="d-flex align-center text-title-large text-orange font-weight-bold mb-6"
    >
      <v-icon icon="mdi-database" class="mr-2"></v-icon>
      <span>Adhérents</span>
    </div>

    <v-sheet class="overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="adherents"
        :search="schemaSearch"
        :hide-default-footer="adherents.length < 11"
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
              Ajouter un adhérent
            </v-btn>
          </v-toolbar>
        </template>

        <template v-slot:item.role="{ value }">
          <v-chip
            :text="value"
            :prepend-icon="value === 'admin' ? 'mdi-shield-account' : undefined"
            label
            color="vertFonce"
            class="text-capitalize"
          >
          </v-chip>
        </template>

        <template v-slot:item.date_creation="{ value }">
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
            <p class="mb-4 text-grey">Aucun adhérent trouvé.</p>
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
      :title="isEditing ? 'Modifier l\'adhérent' : 'Ajouter un adhérent'"
      :submit-text="isEditing ? 'Modifier' : 'Ajouter'"
      @cancel="fermerDialog"
      @submit="save"
    >
      <v-form class="d-flex flex-column ga-5">
        <v-row>
          <v-col cols="6">
            <v-text-field
              label="Nom"
              v-model="formModel.nom"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              label="Prénom"
              v-model="formModel.prenom"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-text-field
          label="Email"
          v-model="formModel.email"
          type="email"
          variant="outlined"
          rounded="lg"
          color="vertFonce"
          hide-details
        ></v-text-field>

        <!-- ---------- MOT DE PASSE ---------- -->

        <div v-if="isEditing" class="d-flex align-center ga-4">
          <v-text-field
            label="Mot de passe"
            v-model="formModel.motDePasse"
            :disabled="isPasswordDisabled"
            clearable
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showPassword = !showPassword"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            rounded="lg"
            color="vertFonce"
            hide-details
          ></v-text-field>
          
          <!-- <v-btn 
            :icon="isPasswordDisabled ? 'mdi-pencil-outline' : 'mdi-pencil-off-outline'"
            elevation="1" 
            :class="isPasswordDisabled ? 'bg-orange' : 'bg-vertFonce'"
            @click="isPasswordDisabled = !isPasswordDisabled"
          ></v-btn> -->

            <v-tooltip
              v-model="show"
              location="top"
            >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                :icon="isPasswordDisabled ? 'mdi-pencil-outline' : 'mdi-pencil-off-outline'"
                elevation="1" 
                :class="isPasswordDisabled ? 'bg-orange' : 'bg-vertFonce'"
                @click="isPasswordDisabled = !isPasswordDisabled"
              >
              </v-btn>
            </template>
            <span v-if="isPasswordDisabled">Éditer le mot de passe</span>
            <span v-else>Annluer</span>
          </v-tooltip>
        </div>

        <v-text-field
          v-if="!isEditing"
          label="Mot de passe"
          v-model="formModel.motDePasse"
          type="password"
          variant="outlined"
          rounded="lg"
          color="vertFonce"
          hide-details
        ></v-text-field>

        <!-- ---------- MOT DE PASSE ---------- -->

        <v-text-field
          label="Adresse"
          v-model="formModel.adresse"
          variant="outlined"
          rounded="lg"
          color="vertFonce"
          hide-details
        ></v-text-field>

        <v-row>
          <v-col cols="4">
            <v-text-field
              label="Code postal"
              v-model="formModel.codePostal"
              variant="outlined"
              type="number"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="8">
            <v-text-field
              label="Ville"
              v-model="formModel.ville"
              variant="outlined"
              rounded="lg"
              color="vertFonce"
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <v-select
          label="Rôle"
          v-model="formModel.role"
          :items="rolesUser"
          variant="outlined"
          rounded="lg"
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
      <div class="text-center pt-2">
        Souhaitez-vous vraiment supprimer l'adhérent
        <span class="text-orange font-weight-bold">
          {{ itemToDelete ? `${itemToDelete.prenom} ${itemToDelete.nom}` : "" }}
        </span>
        ? Cette action est irréversible.
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
const {
  rolesUser,
  adherents,
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
  isPasswordDisabled,
  showPassword,
  fermerDialog,
  show
} = useAdherents()
</script>