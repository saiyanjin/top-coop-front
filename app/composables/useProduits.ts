import { ref, computed, onMounted } from "vue";
import { UserRole } from "~/constants/roles";
import { API_ROUTES } from "~/constants/api";

export const useProduits = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

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
  const schemaSearch = ref("");
  const dialog = ref(false);
  const dialogDelete = ref(false);
  const itemToDelete = ref<Produit | null>(null);

  const isEditing = computed(() => !!formModel.value.id);

  const headers = [
    { title: "Type de produit", key: "typeProduit.nom", align: "start" },
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
    dialog.value = false;
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
      const data = await $fetch<ProduitAvecType[]>(routes.NEST_PRODUITS_AVECTYPE, {
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

      typeProduit.value = data;
    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

  const createProduit = async () => {
    try {
      console.log(formModel.value)
      if ( !formModel.value.typeProduit?.id) {
        return
      } else {
        formModel.value.typeProduitId = formModel.value.typeProduit?.id
      }
      
      const {
        typeProduit, dateSortie, id, ...body
      } = formModel.value
      const data = await $fetch<Produit>(routes.NEST_PRODUITS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
        body: body
      });

      // const { id, dateSortie, typeProduit,...reste } = data;
      produits.value.push({...data, typeProduit:formModel.value.typeProduit });
      // console.log(reste);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const deleteProduit = async (id: string) => {
    try {
      const data = await $fetch<Produit>(routes.NEST_PRODUITS + "/" + id, {
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
        const { id, typeProduit, ...reste } = formModel.value;
        const data = await $fetch<Produit>(routes.NEST_PRODUITS + "/" + id, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: reste,
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
    fermerDialog,
  };
};
