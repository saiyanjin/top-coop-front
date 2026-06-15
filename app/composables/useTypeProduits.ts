import { ref, computed, onMounted } from "vue";
import { API_ROUTES } from "~/constants/api";
import { Unite } from "~/constants/enum";

export const useTypeProduits = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  function createNewRecord(): TypeProduit {
    return {
      nom: "",
      quantiteMax: 0,
      unite: Unite.UNITE,
      prix: 0,
    };
  }

//   const produits = ref<ProduitAvecType[]>([]);
  const typeUnite = ref([Unite.VRAC, Unite.UNITE]);
  const typeProduits = ref<TypeProduit[]>([]);
  const formModel = ref<TypeProduit>(createNewRecord());
  const schemaSearch = ref("");
  const dialog = ref(false);
  const dialogDelete = ref(false);
  const itemToDelete = ref<TypeProduit | null>(null);

  const snackbarShow = ref(false);
  const snackbarText = ref("");

  function triggerSnackbar(text: string) {
    snackbarText.value = text;
    snackbarShow.value = true;
  }

  const isEditing = computed(() => !!formModel.value.id);

  const headers = [
    { title: "Type de produit", key: "nom", align: "start" },
    { title: "Quantité Max", key: "quantiteMax" },
    { title: "Unité", key: "unite" },
    { title: "Prix", key: "prix" },
    { title: "Date de création", key: "dateCreation" },
    { title: "Actions", key: "actions", align: "end", sortable: false },
  ] as const;

  const dateColumns = [
    "dateCreation"
  ] as const;

  onMounted(() => {
    // getProduits();
    getTypeProduit();
  });

  function fermerDialog() {
    dialog.value = false;
  }

  function add() {
    formModel.value = createNewRecord();
    dialog.value = true;
  }

  function edit(item: TypeProduit) {
    formModel.value = { ...item };
    dialog.value = true;
  }

  function remove(item: TypeProduit) {
    if (!item || item.id === undefined) return;
    itemToDelete.value = item;
    dialogDelete.value = true;
  }

  function confirmDelete() {
    if (!itemToDelete.value || itemToDelete.value.id === undefined) return;

    deleteTypeProduit(itemToDelete.value.id);

    dialogDelete.value = false;
    itemToDelete.value = null;
  }

  function save() {
    if (isEditing.value && formModel.value.id) {
      updateTypeProduit();
    } else {
      createTypeProduit();
    }
    dialog.value = false;
  }

  function reset() {
    dialog.value = false;
    dialogDelete.value = false;
    itemToDelete.value = null;
    formModel.value = createNewRecord();
    typeProduits.value = [];
  }

  function formatDateAffichage(date: Date | null | string): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  }

  const getTypeProduit = async () => {
    try {
      const data = await $fetch<TypeProduit[]>(routes.NEST_TYPE_PRODUITS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });

      typeProduits.value = data;
    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

  const createTypeProduit = async () => {
    try {
      const data = await $fetch<TypeProduit>(routes.NEST_TYPE_PRODUITS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
        body: formModel.value
      });

      typeProduits.value.push(data);
      triggerSnackbar(`Le type de produit <span class="text-orange">${data.nom}</span> a bien été ajouté !`);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const deleteTypeProduit = async (id: string) => {
    try {
      await $fetch<TypeProduit>(routes.NEST_TYPE_PRODUITS + "/" + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      const index = typeProduits.value.findIndex((p) => p.id === id);
      if (index == -1) {
        return;
      }
      const deletedTypeProduit = typeProduits.value[index];
      typeProduits.value.splice(index, 1);
      triggerSnackbar(`Le type de produit <span class="text-orange">${deletedTypeProduit?.nom}</span> a bien été supprimé !`);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const updateTypeProduit = async () => {
    try {
        const {id, dateCreation, ...reste} = formModel.value;
        const data = await $fetch<TypeProduit>(routes.NEST_TYPE_PRODUITS + "/" + id, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: reste,
        });
        const index = typeProduits.value.findIndex((p) => p.id === id);
        if (index == -1) {
          return;
        }
        typeProduits.value.splice(index, 1, data);
        triggerSnackbar(`Le type de produit <span class="text-orange">${reste.nom}</span> a bien été mis à jour !`);
      } catch (error: any) {
      console.log(error.message);
    }
  };

  return {
    typeUnite,
    typeProduits,
    formModel,
    schemaSearch,
    dialog,
    dialogDelete,
    itemToDelete,
    isEditing,
    headers,
    dateColumns,
    add,
    edit,
    remove,
    confirmDelete,
    save,
    reset,
    formatDateAffichage,
    fermerDialog,
    snackbarShow,
    snackbarText,
  };
};
