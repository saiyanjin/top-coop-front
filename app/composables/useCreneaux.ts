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
      description: null,
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
    { title: "Créneau", key: "dateDebut"},
    { title: "Description", key: "description" },
    { title: "Capacité", key: "capacite" },
    { title: "Date de création", key: "dateCreation" },
    { title: "Actions", key: "actions", align: "end", sortable: false },
  ] as const;

  function formatPlageCreneau(item: Creneau): string {
    if (!item.dateDebut || !item.dateFin) return "-";
    
    const maDateDebut = typeof item.dateDebut === "string" ? new Date(item.dateDebut) : item.dateDebut;
    const maDateFin = typeof item.dateFin === "string" ? new Date(item.dateFin) : item.dateFin;

    const dateStr = maDateDebut.toLocaleDateString('fr-FR');
    
    const heureDebut = maDateDebut.getHours().toString().padStart(2, '0');
    const minDebut = maDateDebut.getMinutes().toString().padStart(2, '0');
    
    const heureFin = maDateFin.getHours().toString().padStart(2, '0');
    const minFin = maDateFin.getMinutes().toString().padStart(2, '0');

    return `${dateStr} de ${heureDebut}:${minDebut} à ${heureFin}:${minFin}`;
  }

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
  
  function obtenirDateLocaleString(date: Date): string {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');
    
    return `${annee}-${mois}-${jour}`;
  }

  function recupererHeure(heure: string) {
    if (!formModel.value.dateDebut) throw new Error("Date de début manquante");
    
    const dateLocale = obtenirDateLocaleString(formModel.value.dateDebut);
    
    return `${dateLocale}T${heure}:00`;
  }

  function recupererHeureFin(heure: string) {
    if (!formModel.value.dateDebut) throw new Error("Date de début manquante");
    
    const dateLocale = obtenirDateLocaleString(formModel.value.dateDebut);
    return `${dateLocale}T${heure}:00`;
  }

  function recupererTout() {
    const dateString = recupererHeure(timeDebut.value);
    const dateStringFin = recupererHeureFin(timeFin.value);
    const nouvelleDate : Date = new Date(dateString);
    const nouvelleDateFin : Date = new Date(dateStringFin);
    formModel.value.dateDebut = nouvelleDate
    formModel.value.dateFin = nouvelleDateFin
  }
  
  const createCreneau = async () => {
    try {
      recupererTout()
    } catch (error) {
      triggerSnackbar(`Date invalide`, false);
      return
    }
    try {
      const data = await $fetch<Creneau>(routes.NEST_CRENEAUX, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
        body: formModel.value,
      });
      creneaux.value.push(data);
        triggerSnackbar(`Le créneau <span class="text-orange">${formModel.value.nom}</span> du  <span class="text-orange">${formatDateAffichage(formModel.value.dateDebut)}</span> au <span class="text-orange">${formatDateAffichage(formModel.value.dateFin)}</span> a bien été créé.`, false);
      } catch (error: any) {
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
    }
  };

    const updateCreneau = async (id: string) => {
    try {
      recupererTout()
    } catch (error) {
      triggerSnackbar(`Date invalide`, false);
      return
    }
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
    }
  };

  const timeDebut = ref("")
  const timeFin = ref("")
  const showDialogDebut = ref(false)
  const showDialogFin = ref(false)
  
  function fermerHeure() {
    showDialogDebut.value = false;
    showDialogFin.value = false;
  }

  return {
    creneaux,
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
    snackbarShow,
    snackbarText,
    snackbarAlert,
    timeDebut,
    timeFin,
    showDialogDebut,
    showDialogFin,
    formatPlageCreneau,
    fermerHeure
  };
};