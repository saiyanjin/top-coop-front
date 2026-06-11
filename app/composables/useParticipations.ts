import { ref, computed, onMounted } from "vue";
import { API_ROUTES } from "~/constants/api";

export const useParticipations = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  function createNewRecord(): Participation {
    return {
      utilisateurId: "",
      creneauId: "",
      dateCreation: undefined,
    };
  }

  const participations = ref<Participation[]>([]);
  const creneaux = ref<Creneau[]>([]);
  const adherents = ref<Utilisateur[]>([]);
  const formModel = ref<Participation>(createNewRecord());
  const schemaSearch = ref("");
  const dialog = ref(false);
  const dialogDelete = ref(false);
  const itemToDelete = ref<Participation | null>(null);

  const snackbarShow = ref(false);
  const snackbarText = ref("");
  const snackbarAlert = ref(false);

  function triggerSnackbar(text: string, alert: boolean) {
    snackbarText.value = text;
    snackbarShow.value = true;
    snackbarAlert.value = alert;
  }

  const isEditing = computed(() => !!formModel.value.id);

  const adherentsOptions = computed(() =>
    adherents.value.map((user) => ({
      title: `${user.prenom} ${user.nom}`,
      value: user.id,
    }))
  );

  const creneauxOptions = computed(() =>
    creneaux.value.map((creneau) => ({
      title: `${creneau.nom}` + ` (${formatDateAffichage(creneau.dateDebut)})`,
      value: creneau.id,
    }))
  );

  const rechercheParticipations = computed(() =>
    participations.value.map((p) => ({
      ...p,
      utilisateurNom: getUtilisateurNom(p.utilisateurId),
      creneauNom: getCreneauNom(p.creneauId),
      dateDebut: getDateDebutCreneau(p.creneauId),
    }))
  );

  const headers = [
    { title: "Utilisateur", key: "utilisateurNom", align: "start" },
    { title: "Créneau", key: "creneauNom" },
    { title: "Date Début", key: "dateDebut" },
    { title: "Date de création", key: "dateCreation" },
    { title: "Actions", key: "actions", align: "end", sortable: false },
  ] as const;

  const dateColumns = [
    "dateDebut",
    "dateFin",
    "dateCreation"
  ] as const;

  onMounted(() => {
    getParticipations();
    getUsers();
    getCreneaux();
  });
  
  function fermerDialog() {
    dialog.value = false
    }
  
  function add() {
    formModel.value = createNewRecord();
    dialog.value = true;
  }

  function edit(item: Participation) {
    formModel.value = { ...item };
    dialog.value = true;
  }

  function remove(item: Participation) {
    if (!item || item.id === undefined) return;
    itemToDelete.value = item;
    dialogDelete.value = true;
  }

  function confirmDelete() {
    if (!itemToDelete.value || itemToDelete.value.id === undefined) return;

    deleteParticipation(itemToDelete.value.id);

    dialogDelete.value = false;
    itemToDelete.value = null;
  }

  function save() {
    if (isEditing.value && formModel.value.id) {
      updateParticipation(formModel.value.id);
    } else {
      createParticipation();
    }
    dialog.value = false;
  }

  function reset() {
    dialog.value = false;
    dialogDelete.value = false;
    itemToDelete.value = null;
    formModel.value = createNewRecord();
    participations.value = [];
  }

  function getUtilisateurNom(id: string): string {
    const user = adherents.value.find((u) => u.id === id);
    return user ? `${user.prenom} ${user.nom}` : "-";
  }

  function getCreneauNom(id: string): string {
    const creneau = creneaux.value.find((c) => c.id === id);
    return creneau ? creneau.nom : "-";
  }

  function getDateDebutCreneau(id: string): Date {
    const creneau = creneaux.value.find((c) => c.id === id);
    return creneau ? creneau.dateDebut : new Date;
  }

  function estDejaPris() {
    return (participations.value.filter((p) => p.creneauId === formModel.value.creneauId).some((p) => p.utilisateurId === formModel.value.utilisateurId))
  }

  function formatDateAffichage(date: Date | null | string): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  }

  const getParticipations = async () => {
    try {
      const data = await $fetch<Participation[]>(routes.NEST_PARTICIPATIONS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });

      participations.value = data;
    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

  const getUsers = async () => {
    try {
      const data = await $fetch<Utilisateur[]>(routes.NEST_USERS, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });

      adherents.value = data;
    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

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

  
  const createParticipation = async () => {
    try {
      if (estDejaPris()) {
        const c = formModel.value;
        triggerSnackbar(`L'utilisateur <span class="text-error">${getUtilisateurNom(c.utilisateurId)}</span> est déjà attribué à <span class="text-error">${getCreneauNom(c.creneauId)} <span class="text-black"> le </span> <span class="text-error">${formatDateAffichage(getDateDebutCreneau(c.creneauId))}</span>`, true);
        return;
      } else {
        const data = await $fetch<Participation>(routes.NEST_PARTICIPATIONS, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: formModel.value,
        });
        participations.value.push(data);
        triggerSnackbar(`La participation <span class="text-orange">${getCreneauNom(data.creneauId)}</span> pour <span class="text-orange">${getUtilisateurNom(data.utilisateurId)}</span> a bien été créée.`, false);
      }

    } catch (error: any) {
      console.log(error.message);
    }
  };

  const deleteParticipation = async (id: string) => {
    try {
      const data = await $fetch<Participation>(routes.NEST_PARTICIPATIONS + '/' + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      const index = participations.value.findIndex((p) => p.id === id);
      if (index == -1) {
        return;
      }
      const deletedParticipation = participations.value[index];
      participations.value.splice(index, 1);
      triggerSnackbar(`La participation de <span class="text-orange">${getUtilisateurNom(deletedParticipation?.utilisateurId ?? "")}</span> pour <span class="text-orange">${getCreneauNom(deletedParticipation?.creneauId ?? "")}</span> a bien été supprimée.`, false);
    } catch (error: any) {
      console.log(error.message);
    }
  };

    const updateParticipation = async (id: string) => {
    try {
      if (estDejaPris()) {
        const c = formModel.value;
        triggerSnackbar(`L'utilisateur <span class="text-error">${getUtilisateurNom(c.utilisateurId)}</span> est déjà attribué à <span class="text-error">${getCreneauNom(c.creneauId)} <span class="text-black"> le </span> <span class="text-error">${formatDateAffichage(getDateDebutCreneau(c.creneauId))}</span>`, true);
        return;

      } else {
        const data = await $fetch<Participation>(routes.NEST_PARTICIPATIONS + '/' + id, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: {
            utilisateurId: formModel.value.utilisateurId,
            creneauId: formModel.value.creneauId,
          },
        });
        const index = participations.value.findIndex((p) => p.id === id);
        if (index == -1) {
          return;
        }
        participations.value.splice(index, 1, data);
        triggerSnackbar(`La participation de <span class="text-orange">${getUtilisateurNom(data.utilisateurId)}</span> pour <span class="text-orange">${getCreneauNom(data.creneauId)}</span> a bien été modifiée.`, false);
      }
      
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return {
    participations,
    rechercheParticipations,
    adherents,
    adherentsOptions,
    creneaux,
    creneauxOptions,
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
    getUtilisateurNom,
    getCreneauNom,
    fermerDialog,
    snackbarShow,
    snackbarText,
    snackbarAlert
  };
};