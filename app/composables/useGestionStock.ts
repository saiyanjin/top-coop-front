import { onMounted, ref, computed, watch } from 'vue'
import { API_ROUTES } from "~/constants/api";

export const useGestionStock = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  const tab = ref("restock")

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

  onMounted(() => {
    getProduits()
  })

  const searchQuery = ref('')
  const currentPage = ref(1)
  const itemsPerPage = 10

  function createNewRecord(): ProduitAvecType {
    return {
      typeProduitId: "",
      typeProduit: undefined,
      dateArrive: new Date(),
      dateSortie: undefined,
      datePeremption: undefined,
      quantite: 0,
    };
  }

  const produits = ref<ProduitAvecType[]>([]);
  const typeProduit = ref<TypeProduit[]>([]);
  const formModel = ref<ProduitAvecType>(createNewRecord());
  
  const participantsList = ref<ProduitRestock[]>([])

  const getProduits = async () => {
    try {
      const data = await $fetch<ProduitAvecType[]>(routes.NEST_PRODUITS_AVECTYPE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });

      console.log("data : ",data)
      produits.value = data;
      // console.log("produits quantite : ", produits.value[0]?.quantite)
      // console.log("produits nom : ", produits.value[0]?.typeProduit?.nom)
    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

  const filteredParticipants = computed(() => {
    if (!searchQuery.value) return participantsList.value
    
    const query = searchQuery.value.toLowerCase().trim()
    
    return participantsList.value.filter(p => {
      const nomComplet = `${p.nom}`.toLowerCase()
      
      return nomComplet.includes(query)
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
    queryHistory,
    clearHistory,
    deleteLog,
    searchQuery,
    currentPage,
    totalPages,
    paginatedParticipants,
    produits
  };
}