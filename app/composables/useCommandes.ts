import { ref, computed, onMounted } from "vue";
import { API_ROUTES } from "~/constants/api";

export const useCommandes = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  function createNewRecord(): Commande {
    return {
      utilisateurId: "",
    };
  }

  // États réactifs
  const commandes = ref<Commande[]>([]);
  const listeAdherents = ref<Utilisateur[]>([]); // Pour alimenter le v-select
  const formModel = ref<Commande>(createNewRecord());
  const schemaSearch = ref("");
  const dialog = ref(false);
  const dialogDelete = ref(false);
  const itemToDelete = ref<Commande | null>(null);

  const snackbarShow = ref(false);
  const snackbarText = ref("");

  function triggerSnackbar(text: string) {
    snackbarText.value = text;
    snackbarShow.value = true;
  }

  const isEditing = computed(() => !!formModel.value.id);

  function formatDateAffichage(date: Date | string | undefined): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  }

  const headers = [
    { title: "ID Commande", key: "id", align: "start" },
    { title: "Adhérent (ID)", key: "utilisateurId"},
    { title: "Email Client", key: "client"},
    { title: "Date de création", key: "dateCreation"},
    { title: "Actions", key: "actions", sortable: false, align: "end" },
  ] as const;

  // --- ACTIONS API ---

  // Charger les commandes
  const fetchCommandes = async () => {
    try {
      const data = await $fetch<Commande[]>(routes.NEST_COMMANDE, {
        method: "GET",
        headers: { Authorization: `Bearer ${useToken().getToken()}` },
      });
      commandes.value = data;
    } catch (error: any) {
      console.error("Erreur commandes fetch:", error.message);
    }
  };

  // Charger les adhérents pour le formulaire
  const fetchAdherents = async () => {
    try {
      const data = await $fetch<Utilisateur[]>(routes.NEST_USERS, {
        method: "GET",
        headers: { Authorization: `Bearer ${useToken().getToken()}` },
      });
      listeAdherents.value = data;
    } catch (error: any) {
      console.error("Erreur adherents fetch:", error.message);
    }
  };

  const openCreateDialog = () => {
    formModel.value = createNewRecord();
    dialog.value = true;
  };

  const openEditDialog = (item: Commande) => {
    formModel.value = { ...item };
    dialog.value = true;
  };

  const createCommande = async () => {
    try {
      const data = await $fetch<Commande>(routes.NEST_COMMANDE, {
        method: "POST",
        headers: { Authorization: `Bearer ${useToken().getToken()}` },
        body: {
          utilisateurId: formModel.value.utilisateurId,
        },
      });
      
      // Optionnel : Re-fetch complet pour s'assurer d'avoir les relations d'objets utilisateur du backend
      await fetchCommandes();
      
      triggerSnackbar("La commande a bien été créée !");
      dialog.value = false;
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const updateCommande = async (id: string) => {
    try {
      const data = await $fetch<Commande>(`${routes.NEST_COMMANDE}/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${useToken().getToken()}` },
        body: {
          utilisateurId: formModel.value.utilisateurId,
        },
      });
      
      await fetchCommandes();
      triggerSnackbar(`La commande <span class="text-orange">${id}</span> a bien été mise à jour !`);
      dialog.value = false;
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const openDeleteDialog = (item: Commande) => {
    itemToDelete.value = item;
    dialogDelete.value = true;
  };

  const confirmDelete = async () => {
    if (!itemToDelete.value?.id) return;
    const id = itemToDelete.value.id;
    try {
      await $fetch(`${routes.NEST_COMMANDE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${useToken().getToken()}` },
      });
      commandes.value = commandes.value.filter((p) => p.id !== id);
      dialogDelete.value = false;
      triggerSnackbar("La commande a bien été supprimée.");
    } catch (error: any) {
      console.error(error.message);
    }
  };

  onMounted(() => {
    fetchCommandes();
    fetchAdherents();
  });

  return {
    commandes,
    listeAdherents,
    formModel,
    schemaSearch,
    dialog,
    dialogDelete,
    itemToDelete,
    isEditing,
    headers,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    createCommande,
    updateCommande,
    confirmDelete,
    snackbarShow,
    snackbarText,
    formatDateAffichage
  };
};