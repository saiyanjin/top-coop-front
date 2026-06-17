// types/index.d.ts

import type { Unite } from "~/constants/enum";

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
    unite: Unite;
    prix: number;
    ean: string;
    dateCreation?: Date;
  }

  // ---------- Participations ----------

  interface Participation {
    id?: string;
    utilisateurId: string;
    creneauId: string;
    dateCreation?: Date;
  }

  // ---------- Créneaux ----------

  interface Creneau {
    id?: string;
    nom: string;
    dateDebut: Date;
    dateFin: Date;
    description: string | null;
    capacite: number;
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
    id?: string;
    utilisateurId: string;
    dateCreation?: Date | string;
    utilisateur?: {
      nom: string;
      prenom: string;
      email: string;
    };
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

  // ---------- Paniers ----------

    interface Panier {
    id?: string;
    utilisateurId: string;
    prix: number; 
    dateCreation?: Date;
  }

  interface ProduitPanier {
    id?: string,
    panierId: string,
    produitId: string,
    quantite: number,
    unite: Unite,
    prix: number,
  }

  interface PanierComplet extends Panier {
    produitPaniers: ProduitDansPanier[],
    nomDesProduits: string[],
  }

  interface PanierCompletSansProduit extends Panier {
    produitPaniers: ProduitDansPanier[],
  }

  interface ProduitDansPanier extends ProduitPanier {
    produit: ProduitAvecType,
  }
}

export {};
