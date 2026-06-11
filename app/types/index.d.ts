// types/index.d.ts

declare global {

  // ---------- Produits ----------

  interface Produit {
    id?: string;
    typeProduitId: string;
    dateArrive: Date;
    dateSortie?: Date;
    datePeremption?: Date;
    quantite: number;
  }

  interface ProduitAvecType {
    id?: string;
    typeProduitId: string;
    typeProduit?: TypeProduit;
    dateArrive: Date;
    dateSortie?: Date;
    datePeremption?: Date;
    quantite: number;
  }

  // ---------- Type Produits ----------

  interface TypeProduit {
    id?: string;
    nom: string;
    quantiteMax: number;
    unite: string;
    prix: number;
    dateCreation?: Date;
  }

  // ---------- Adherents ----------

  interface Utilisateur {
    id?: string;
    nom: string;
    prenom: string;
    email: string;
    adresse: string;
    codePostal: string;
    ville: string;
    motDePasse: string;
    role: UserRole;
    dateCreation?: Date;
  }

  // ---------- Calendrier ----------

  interface ActivityLogItem {
    id: string;
    message: string;
    timestamp: string | Date;
  }

  interface Participant {
    nom: string;
    prenom: string;
    heuresRestantes: number;
  }

  // ---------- Gestion des Stocks ----------
  
  interface ProduitRestock {
    nom?: string;
    quantite?: number;
  }

  interface ProduitAvecTypeCommande {
    id?: string;
    typeProduitId: string;
    typeProduit: TypeProduit;
    dateArrive: Date;
    dateSortie?: Date;
    datePeremption?: Date;
    quantite: number;
  }

  interface ProduitIHM extends ProduitAvecTypeCommande {
    quantiteInitiale?: number;
  }

  interface Commande {
    utilisateurId: string;
  }

  interface Commande_Produit {
    commandeId: string;
    typeProduitId: string;
    quantite: number;
  }

  interface GroupedProduitIHM {
    typeProduitId: string;
    quantiteEnStock: number;
    quantiteAAjouter: number; 
    typeProduit: any;
    originalProducts: any[];
  }

}

export {};
