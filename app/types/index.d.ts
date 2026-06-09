// types/index.d.ts

declare global {

    // ---------- Produits ----------
    
    interface Produit {
    id?: string
    typeProduitId: string
    dateArrive: Date
    dateSortie: Date | null
    datePeremption: Date | null
    quantite: number
    }

    // ---------- Type Produits ----------
    
    interface TypeProduit {
    id?: number
    nom: string
    quantiteMax: float
    unite: string
    prix: float
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
    
}

export {};