import { ref, computed, onMounted } from "vue";
import { API_ROUTES } from "~/constants/api";

export const useCreneaux = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  function createNewRecord(): Creneau {
    return {
      nom: "",
      dateDebut: new Date,
      dateFin: new Date,
      description: "",
      capacite: 0,
    };
  }

  const creneaux = ref<Creneau[]>([]);
  const formModel = ref<Creneau>(createNewRecord());
  const schemaSearch = ref("");
  const dialog = ref(false);
  const dialogDelete = ref(false);
  const itemToDelete = ref<Creneau | null>(null);

  const snackbarShow = ref(false);
  const snackbarText = ref("");
  const snackbarAlert = ref(false);

  function triggerSnackbar(text: string, alert: boolean) {
    snackbarText.value = text;
    snackbarShow.value = true;
    snackbarAlert.value = alert;
  }

  const isEditing = computed(() => !!formModel.value.id);

  const headers = [
    { title: "Nom", key: "nom", align: "start" },
    { title: "Date Début", key: "dateDebut" },
    { title: "Date Fin", key: "dateFin" },
    { title: "Description", key: "description" },
    { title: "Capacité", key: "capacite" },
    { title: "Date de création", key: "dateCreation" },
    { title: "Actions", key: "actions", align: "end", sortable: false },
  ] as const;

  const dateColumns = [
    "dateDebut",
    "dateFin",
    "dateCreation"
  ] as const;

  onMounted(() => {
    getCreneaux();
  });
  
  function fermerDialog() {
    dialog.value = false
    }
  
  function add() {
    formModel.value = createNewRecord();
    dialog.value = true;
  }

  function edit(item: Creneau) {
    formModel.value = { ...item };
    dialog.value = true;
  }

  function remove(item: Creneau) {
    if (!item || item.id === undefined) return;
    itemToDelete.value = item;
    dialogDelete.value = true;
  }

  function confirmDelete() {
    if (!itemToDelete.value || itemToDelete.value.id === undefined) return;

    deleteCreneau(itemToDelete.value.id);

    dialogDelete.value = false;
    itemToDelete.value = null;
  }

  function save() {
    if (isEditing.value && formModel.value.id) {
      updateCreneau(formModel.value.id);
    } else {
      createCreneau();
    }
    dialog.value = false;
  }

  function reset() {
    dialog.value = false;
    dialogDelete.value = false;
    itemToDelete.value = null;
    formModel.value = createNewRecord();
    creneaux.value = [];
  }

  function formatDateAffichage(date: Date | null | string): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  }

  const getCreneaux = async () => {
    try {
      const data = await $fetch<Creneau[]>(routes.NEST_CRENEAUX, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });

      creneaux.value = data;
    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

  const createCreneau = async () => {
    try {
        const data = await $fetch<Creneau>(routes.NEST_CRENEAUX, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: formModel.value,
        });
        creneaux.value.push(data);
        triggerSnackbar(`Le créneau <span class="text-orange">${formModel.value.nom}</span> du  <span class="text-orange">${formatDateAffichage(formModel.value.dateDebut)}</span> au <span class="text-orange">${formatDateAffichage(formModel.value.dateFin)}</span> a bien été créée.`, false);
      } catch (error: any) {
      console.log(error.message);
    }
  };

  const deleteCreneau = async (id: string) => {
    try {
      const data = await $fetch<Creneau>(routes.NEST_CRENEAUX + '/' + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      const index = creneaux.value.findIndex((p) => p.id === id);
      if (index == -1) {
        return;
      }
      const deletedCreneau = creneaux.value[index];
      creneaux.value.splice(index, 1);
      triggerSnackbar(`Le créneau <span class="text-orange">${deletedCreneau?.nom}</span> du <span class="text-orange">${formatDateAffichage(deletedCreneau?.dateDebut ?? "")}</span> a bien été supprimée.`, false);
    } catch (error: any) {
      console.log(error.message);
    }
  };

    const updateCreneau = async (id: string) => {
    try {
      const data = await $fetch<Creneau>(routes.NEST_CRENEAUX + '/' + id, {
          method: "PATCH",
          headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: {
          nom: formModel.value.nom,
          dateDebut: formModel.value.dateDebut,
          dateFin: formModel.value.dateFin,
          description: formModel.value.description,
          capacite: formModel.value.capacite,
          },
      });
      const index = creneaux.value.findIndex((p) => p.id === id);
      if (index == -1) {
          return;
      }
      creneaux.value.splice(index, 1, data);
      triggerSnackbar(`Le créneau <span class="text-orange">${formModel.value.nom}</span> du <span class="text-orange">${formatDateAffichage(formModel.value.dateDebut)}</span> a bien été modifié.`, false);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return {
    creneaux,
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
    snackbarAlert
  };
};