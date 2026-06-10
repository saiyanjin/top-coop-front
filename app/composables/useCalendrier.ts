import { onMounted, ref, computed, watch } from 'vue'

export const useCalendrier = () => {
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

  const searchQuery = ref('')
  const currentPage = ref(1)
  const itemsPerPage = 10

  const participantsList = ref<Participation[]>([
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

  return {
    tab,
    today,
    currentMonth,
    participations,
    queryHistory,
    clearHistory,
    deleteLog,
    prev,
    next,
    searchQuery,
    currentPage,
    totalPages,
    paginatedParticipants
  };
}