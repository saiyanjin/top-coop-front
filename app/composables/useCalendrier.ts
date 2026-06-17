import { onMounted, ref, computed, watch } from 'vue'
import { API_ROUTES } from "~/constants/api";
import { useCreneaux } from './useCreneaux' 

export const useCalendrier = () => {
  const config = useRuntimeConfig()
  const routes = API_ROUTES(config.public.apiBase)

  const calendar = ref()
  const nbrJourSemaine = 7
  const tab = ref("calendrier")

  const participantsList = ref<Participant[]>([])

  const getParticipantsQuotas = async () => {
    try {
      const data = await $fetch<any[]>(routes.NEST_UTILISATEUR_QUOTA, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      })

      participantsList.value = data.map((user: any) => {
        const nbParticipations = Array.isArray(user.participations) ? user.participations.length : 0
        const heuresRestantes = (user.quota || 0) - nbParticipations

        return {
          nom: user.nom,
          prenom: user.prenom,
          heuresRestantes: heuresRestantes < 0 ? 0 : heuresRestantes
        }
      })
    } catch (error: any) {
      console.error("Erreur lors de la récupération des quotas utilisateurs :", error.message)
    }
  }

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
    
    const d = typeof dateSource === 'string' ? new Date(dateSource) : dateSource
    
    if (isNaN(d.getTime())) return ''

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const PALETTE_COULEURS = ['orange', 'success', 'purple', 'cyan', 'indigo', 'teal', 'pink'];

  const genererCouleurParTexte = (texte: string | undefined | null): string => {
    if (!texte) return 'primary';
    
    let hash = 0;
    for (let i = 0; i < texte.length; i++) {
      hash = texte.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % PALETTE_COULEURS.length;
    
    return PALETTE_COULEURS[index] || 'primary';
  };

  const participations = computed(() => {
    if (!creneaux || !Array.isArray(creneaux.value)) return []

    return creneaux.value
      .filter(creneau => creneau && creneau.dateDebut && creneau.dateFin)
      .map(creneau => {
        const nomCreneau = creneau.nom || 'Sans nom';
        
        return {
          name: nomCreneau,
          start: formatToCalendarDate(creneau.dateDebut),
          end: formatToCalendarDate(creneau.dateFin),
          color: genererCouleurParTexte(nomCreneau), 
        }
      })
  })

  const selectedEvent = ref<any>(null)
  const detailsDialog = ref(false)

  function showEventDetails(data: any) {

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
      const dDebut = typeof originalCreneau.dateDebut === 'string' ? new Date(originalCreneau.dateDebut) : originalCreneau.dateDebut;
      const dFin = typeof originalCreneau.dateFin === 'string' ? new Date(originalCreneau.dateFin) : originalCreneau.dateFin;

      let plageFormatee = "-";

      if (dDebut && !isNaN(dDebut.getTime()) && dFin && !isNaN(dFin.getTime())) {
        const dateStr = dDebut.toLocaleDateString('fr-FR');
        
        const heureDebut = String(dDebut.getHours()).padStart(2, '0');
        const minDebut = String(dDebut.getMinutes()).padStart(2, '0');
        
        const heureFin = String(dFin.getHours()).padStart(2, '0');
        const minFin = String(dFin.getMinutes()).padStart(2, '0');

        plageFormatee = `${dateStr} de ${heureDebut}:${minDebut}h à ${heureFin}:${minFin}h`;
      }

      selectedEvent.value = {
        nom: originalCreneau.nom,
        description: originalCreneau.description || 'Aucune description fournie.',
        capacite: originalCreneau.capacite || 0,
        plageHoraire: plageFormatee 
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
    getParticipantsQuotas()
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