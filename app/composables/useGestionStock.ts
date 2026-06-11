import { onMounted, ref, computed, watch } from "vue";
import { API_ROUTES } from "~/constants/api";

export const useGestionStock = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  const tab = ref("restock");
  const searchQuery = ref("");
  const currentPage = ref(1);
  const itemsPerPage = 10;

  const produits = ref<ProduitIHM[]>([]);

  onMounted(() => {
    getProduits();
  });

  const getProduits = async () => {
    try {
      const data = await $fetch<ProduitAvecTypeCommande[]>(
        routes.NEST_PRODUITS_AVECTYPE,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
        },
      );
      console.log("data = ", data);

      produits.value = data.map(produit => ({
        ...produit,
        quantiteInitiale: produit.quantite
      }));

    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

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
    tab,
    searchQuery,
    currentPage,
    totalPages,
    paginatedProduit,
    produits,
    resetQuantite,
  };
};