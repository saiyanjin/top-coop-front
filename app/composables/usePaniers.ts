import { ref, computed, onMounted } from "vue";
import { API_ROUTES } from "~/constants/api";

export const usePaniers = () => {
  const config = useRuntimeConfig();
  const routes = API_ROUTES(config.public.apiBase);

  function createNewRecord(): Panier {
    return {
      id: undefined,
      utilisateurId: "",
      prix: 0,
      dateCreation: undefined,
    };
  }

  const paniers = ref<PanierComplet[]>([]);
  const adherents = ref<Utilisateur[]>([]);
  const formModel = ref<Panier>(createNewRecord());
  const produitsEnEdition = ref<ProduitDansPanier[]>([]);
  const produitsSupprimes = ref<string[]>([]);
  const produitsDisponibles = ref<ProduitAvecType[]>([]);
  const schemaSearch = ref("");
  const dialog = ref(false);
  const dialogDelete = ref(false);
  const itemToDelete = ref<Panier | null>(null);

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

  const recherchePaniers = computed(() =>
    paniers.value.map((p) => ({
      ...p,
      utilisateurNom: getUtilisateurNom(p.utilisateurId),
    }))
  );

  // Prix total du panier = somme des prix de chaque ligne de produit.
  const prixTotal = computed(() =>
    produitsEnEdition.value.reduce((total, p) => total + (Number(p.prix) || 0), 0)
  );

  const produitsDisponiblesOptions = computed(() =>
    produitsDisponibles.value.map((p) => ({
      title: `${p.typeProduit.nom} (${p.typeProduit.prix} €)`,
      value: p.id,
    }))
  );

  const headers = [
    { title: "Id du panier", key: "id", align: "start" },
    { title: "Utilisateur", key: "utilisateurNom"},
    { title: "Produits du panier", key: 'data-table-expand', align: "center"},
    { title: "Prix", key: 'prix'},
    { title: "Date de création", key: "dateCreation" },
    { title: "Actions", key: "actions", align: "end", sortable: false },
  ] as const;

  onMounted(() => {
    getPaniers();
    getUsers();
    getProduitsDisponibles();
  });
  
  function fermerDialog() {
    dialog.value = false
    }
  
  function add() {
    formModel.value = createNewRecord();
    produitsEnEdition.value = [];
    produitsSupprimes.value = [];
    dialog.value = true;
  }

  function edit(item: PanierComplet) {
    formModel.value = { ...item };
    // Clone des lignes pour ne pas muter la table tant que l'utilisateur n'a pas validé.
    produitsEnEdition.value = (item.produitPaniers ?? []).map((p) => ({
      ...p,
      produit: { ...p.produit },
    }));
    produitsSupprimes.value = [];
    dialog.value = true;
  }

  function ajouterProduit(produitId: string) {
    const produit = produitsDisponibles.value.find((p) => p.id === produitId);
    if (!produit) return;
    produitsEnEdition.value.push({
      panierId: formModel.value.id ?? "",
      produitId: produit.id ?? "",
      quantite: 1,
      unite: produit.typeProduit.unite,
      prix: produit.typeProduit.prix,
      produit,
    });
  }

  // Recalcule le prix d'une ligne = quantité × prix unitaire du type de produit.
  function majPrixLigne(ligne: ProduitDansPanier) {
    const prixUnitaire = ligne.produit?.typeProduit?.prix ?? 0;
    ligne.prix = (Number(ligne.quantite) || 0) * prixUnitaire;
  }

  function retirerProduit(index: number) {
    const ligne = produitsEnEdition.value[index];
    if (!ligne) return;
    if (ligne.id) produitsSupprimes.value.push(ligne.id);
    produitsEnEdition.value.splice(index, 1);
  }

  function remove(item: Panier) {
    if (!item || item.id === undefined) return;
    itemToDelete.value = item;
    dialogDelete.value = true;
  }

  function confirmDelete() {
    if (!itemToDelete.value || itemToDelete.value.id === undefined) return;

    deletePanier(itemToDelete.value.id);

    dialogDelete.value = false;
    itemToDelete.value = null;
  }

  function save() {
    if (isEditing.value && formModel.value.id) {
      updatePanier(formModel.value.id);
    } else {
      createPanier();
    }
    dialog.value = false;
  }

  function reset() {
    dialog.value = false;
    dialogDelete.value = false;
    itemToDelete.value = null;
    formModel.value = createNewRecord();
    paniers.value = [];
  }

  function getUtilisateurNom(id: string): string {
    const user = adherents.value.find((u) => u.id === id);
    return user ? `${user.prenom} ${user.nom}` : "-";
  }

  function formatDateAffichage(date: Date | null | string): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("fr-FR");
  }

  function formatProduitPanier(produits: ProduitDansPanier[]): string {
    if (!produits || produits.length === 0) return "-";
    return produits
      .map(
        (p) =>
          `<v-list class="text-vertFonce">${p.produit.typeProduit.nom} x${p.quantite} - ${p.prix} €</v-list>`
      )
      .join(", ");
  }

  const getPaniers = async () => {
    try {
      const data = await $fetch<PanierCompletSansProduit[]>(routes.NEST_PANIER_COMPLET, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });

      const response : PanierComplet[] = [];

      data.forEach((element, index) => {
        const panier = element;
        response.push({...element, nomDesProduits:[]})
        panier.produitPaniers.forEach((pp) => response[index]?.nomDesProduits.push(pp.produit.typeProduit.nom))
      });
      paniers.value = response;
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

  const getProduitsDisponibles = async () => {
    try {
      const data = await $fetch<ProduitAvecType[]>(routes.NEST_PRODUITS_AVECTYPE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      produitsDisponibles.value = data;
    } catch (error: any) {
      console.error("Erreur API Nest :", error.data?.message || error.message);
    }
  };

  // Synchronise les lignes de produits du panier avec l'API : suppressions, créations et mises à jour.
  const syncProduitPaniers = async (panierId: string) => {
    const headers = { Authorization: `Bearer ${useToken().getToken()}` };

    for (const ligneId of produitsSupprimes.value) {
      await $fetch(`${routes.NEST_PRODUIT_PANIER}/${ligneId}`, {
        method: "DELETE",
        headers,
      });
    }

    for (const ligne of produitsEnEdition.value) {
      if (ligne.id) {
        await $fetch(`${routes.NEST_PRODUIT_PANIER}/${ligne.id}`, {
          method: "PATCH",
          headers,
          body: { quantite: ligne.quantite, prix: ligne.prix },
        });
      } else {
        await $fetch(routes.NEST_PRODUIT_PANIER, {
          method: "POST",
          headers,
          body: {
            panierId,
            produitId: ligne.produitId,
            quantite: ligne.quantite,
            unite: ligne.unite,
            prix: ligne.prix,
          },
        });
      }
    }

    produitsSupprimes.value = [];
  };

  const createPanier = async () => {
    try {
        const data = await $fetch<Panier>(routes.NEST_PANIER, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: { utilisateurId: formModel.value.utilisateurId, prix: prixTotal.value },
        });
        if (data.id) await syncProduitPaniers(data.id);
        await getPaniers();
        triggerSnackbar(`Le panier pour <span class="text-orange">${getUtilisateurNom(data.utilisateurId)}</span> a bien été crée.`, false);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const deletePanier = async (id: string) => {
    try {
      const data = await $fetch<Panier>(routes.NEST_PANIER + '/' + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${useToken().getToken()}`,
        },
      });
      const index = paniers.value.findIndex((p) => p.id === id);
      if (index == -1) {
        return;
      }
      const deletedPanier = paniers.value[index];
      paniers.value.splice(index, 1);
      triggerSnackbar(`Le panier de <span class="text-orange">${getUtilisateurNom(deletedPanier?.utilisateurId ?? "")} a bien été supprimé.`, false);
    } catch (error: any) {
      console.log(error.message);
    }
  };

    const updatePanier = async (id: string) => {
    try {
        await syncProduitPaniers(id);
        const data = await $fetch<Panier>(routes.NEST_PANIER + '/' + id, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${useToken().getToken()}`,
          },
          body: {
            utilisateurId: formModel.value.utilisateurId,
            prix: prixTotal.value,
          },
        });
        // Recharge pour récupérer les lignes fraîches (ids des nouveaux produits) et le total à jour.
        await getPaniers();
        triggerSnackbar(`Le panier de <span class="text-orange">${getUtilisateurNom(data.utilisateurId)}</span> a bien été mis à jour.`, false);
      } catch (error: any) {
      console.log(error.message);
    }
  };

  return {
    paniers,
    adherents,
    adherentsOptions,
    recherchePaniers,
    formModel,
    produitsEnEdition,
    produitsDisponiblesOptions,
    prixTotal,
    ajouterProduit,
    retirerProduit,
    majPrixLigne,
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
    formatProduitPanier,
    getUtilisateurNom,
    fermerDialog,
    snackbarShow,
    snackbarText,
    snackbarAlert
  };
};