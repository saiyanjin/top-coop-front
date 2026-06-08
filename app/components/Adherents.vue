<template>
  <div class="pa-10">
    <div class="d-flex align-center text-title-large text-orange font-weight-bold mb-6">
      <v-icon icon="mdi-database" class="mr-2"></v-icon>
      <span>Adhérents</span>
    </div>

    <v-sheet class="overflow-hidden">
      <v-data-table
        :headers="headers"
        :items="adherents"
        :search="schemaSearch"
        :hide-default-footer="adherents.length < 11"
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
            <v-icon color="vertFonce" icon="mdi-pencil" class="cursor-pointer" @click="edit(item)"></v-icon>
            <v-icon color="orange" icon="mdi-delete" class="cursor-pointer" @click="remove(item)"></v-icon>
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
      @cancel="dialog = false"
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
                  type="number"
                  variant="outlined"
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

            <v-date-input
              label="Date de création"
              v-model="formModel.dateCreation"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              rounded="lg"
              color="vertFonce"
              variant="outlined"
              cancel-text="Annuler"
              ok-text="Confirmer"
              hide-details
            ></v-date-input>

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
          {{ itemToDelete ? `${itemToDelete.prenom} ${itemToDelete.nom}` : '' }}
        </span> ? 
        Cette action est irréversible.
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UserRole } from '~/constants/roles'
import { API_ROUTES } from '~/constants/api'

  const config = useRuntimeConfig()
  const routes = API_ROUTES(config.public.apiBase)

function createNewRecord(): Utilisateur {
  return {
    nom: '',
    prenom: '',
    email: '',
    adresse: '',
    codePostal: '',
    ville: '',
    motDePasse: '',
    role: UserRole.USER,
    dateCreation: new Date(),
  }
}

const rolesUser = ref([UserRole.USER, UserRole.ADMIN])
const adherents = ref<Utilisateur[]>([])
const formModel = ref<Utilisateur>(createNewRecord())
const schemaSearch = ref('')
const dialog = ref(false)

const dialogDelete = ref(false)
const itemToDelete = ref<Utilisateur | null>(null)

const isEditing = computed(() => !!formModel.value.id)

const headers = [
  { title: 'Nom', key: 'nom', align: 'start' },
  { title: 'Prénom', key: 'prenom' },
  { title: 'Email', key: 'email' },
  { title: 'Ville', key: 'ville' },
  { title: 'Rôle', key: 'role' },
  { title: 'Date de création', key: 'date_creation' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
] as const

onMounted(() => {
  getUsers()
})

function add() {
  formModel.value = createNewRecord()
  dialog.value = true
}

function edit(item: Utilisateur) {
  formModel.value = { ...item }
  dialog.value = true
}

function remove(item: Utilisateur) {
  if (!item || item.id === undefined) return
  itemToDelete.value = item
  dialogDelete.value = true
}

function confirmDelete() {
  if (!itemToDelete.value || itemToDelete.value.id === undefined) return
  
  const index = adherents.value.findIndex(p => p.id === itemToDelete.value!.id)
  if (index !== -1) {
    adherents.value.splice(index, 1)
  }
  
  dialogDelete.value = false
  itemToDelete.value = null
}

function save() {
  if (isEditing.value) {
    const index = adherents.value.findIndex(p => p.id === formModel.value.id)
    if (index !== -1) {
      adherents.value[index] = formModel.value
    }
  } else {
    formModel.value.id = Date.now().toString()
    adherents.value.push(formModel.value)
  }
  dialog.value = false
}

function reset() {
  dialog.value = false
  dialogDelete.value = false
  itemToDelete.value = null
  formModel.value = createNewRecord()
  adherents.value = []
}

function formatDateAffichage(date: Date | null | string): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR')
}




interface Utilisateur {
  id?: string
  nom: string
  prenom: string
  email: string
  adresse: string
  codePostal: string
  ville: string
  motDePasse: string
  role: UserRole
  dateCreation: Date | string | null
}

const getUsers = async () => {
    try {
      const data = await $fetch<Utilisateur[]>(routes.NEST_GET_USERS, {
        method: "GET",
        headers:{
          Authorization:`Bearer ${useToken().getToken()}`
        }
      })

      console.log(data)

      adherents.value = data

      } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message)
    }
  }
</script>