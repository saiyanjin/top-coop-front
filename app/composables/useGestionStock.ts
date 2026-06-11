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
  const itemsPerPage = 10;
  const isModalOpen = ref(false);

  const produits = ref<ProduitIHM[]>([]);

  const modifiedProduits = computed(() => {
    return produits.value.filter(p => p.quantite !== p.quantiteInitiale);
  });

  const getProduits = async () => {
    try {
      const data = await $fetch<ProduitAvecTypeCommande[]>(routes.NEST_PRODUITS_AVECTYPE, {
        method: "GET",
        headers: { Authorization: `Bearer ${useToken().getToken()}` },
      });
      // console.log(data)
      produits.value = data.map(produit => ({
        ...produit,
        quantiteInitiale: produit.quantite
      }));
    } catch (error: any) {
      console.error("Erreur API :", error.message);
    }
  };

  const totalModifies = ref(0)

  const submitRestock = async () => {
    try {
      totalModifies.value = modifiedProduits.value.length;
      const updatePromises = modifiedProduits.value.map(async (p) => {
        const { id, typeProduit, quantiteInitiale, ...reste } = p;
        
        const response = await $fetch<Produit>(`${routes.NEST_PRODUITS}/${id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${useToken().getToken()}` },
          body: { ...reste, quantite: p.quantite },
        });

        const index = produits.value.findIndex(item => item.id === id);
        if (index !== -1) {
          produits.value[index] = { 
            ...response, 
            typeProduit, 
            quantiteInitiale: response.quantite 
          };
        }
      });

      await Promise.all(updatePromises);
      
      triggerSnackbar(`Le restockage de <span class="text-orange">${totalModifies.value}</span> produit(s) a été validé.`);
      isModalOpen.value = false;
    } catch (error: any) {
      console.error("Erreur lors de l'update :", error.message);
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

  const resetQuantite = (produit: ProduitIHM) => {
    if (produit && produit.quantiteInitiale !== undefined) {
      produit.quantite = produit.quantiteInitiale;
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