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
    dateSortie?: Date ;
    datePeremption?: Date ;
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
    statut: string;
    description: string;
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

}

export {};
