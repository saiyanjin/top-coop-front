import { ref, computed, onMounted } from "vue";
import { UserRole } from "~/constants/roles";
import { API_ROUTES } from "~/constants/api";


export const useProduits = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  function createNewRecord(): Produit {
    return {
      typeProduitId: '',
      dateArrive: new Date,
      dateSortie: new Date,
      datePeremption: new Date,
      quantite: 0,
    };
  }

  const produits = ref<Produit[]>([]);
  const typeProduit = ref<string[]>([]);
  const formModel = ref<Produit>(createNewRecord());
  const schemaSearch = ref("");
  const dialog = ref(false);
  const dialogDelete = ref(false);
  const itemToDelete = ref<Produit | null>(null);

  const isEditing = computed(() => !!formModel.value.id);

  const headers = [
    { title: "Type de produit", key: "typeProduit", align: "start" },
    { title: "Date d'arrivée", key: "dateArrive" },
    { title: "Date de sortie", key: "dateSortie" },
    { title: "Date de péremption", key: "datePeremption" },
    { title: "Quantité", key: "quantite" },
    { title: "Actions", key: "actions", align: "end", sortable: false },
  ] as const;

  onMounted(() => {
    getProduits();
    getTypeProduit();
  });

  function fermerDialog() {
    dialog.value = false
  }

  function add() {
    formModel.value = createNewRecord();
    dialog.value = true;
  }

  function edit(item: Produit) {
    formModel.value = { ...item };
    dialog.value = true;
  }

  function remove(item: Produit) {
    if (!item || item.id === undefined) return;
    itemToDelete.value = item;
    dialogDelete.value = true;
  }

  function confirmDelete() {
    if (!itemToDelete.value || itemToDelete.value.id === undefined) return;

    deleteProduit(itemToDelete.value.id);

    dialogDelete.value = false;
    itemToDelete.value = null;
  }

  function save() {
    if (isEditing.value && formModel.value.id) {
      updateProduit(formModel.value.id);
    } else {
      createProduit();
    }
    dialog.value = false;
  }

  function reset() {
    dialog.value = false;
    dialogDelete.value = false;
    itemToDelete.value = null;
    formModel.value = createNewRecord();
    produits.value = [];
  }

  function formatDateAffichage(date: Date | null | string): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  }

  const getProduits = async () => {
    try {
      const data = await $fetch<Produit[]>(routes.NEST_PRODUITS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });

      produits.value = data;
    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

  const getTypeProduit = async () => {
    try {
      const data = await $fetch<TypeProduit[]>(routes.NEST_TYPE_PRODUITS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      
      data.map((tp) => typeProduit.value.push(tp.nom))
    } catch (error : any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  }

  const createProduit = async () => {
    try {
      const data = await $fetch<Produit>(routes.NEST_PRODUITS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
        body: formModel.value,
      });
      const { id, ...reste } = data;
      produits.value.push(reste);
      console.log(reste);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const deleteProduit = async (id: string) => {
    try {
      const data = await $fetch<Produit>(routes.NEST_PRODUITS + '/' + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      // console.log(data)
      const index = produits.value.findIndex((p) => p.id === id);
      if (index == -1) {
        return;
      }
      produits.value.splice(index, 1);
    } catch (error: any) {
      console.log(error.message);
    }
  };
  
  const updateProduit = async (id: string) => {
    try {
      if (id) {
        const { id, ...reste } = formModel.value;
        const data = await $fetch<Produit>(routes.NEST_PRODUITS + '/' + id, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
        body: reste
      });
      // console.log('reste envoyé = ',reste)
      const index = produits.value.findIndex((p) => p.id === id);
      if (index == -1) {
        return;
      }
      produits.value.splice(index, 1, data);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return {
    produits,
    typeProduit,
    formModel,
    schemaSearch,
    dialog,
    dialogDelete,
    itemToDelete,
    isEditing,
    headers,
    add,
    edit,
    remove,
    confirmDelete,
    save,
    reset,
    formatDateAffichage,
    fermerDialog
  };
};