export const API_ROUTES = (baseUrl: string) => ({
    NEST_LOGIN: `${baseUrl}/auth/login`,
    NEST_USERS: `${baseUrl}/utilisateur`,
    NEST_PRODUITS: `${baseUrl}/produit`,
    NEST_PRODUITS_AVECTYPE: `${baseUrl}/produit/avecType`,
    NEST_TYPE_PRODUITS: `${baseUrl}/type-produit`,
});
