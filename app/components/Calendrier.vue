<template>
  <v-tabs v-model="tab" color="vertFonce" class="rounded-ts-lg">
    <v-tab value="calendrier">Calendrier</v-tab>
    <v-tab value="participants">Liste des participants</v-tab>
    <v-tab value="logs">Logs</v-tab>
  </v-tabs>

  <v-divider></v-divider>

  <v-tabs-window v-model="tab">
    <v-tabs-window-item value="calendrier">
      <v-sheet height="calc(100vh - 200px)">
        <div class="d-flex flex-column h-100 px-5 ga-0 overflow-hidden">
          <div class="d-flex flex-shrink-0 align-center justify-center ga-2 pa-3">
              <v-btn icon="mdi-chevron-left" variant="text" @click="prev"/>
              <h2 class="ma-0">{{currentMonth}}</h2>
              <v-btn icon="mdi-chevron-right" variant="text" @click="next"/>
          </div>
          <v-sheet class="flex-grow-1 overflow-hidden">
            <v-calendar
              ref="calendar"
              :events="participations"
              :model-value="today"
              :first-day-of-week="1"
              :now="today"
              color="primary"
              type="week"
            ></v-calendar>
          </v-sheet>
        </div>
      </v-sheet>
    </v-tabs-window-item>

    <v-tabs-window-item value="participants">
      <v-sheet height="calc(100vh - 200px)" class="px-15 py-5 overflow-hidden d-flex flex-column bg-transparent">
        
        <div class="d-flex my-10">
          <v-text-field
            v-model="searchQuery"
            label="Rechercher un participant ..."
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
          <v-row v-if="paginatedParticipants.length > 0">
            <v-col 
              v-for="(participant, index) in paginatedParticipants" 
              :key="index" 
              cols="12" 
              sm="6"
              class="py-2"
            >
              <v-sheet 
                class="d-flex align-center justify-space-between px-4 py-3 rounded-lg border-md border-gris"
                :class="(index + 1) % 4 < 2 ? 'bg-vertClair' : 'bg-vertClair60'"
                elevation="0"
              >
                <span class="text-subtitle-1 font-weight-bold text-black">
                  {{ participant.nom }} {{ participant.prenom }}
                </span>
                <span class="text-body-2 text-grey-darken-3">
                  Heures restantes : <strong class="text-black">{{ participant.heuresRestantes }}h</strong>
                </span>
              </v-sheet>
            </v-col>
          </v-row>

          <v-row v-else justify="center" class="mt-5">
            <v-col cols="12" class="text-center text-grey text-body-1">
              Aucun participant ne correspond à votre recherche.
            </v-col>
          </v-row>
        </v-sheet>

        <v-divider></v-divider>
        <div class="d-flex align-center justify-end flex-shrink-0 pt-3 ga-2 pa-0 text-body-2">
          <span>Page {{ currentPage }} sur {{ totalPages }}</span>
          
          <v-btn icon="mdi-chevron-double-left" variant="text" size="small" :disabled="currentPage === 1" @click="currentPage = 1" />
          
          <v-btn icon="mdi-chevron-left" variant="text" size="small" :disabled="currentPage === 1" @click="currentPage--" />
          
          <v-btn icon="mdi-chevron-right" variant="text" size="small" :disabled="currentPage === totalPages" @click="currentPage++" />
          
          <v-btn icon="mdi-chevron-double-right" variant="text" size="small" :disabled="currentPage === totalPages" @click="currentPage = totalPages" />
        </div>

      </v-sheet>
    </v-tabs-window-item>

    <v-tabs-window-item value="logs">
      <v-sheet height="calc(100vh - 200px)" class="pa-5 overflow-hidden d-flex flex-column">
        
        <div class="d-flex align-center flex-shrink-0 mb-4">
          <v-icon class="mr-2">mdi-history</v-icon>
          <h3>Journal d'activité</h3>
          <v-spacer />
          <v-btn 
            size="small" 
            color="error" 
            @click="clearHistory" 
            :disabled="queryHistory.length === 0" 
            prepend-icon="mdi-trash-can"
          >
            Tout effacer
          </v-btn>
        </div>

        <v-sheet v-if="queryHistory.length > 0" class="flex-grow-1 overflow-y-auto bg-transparent pr-2">
          <v-list class="bg-transparent pa-0">
            <v-list-item v-for="(item, index) in queryHistory" :key="item.id" class="mb-2 elevation-1 rounded-lg border-md bg-fond border-gris">
              
              <template v-slot:prepend>
                <v-icon color="orange" icon="mdi-information-outline" />
              </template>

              <v-list-item-title class="mt-1 text-wrap line-height-normal rounded-lg d-flex">
                <span class="log-message text-white rounded-lg px-2 py-1 text-body-small">{{ item.message }}</span>
              </v-list-item-title>

              <v-list-item-subtitle class="mt-1 mb-1 gray--text text-caption">
                {{ new Date(item.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn 
                  icon="mdi-close" 
                  size="small" 
                  variant="text" 
                  color="orange" 
                  @click="deleteLog(index)" 
                />
              </template>
              
            </v-list-item>
          </v-list>
        </v-sheet>

        <v-alert v-else type="info" color="text" variant="tonal" class="text-center my-auto">
          <v-icon size="48" class="mb-3">mdi-history</v-icon>
          <div>Aucun événement dans le journal d'activité</div>
        </v-alert>
        
      </v-sheet>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, watch } from 'vue'

  const calendar = ref()
  const nbrJourSemaine = 7
  const tab = ref("calendrier")
  const today = ref('2026-06-05')
  
  const queryHistory = ref<ActivityLogItem[]>([
    {
      id: 'log_1',
      message: 'Mr Dupont Jean a réservé pour le créneau "Mise en rayon" du 18/06/2026-16:00 pendant 1h',
      timestamp: '2026-06-09T14:22:10.000Z',
    },
    {
      id: 'log_2',
      message: 'Mme Martin Sophie a réservé pour le créneau "Caisse Centrale" du 18/06/2026-16:00 pendant 1h',
      timestamp: '2026-06-09T14:20:05.000Z',
    },
    {
      id: 'log_3',
      message: 'Mr Bernard Thomas a réservé pour le créneau "Réception Stock" du 18/06/2026-16:00 pendant 1h',
      timestamp: '2026-06-09T13:45:32.000Z',
    },
    {
      id: 'log_4',
      message: 'Mme Petit Marie a réservé pour le créneau "Préparation Commandes" du 18/06/2026-16:00 pendant 1h',
      timestamp: '2026-06-09T10:15:00.000Z',
    }
  ])

  const clearHistory = () => {
    queryHistory.value = []
  }

  const deleteLog = (index: number) => {
    queryHistory.value.splice(index, 1)
  }

  const currentMonth = computed(() => {
    const [year, month, day] = today.value.split('-').map(Number)
    const current = new Date(Number(year), Number(month) - 1, day)
    let monthName = current.toLocaleDateString('fr-FR', { month: 'long' })
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    return `${monthName} ${current.getFullYear()}`
  })
  
  const participations = [
    {
      name: 'Mise en rayon',
      start: '2026-06-01 09:00',
      end: '2026-06-01 12:00',
    },
    {
      name: `Thomas' Birthday`,
      start: '2026-06-07',
    },
    {
      name: 'Mash Potatoes',
      start: '2026-06-04 12:30',
      end: '2026-06-04 15:30',
    },
  ]

  onMounted(() => {
    if (calendar.value) {
      calendar.value.scrollToTime('08:00')
    }
  })

  function offsetDate (days: number) {
    const [year, month, day] = today.value.split('-').map(Number)
    const date = new Date(Number(year), Number(month) - 1, day)
    date.setDate(date.getDate() + days)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    const newDay = String(date.getDate()).padStart(2, '0')
    today.value = `${newYear}-${newMonth}-${newDay}`
  }

  function prev () {
    offsetDate(-nbrJourSemaine)
  }

  function next () {
    offsetDate(nbrJourSemaine)
  }

  interface Participant {
    nom: string;
    prenom: string;
    heuresRestantes: number;
  }

  const searchQuery = ref('')
  const currentPage = ref(1)
  const itemsPerPage = 10

  const participantsList = ref<Participant[]>([
    { nom: 'Matthieu', prenom: 'Flament', heuresRestantes: 1 },
    { nom: 'Dupont', prenom: 'Jean', heuresRestantes: 1 },
    { nom: 'Martin', prenom: 'Sophie', heuresRestantes: 1 },
    { nom: 'Bernard', prenom: 'Thomas', heuresRestantes: 1 },
    { nom: 'Petit', prenom: 'Marie', heuresRestantes: 1 },
    { nom: 'Durand', prenom: 'Lucas', heuresRestantes: 1 },
    { nom: 'Leroy', prenom: 'Julie', heuresRestantes: 1 },
    { nom: 'Moreau', prenom: 'Pierre', heuresRestantes: 1 },
    { nom: 'Simon', prenom: 'Chloé', heuresRestantes: 1 },
    { nom: 'Laurent', prenom: 'Maxime', heuresRestantes: 1 },
    { nom: 'Lefebvre', prenom: 'Emma', heuresRestantes: 1 },
    { nom: 'Michel', prenom: 'Antoine', heuresRestantes: 1 },
  ])

  const filteredParticipants = computed(() => {
    if (!searchQuery.value) return participantsList.value
    
    const query = searchQuery.value.toLowerCase().trim()
    
    return participantsList.value.filter(p => {
      const nomComplet = `${p.nom} ${p.prenom}`.toLowerCase()
      const prenomComplet = `${p.prenom} ${p.nom}`.toLowerCase()
      
      return nomComplet.includes(query) || prenomComplet.includes(query)
    })
  })

  const totalPages = computed(() => {
    const totalItems = filteredParticipants.value.length
    return totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage)
  })

  const paginatedParticipants = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredParticipants.value.slice(start, end)
  })

  watch(searchQuery, () => {
    currentPage.value = 1
  })
</script>