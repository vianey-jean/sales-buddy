// Types pour les dépenses

export interface DepenseFixe {
  free: number;
  internetZeop: number;
  assuranceVoiture: number;
  autreDepense: number;
  assuranceVie: number;
  total: number;
}

export interface DepenseDuMois {
  id: string;
  description: string;
  categorie: string;
  date: string;
  debit: string;
  credit: string;
  solde: number;
}

export interface DepenseFormData {
  description: string;
  categorie: string;
  date: string;
  debit: string;
  credit: string;
}
