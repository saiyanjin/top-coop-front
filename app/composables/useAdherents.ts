import { ref, computed, onMounted } from "vue";
import { UserRole } from "~/constants/roles";
import { API_ROUTES } from "~/constants/api";


export const useAdherents = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  function createNewRecord(): Utilisateur {
    return {
      nom: "",
      prenom: "",
      email: "",
      adresse: "",
      codePostal: "",
      ville: "",
      motDePasse: "",
      role: UserRole.USER,
    };
  }

  const rolesUser = ref([UserRole.USER, UserRole.ADMIN]);
  const adherents = ref<Utilisateur[]>([]);
  const formModel = ref<Utilisateur>(createNewRecord());
  const schemaSearch = ref("");
  const dialog = ref(false);
  const show = ref(false)
  const dialogDelete = ref(false);
  const itemToDelete = ref<Utilisateur | null>(null);

  const isEditing = computed(() => !!formModel.value.id);

  const headers = [
    { title: "Nom", key: "nom", align: "start" },
    { title: "Prénom", key: "prenom" },
    { title: "Email", key: "email" },
    { title: "Ville", key: "ville" },
    { title: "Rôle", key: "role" },
    { title: "Date de création", key: "date_creation" },
    { title: "Actions", key: "actions", align: "end", sortable: false },
  ] as const;

  onMounted(() => {
    getUsers();
  });

  const isPasswordDisabled = ref<boolean>(true)
  const showPassword = ref(false)

  function fermerDialog() {
    dialog.value = false
    isPasswordDisabled.value = true
  }

  function add() {
    formModel.value = createNewRecord();
    dialog.value = true;
  }

  function edit(item: Utilisateur) {
    formModel.value = { ...item };
    dialog.value = true;
  }

  function remove(item: Utilisateur) {
    if (!item || item.id === undefined) return;
    itemToDelete.value = item;
    dialogDelete.value = true;
  }

  function confirmDelete() {
    if (!itemToDelete.value || itemToDelete.value.id === undefined) return;

    deleteUser(itemToDelete.value.id);

    dialogDelete.value = false;
    itemToDelete.value = null;
  }

  function save() {
    if (isEditing.value && formModel.value.id) {
      updateUser(formModel.value.id);
    } else {
      createUser();
    }
    dialog.value = false;
  }

  function reset() {
    dialog.value = false;
    dialogDelete.value = false;
    itemToDelete.value = null;
    formModel.value = createNewRecord();
    adherents.value = [];
  }

  function formatDateAffichage(date: Date | null | string): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  }

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

  const createUser = async () => {
    try {
      const data = await $fetch<Utilisateur>(routes.NEST_USERS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
        body: formModel.value,
      });
      adherents.value.push(data);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const data = await $fetch<Utilisateur>(routes.NEST_USERS + '/' + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      // console.log(data)
      const index = adherents.value.findIndex((p) => p.id === id);
      if (index == -1) {
        return;
      }
      adherents.value.splice(index, 1);
    } catch (error: any) {
      console.log(error.message);
    }
  };
  
  const updateUser = async (id: string) => {
    try {
      let reste: Record<string, any> = {};
      if (isPasswordDisabled.value) {
        const { id: userId, dateCreation, motDePasse, ...payload } = formModel.value;
        reste = payload;
      } else {
        const { id: userId, dateCreation, ...payload } = formModel.value;
        reste = payload;
      }
      const data = await $fetch<Utilisateur>(routes.NEST_USERS + '/' + id, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
        body: reste
      });
      // console.log('reste envoyé = ',reste)
      const index = adherents.value.findIndex((p) => p.id === id);
      if (index == -1) {
        return;
      }
      adherents.value.splice(index, 1, data);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return {
    rolesUser,
    adherents,
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
    isPasswordDisabled,
    showPassword,
    show,
    fermerDialog
  };
};