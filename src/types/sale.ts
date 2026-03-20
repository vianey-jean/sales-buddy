// Types pour les ventes

export interface SaleProduct {
  productId: string;
  description: string;
  quantitySold: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  deliveryFee?: number;
  deliveryLocation?: string;
}

export interface Sale {
  id: string;
  date: string;
  // Nouvelle structure multi-produits
  products?: SaleProduct[];
  totalPurchasePrice?: number;
  totalSellingPrice?: number;
  totalProfit?: number;
  totalDeliveryFee?: number;
  // Ancien format pour compatibilité
  productId?: string;
  description?: string;
  quantitySold?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  profit?: number;
  deliveryFee?: number;
  // Informations client
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
  // Informations d'avance
  reste?: number;
  nextPaymentDate?: string;
  // Remboursement
  isRefund?: boolean;
  originalSaleId?: string;
}

export interface SaleFormData {
  date: string;
  products: SaleProduct[];
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
}
