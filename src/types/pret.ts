// Types pour les prêts

export interface PretDetail {
  date: string;
  montant: number;
}

export interface PaiementDetail {
  date: string;
  montant: number;
}

export interface PretFamille {
  id: string;
  nom: string;
  pretTotal: number;
  soldeRestant: number;
  dernierRemboursement: number;
  dateRemboursement: string;
  remboursements?: PaiementDetail[];
  prets?: PretDetail[];
}

export interface PretProduit {
  id: string;
  description: string;
  nom?: string;
  date: string;
  datePaiement?: string;
  phone?: string;
  prixVente: number;
  avanceRecue: number;
  reste: number;
  estPaye: boolean;
  productId?: string;
  paiements?: PaiementDetail[];
}

export interface PretFamilleFormData {
  nom: string;
  pretTotal: number;
}

export interface PretProduitFormData {
  description: string;
  nom: string;
  date: string;
  datePaiement?: string;
  phone?: string;
  prixVente: number;
  avanceRecue: number;
}
