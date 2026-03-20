// Types pour les produits

export interface Product {
  id: string;
  code?: string; // Code unique du produit (7 caractères: P/T + chiffres + lettres)
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  profit?: number;
  reserver?: string; // "oui" si le produit est réservé
  photos?: string[]; // URLs des photos du produit (stockées dans /uploads)
  mainPhoto?: string; // URL de la photo principale
  fournisseur?: string; // Nom du fournisseur
}

export interface ProductFormData {
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  fournisseur?: string;
}
