import { onMounted, ref, computed, watch } from "vue";
import { API_ROUTES } from "~/constants/api";

export const useGestionStock = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);
  
  const snackbarShow = ref(false);
  const snackbarText = ref("");

  function triggerSnackbar(text: string) {
    snackbarText.value = text;
    snackbarShow.value = true;
  }

  const searchQuery = ref("");
  const currentPage = ref(1);
  const itemsPerPage = 8;
  const isModalOpen = ref(false);

  const produits = ref<GroupedProduitIHM[]>([]);

  const getProduits = async () => {
    try {
      const data = await $fetch<any[]>(routes.NEST_PRODUITS_AVECTYPE, {
        method: "GET",
        headers: { Authorization: `Bearer ${useToken().getToken()}` },
      });
      
      const groups: Record<string, GroupedProduitIHM> = {};

      data.forEach((p) => {
        if (!groups[p.typeProduitId]) {
          groups[p.typeProduitId] = {
            typeProduitId: p.typeProduitId,
            quantiteEnStock: 0,
            quantiteAAjouter: 0,
            typeProduit: p.typeProduit,
            originalProducts: []
          };
        }
        
        const group = groups[p.typeProduitId];
        if (group) {
          group.quantiteEnStock += p.quantite;
          group.originalProducts.push(p);
        }
      });

      produits.value = Object.values(groups);
    } catch (error: any) {
      console.error("Erreur API :", error.message);
    }
  };

  const modifiedProduits = computed(() => {
    return produits.value.filter(p => p.quantiteAAjouter > 0);
  });

  const totalModifies = ref(0);

  const submitRestock = async () => {
    try {
      totalModifies.value = modifiedProduits.value.length;
      if (totalModifies.value === 0) return;

      const token = useToken().getToken();
      let utilisateurId = null;

      if (token) {
        try {
          const payloadBase64 = token.split('.')[1];
          if (payloadBase64) {
            const decodedPayload = JSON.parse(atob(payloadBase64));
            utilisateurId = decodedPayload.id || decodedPayload.sub || decodedPayload.userId; 
          }
        } catch (e) {
          console.error("Erreur lors du décodage du token JWT :", e);
        }
      }

      if (!utilisateurId) {
        triggerSnackbar(`<span class="text-red">Erreur : Impossible de récupérer votre identifiant utilisateur.</span>`);
        return;
      }

      const nouvelleCommande = await $fetch<any>(routes.NEST_COMMANDE, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: {
          utilisateurId: utilisateurId,
        },
      });

      const commandeId = nouvelleCommande?.id;
      if (!commandeId) {
        throw new Error("Impossible de récupérer l'ID de la nouvelle commande.");
      }

      const updatePromises: Promise<any>[] = [];

      modifiedProduits.value.forEach((groupedProduct) => {
        const promise = $fetch(routes.NEST_COMMANDE_PRODUIT, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: {
            commandeId: commandeId,
            typeProduitId: groupedProduct.typeProduitId,
            quantite: groupedProduct.quantiteAAjouter, 
          },
        });
        updatePromises.push(promise);
      });

      await Promise.all(updatePromises);
      
      triggerSnackbar(`Le restockage a été enregistré ! Commande créée avec <span class="text-orange">${totalModifies.value}</span> produit(s).`);
      isModalOpen.value = false;

      await getProduits();
    } catch (error: any) {
      console.error("Erreur détaillée :", error.data?.message || error.message);
      triggerSnackbar(`<span class="text-red">Erreur lors de la validation.</span>`);
    }
  };

  onMounted(() => {
    getProduits();
  });

  const filteredProduit = computed(() => {
    if (!searchQuery.value) return produits.value;
    const query = searchQuery.value.toLowerCase().trim();
    return produits.value.filter((p) => {
      const nom = `${p.typeProduit?.nom || ''}`.toLowerCase();
      return nom.includes(query);
    });
  });

  const totalPages = computed(() => {
    const totalItems = filteredProduit.value.length;
    return totalItems === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);
  });

  const paginatedProduit = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProduit.value.slice(start, end);
  });

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  const resetQuantite = (produit: GroupedProduitIHM) => {
    if (produit) {
      produit.quantiteAAjouter = 0;
    }
  };

  return {
    searchQuery,
    currentPage,
    totalPages,
    paginatedProduit,
    produits,
    modifiedProduits,
    isModalOpen,
    resetQuantite,
    submitRestock,
    getProduits,
    snackbarShow,
    snackbarText,
    totalModifies
  };
};