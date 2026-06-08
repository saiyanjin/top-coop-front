// types/index.d.ts

declare global {

    // ---------- Produits ----------
    
    interface Produit {
    id?: number
    typeProduit: number | null
    dateArrivee: Date | null
    dateSortie: Date | null
    datePeremption: Date | null
    quantite: number
    unite: string
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
      dateCreation?: Date | string | null;
    }
    
}

export {};