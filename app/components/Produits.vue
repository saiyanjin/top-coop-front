<template>
  <div class="pa-10">
    <div class="d-flex align-center text-title-large text-orange font-weight-bold mb-6">
      <v-icon icon="mdi-database" class="mr-2"></v-icon>
      <span>Produits</span>
    </div>

    <v-sheet class="overflow-hidden">
      <v-data-table
        :headers="headers_produits"
        :items="produits"
        :search="schemaSearch"
        :hide-default-footer="produits.length < 11"
      >
        <template v-slot:top>
          <v-toolbar flat class="bg-white">
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
              class="bg-vertFonce text-white px-4 font-weight-bold"
              prepend-icon="mdi-plus"
              rounded="lg"
              variant="flat"
              @click="add"
            >
              Ajouter un produit
            </v-btn>
          </v-toolbar>
        </template>

        <template v-slot:item.typeProduit="{ value }">
          <v-chip 
            :text="getLabelTypeProduit(value)"
            prepend-icon="mdi-tag-outline" 
            label
            color="vertFonce"
          >
          </v-chip>
        </template>

        <template v-slot:item.dateArrivee="{ value }">
          {{ formatDateAffichage(value) }}
        </template>
        <template v-slot:item.dateSortie="{ value }">
          {{ formatDateAffichage(value) }}
        </template>
        <template v-slot:item.datePeremption="{ value }">
          {{ formatDateAffichage(value) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-3 justify-end">
            <v-icon color="vertFonce" icon="mdi-pencil" size="small" class="cursor-pointer" @click="edit(item)"></v-icon>
            <v-icon color="orange" icon="mdi-delete" size="small" class="cursor-pointer" @click="remove(item)"></v-icon>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="pa-4 text-center">
            <p class="mb-4 text-grey">Aucun produit en stock.</p>
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

    <v-dialog
      v-model="ajouterProduit"
      width="auto"
      persistent
    >
      <v-card
        max-width="800"
        min-width="600"
        class="rounded-xl pa-6"
      >
        <v-card-title class="d-flex align-center justify-center text-title-large text-orange font-weight-bold pa-6">
          {{ isEditing ? 'Modifier le produit' : 'Ajouter un produit' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form class="d-flex flex-column ga-5">
            <v-autocomplete 
              label="Type de produit"
              v-model="formModel.typeProduit"
              :items="types_produit"
              variant="outlined"
              item-title="value"
              item-value="id"
              clearable
              rounded="lg"
              hide-details
              color="vertFonce"
            />

            <div class="d-flex align-center justify-center ga-5">
              <v-date-input
                label="Date d'arrivée"
                v-model="formModel.dateArrivee"
                prepend-icon=""
                prepend-inner-icon="$calendar"
                rounded="lg"
                color="vertFonce"
                variant="outlined"
                cancel-text="Annuler"
                ok-text="Confirmer"
                hide-details
              ></v-date-input>

              <span class="align-self-center">-</span>

              <v-date-input
                label="Date de départ"
                v-model="formModel.dateSortie"
                prepend-icon=""
                prepend-inner-icon="$calendar"
                rounded="lg"
                color="vertFonce"
                variant="outlined"
                cancel-text="Annuler"
                ok-text="Confirmer"
                hide-details
              ></v-date-input>
            </div>

            <v-date-input
              label="Date de péremption"
              v-model="formModel.datePeremption"
              prepend-icon=""
              color="vertFonce"
              prepend-inner-icon="$calendar"
              rounded="lg"
              variant="outlined"
              cancel-text="Annuler"
              ok-text="Confirmer"
              hide-details
            ></v-date-input>

            <v-row>
              <v-col cols="8">
                <v-number-input
                  v-model="formModel.quantite"
                  rounded="lg"
                  label="Quantité" 
                  color="vertFonce"
                  :min="0"
                  variant="outlined"
                  hide-details
                ></v-number-input>
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="formModel.unite"
                  label="Unité"
                  :items="['kg', 'L', 'U']"
                  color="vertFonce"
                  rounded="lg"
                  variant="outlined"
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 d-flex justify-end ga-3">
          <v-btn
            size="large"
            rounded="lg"
            class="bg-vertFonce text-white px-8 font-weight-bold"
            @click="ajouterProduit = false"
          >
            Annuler
          </v-btn>
          <v-btn
            size="large"
            rounded="lg"
            class="bg-orange text-white px-8 font-weight-bold"
            @click="save"
          >
            {{ isEditing ? 'Modifier' : 'Ajouter' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="supprimerProduitDialog"
      max-width="450"
      persistent
    >
      <v-card class="rounded-xl pa-6 d-flex align-center justify-center">
        <v-card-title class="font-weight-bold d-flex align-center justify-center">
          Suppression
        </v-card-title>

        <v-card-text class="pt-2 text-center">
          Souhaitez-vous vraiment supprimer le produit 
          <span class="text-orange font-weight-bold">
            {{ produitASupprimer ? getLabelTypeProduit(produitASupprimer.typeProduit) : '' }}
          </span> ? 
          Cette action est irréversible.
        </v-card-text>

        <v-card-actions class="ga-6 pt-4">
          <v-btn
            rounded="lg"
            variant="flat"
            color="vertFonce"
            size="large"
            class="font-weight-bold px-15"
            @click="supprimerProduitDialog = false"
          >
            Non
          </v-btn>
          <v-btn
            rounded="lg"
            variant="flat"
            size="large"
            class="bg-orange text-white px-15 font-weight-bold"
            @click="confirmerSuppression"
          >
            Oui
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Définition de l'interface TypeScript pour un Produit
interface Produit {
  id?: number
  typeProduit: number | null
  dateArrivee: Date | null
  dateSortie: Date | null
  datePeremption: Date | null
  quantite: number
  unite: string
}

const types_produit = [
  { id: 1, value: 'Apple' },
  { id: 2, value: 'Banana' },
  { id: 3, value: 'Cherry' },
  { id: 4, value: 'Mango' },
  { id: 5, value: 'Orange' },
  { id: 6, value: 'Peach' },
  { id: 7, value: 'Pineapple' },
  { id: 8, value: 'Strawberry' },
]

function createNewRecord(): Produit {
  return {
    typeProduit: null,
    dateArrivee: new Date(),
    dateSortie: null,
    datePeremption: null,
    quantite: 1,
    unite: 'kg',
  }
}

const produits = ref<Produit[]>([])
const formModel = ref<Produit>(createNewRecord())
const schemaSearch = ref('')
const ajouterProduit = ref(false)

// États liés à la suppression
const supprimerProduitDialog = ref(false)
const produitASupprimer = ref<Produit | null>(null)

const isEditing = computed(() => !!formModel.value.id)

const headers_produits = [
  { title: 'Type de produit', key: 'typeProduit', align: 'start' },
  { title: "Date d'arrivée", key: 'dateArrivee' },
  { title: "Date de départ", key: 'dateSortie' },
  { title: 'Date de péremption', key: 'datePeremption' },
  { title: 'Quantité', key: 'quantite' },
  { title: 'Unité', key: 'unite'},
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
] as const

onMounted(() => {
  reset()
})

function add() {
  formModel.value = createNewRecord()
  ajouterProduit.value = true
}

function edit(item: Produit) {
  formModel.value = { ...item }
  ajouterProduit.value = true
}

// Ouvre le dialogue de confirmation en stockant l'objet sélectionné
function remove(item: Produit) {
  if (!item || item.id === undefined) return
  produitASupprimer.value = item
  supprimerProduitDialog.value = true
}

// Exécute la suppression après confirmation
function confirmerSuppression() {
  if (!produitASupprimer.value || produitASupprimer.value.id === undefined) return
  
  const index = produits.value.findIndex(p => p.id === produitASupprimer.value!.id)
  if (index !== -1) {
    produits.value.splice(index, 1)
  }
  
  // Réinitialisation des états
  supprimerProduitDialog.value = false
  produitASupprimer.value = null
}

function save() {
  if (isEditing.value) {
    const index = produits.value.findIndex(p => p.id === formModel.value.id)
    if (index !== -1) {
      produits.value[index] = formModel.value
    }
  } else {
    formModel.value.id = produits.value.length > 0 ? Math.max(...produits.value.map(p => p.id || 0)) + 1 : 1
    produits.value.push(formModel.value)
  }
  ajouterProduit.value = false
}

function reset() {
  ajouterProduit.value = false
  supprimerProduitDialog.value = false
  produitASupprimer.value = null
  formModel.value = createNewRecord()
  produits.value = [
    { id: 1, typeProduit: 1, dateArrivee: new Date('2026-06-01'), dateSortie: null, datePeremption: new Date('2026-06-15'), quantite: 12, unite: 'kg' },
    { id: 2, typeProduit: 4, dateArrivee: new Date('2026-05-20'), dateSortie: new Date('2026-05-25'), datePeremption: new Date('2026-06-05'), quantite: 50, unite: 'L' },
  ]
}

function getLabelTypeProduit(id: number | null): string {
  if (id === null) return 'Inconnu'
  const found = types_produit.find(t => t.id === id)
  return found ? found.value : 'Inconnu'
}

function formatDateAffichage(date: Date | null | string): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fr-FR')
}
</script>