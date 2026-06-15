import { onMounted, ref, computed, watch } from 'vue'
import { useCreneaux } from './useCreneaux' 

export const useCalendrier = () => {
  const calendar = ref()
  const nbrJourSemaine = 7
  const tab = ref("calendrier")

  const getLocalTodayString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = ref(getLocalTodayString())

  const { creneaux } = useCreneaux()

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
  
  const formatToCalendarDate = (dateSource: Date | string | null | undefined): string => {
    if (!dateSource) return ''
    
    const cleanSource = typeof dateSource === 'string' ? dateSource.replace('Z', '') : dateSource
    const d = new Date(cleanSource)
    
    if (isNaN(d.getTime())) return ''

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const participations = computed(() => {
    if (!creneaux || !Array.isArray(creneaux.value)) return []

    return creneaux.value
      .filter(creneau => creneau && creneau.dateDebut && creneau.dateFin)
      .map(creneau => {
        return {
          name: creneau.nom,
          start: formatToCalendarDate(creneau.dateDebut),
          end: formatToCalendarDate(creneau.dateFin),
        }
      })
  })

  const selectedEvent = ref<any>(null)
  const detailsDialog = ref(false)

  function showEventDetails(data: any) {
  // console.log("Structure reçue au clic :", data);

  const rawEventName = 
    data?.target?.innerText || 
    data?.event?.name ||      
    data?.name ||             
    data?.title;              

  if (!rawEventName) {
    console.warn("Impossible de lire le nom du créneau dans l'objet transmis par Vuetify :", data);
    return;
  }

  let eventNameCleaned = rawEventName.split('\n')[0];
  
  eventNameCleaned = eventNameCleaned.split(',')[0];
  
  eventNameCleaned = eventNameCleaned.trim().toLowerCase();

  const originalCreneau = creneaux.value.find(
    c => c.nom?.trim().toLowerCase() === eventNameCleaned
  );
  
  if (originalCreneau) {
    selectedEvent.value = {
      nom: originalCreneau.nom,
      description: originalCreneau.description || 'Aucune description fournie.',
      capacite: originalCreneau.capacite || 0,
      plageHoraire: formatToCalendarDate(originalCreneau.dateDebut) + ' au ' + formatToCalendarDate(originalCreneau.dateFin)
    };
    detailsDialog.value = true;
  } else {
    console.warn(`Créneau introuvable dans la liste 'creneaux' pour le nom nettoyé : "${eventNameCleaned}" (Nom brut: "${rawEventName}")`);
  }
}


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
    paginatedParticipants,
    detailsDialog,
    selectedEvent,
    showEventDetails
  };
}