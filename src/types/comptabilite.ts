// Types pour les nouveaux achats et dépenses

export interface NouvelleAchat {
  id: string;
  date: string;
  productId?: string;
  productDescription: string;
  purchasePrice: number;
  quantity: number;
  fournisseur: string;
  caracteristiques: string;
  totalCost: number;
  type: 'achat_produit' | 'taxes' | 'carburant' | 'autre_depense';
  description?: string;
  categorie?: string;
}

export interface NouvelleAchatFormData {
  productId?: string;
  productDescription: string;
  purchasePrice: number;
  quantity: number;
  fournisseur?: string;
  caracteristiques?: string;
  date?: string;
}

export interface DepenseFormData {
  description: string;
  montant: number;
  type: 'taxes' | 'carburant' | 'autre_depense';
  categorie?: string;
  date?: string;
}

export interface MonthlyStats {
  totalAchats: number;
  totalDepenses: number;
  achatsCount: number;
  depensesCount: number;
  totalGeneral: number;
  byType: Record<string, { total: number; count: number }>;
}

export interface YearlyStats extends MonthlyStats {
  byMonth: Record<number, { achats: number; depenses: number }>;
}

export interface ComptabiliteData {
  // Données des ventes
  salesTotal: number;
  salesProfit: number;
  salesCost: number;
  salesCount: number;
  
  // Données des achats/dépenses
  achatsTotal: number;
  depensesTotal: number;
  
  // Calculs finaux
  beneficeReel: number;
  totalDebit: number;
  totalCredit: number;
  soldeNet: number;
}