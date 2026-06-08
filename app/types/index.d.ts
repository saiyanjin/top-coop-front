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
    
}

export {};