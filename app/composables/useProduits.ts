import { ref, computed, onMounted } from "vue";
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
  const itemToDelete = ref<ProduitAvecType | null>(null);

  const snackbarShow = ref(false);
  const snackbarText = ref("");

  function triggerSnackbar(text: string) {
    snackbarText.value = text;
    snackbarShow.value = true;
  }

  const isEditing = computed(() => !!formModel.value.id);

// Remplacez l'ancien tableau par celui-ci
  const headers = [
    { title: "Nom", key: "nom", align: "start" },
    { title: "Créneau", key: "creneauPlage", sortable: false }, // Nouvelle colonne fusionnée
    { title: "Description", key: "description" },
    { title: "Capacité", key: "capacite" },
    { title: "Date de création", key: "dateCreation" },
    { title: "Actions", key: "actions", align: "end", sortable: false },
  ] as const;

  // Vous pouvez supprimer 'dateColumns' si vous n'en avez plus besoin ailleurs
  const dateColumns = [] as const;

  // Nouvelle fonction pour formater la plage horaire complète d'un item
  function formatPlageCreneau(item: Creneau): string {
    if (!item.dateDebut || !item.dateFin) return "-";
    
    const debut = typeof item.dateDebut === "string" ? new Date(item.dateDebut) : item.dateDebut;
    const fin = typeof item.dateFin === "string" ? new Date(item.dateFin) : item.dateFin;

    const dateStr = debut.toLocaleDateString("fr-FR");
    
    const heureDebut = debut.getHours().toString().padStart(2, '0');
    const minDebut = debut.getMinutes().toString().padStart(2, '0');
    
    const heureFin = fin.getHours().toString().padStart(2, '0');
    const minFin = fin.getMinutes().toString().padStart(2, '0');

    return `${dateStr} de ${heureDebut}:${minDebut} à ${heureFin}:${minFin}`;
  }

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

    deleteProduit(itemToDelete.value);

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

      produits.value.push({...data, typeProduit:formModel.value.typeProduit });
      triggerSnackbar(`Le produit <span class="text-orange">${formModel.value.typeProduit?.nom}</span> a bien été ajouté !`);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const deleteProduit = async (produit: ProduitAvecType) => {
    if (!produit.id) {
      return;
    }
    try {
      await $fetch<Produit>(routes.NEST_PRODUITS + "/" + produit.id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      const index = produits.value.findIndex((p) => p.id === produit.id);
      if (index == -1) {
        return;
      }
      produits.value.splice(index, 1);
      triggerSnackbar(`Le produit <span class="text-orange">${produit.typeProduit?.nom}</span> a bien été supprimé !`);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const updateProduit = async (id: string) => {
    try {
      if (id) {
        if (!formModel.value.typeProduit?.id) {
          return;
        }
        formModel.value.typeProduitId = formModel.value.typeProduit.id;

        const { id, typeProduit, ...reste } = formModel.value;
        const data = await $fetch<Produit>(routes.NEST_PRODUITS + "/" + id, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: reste,
        });
        const index = produits.value.findIndex((p) => p.id === id);
        if (index == -1) {
          return;
        }
        produits.value.splice(index, 1, { ...data, typeProduit });
        triggerSnackbar(`Le produit <span class="text-orange">${typeProduit?.nom}</span> a bien été mis à jour !`);
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
    formatPlageCreneau,
  };
};
