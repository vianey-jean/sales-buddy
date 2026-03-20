import { Product } from '@/types';

export interface FormProduct {
  productId: string;
  description: string;
  sellingPriceUnit: string;
  quantitySold: string;
  purchasePriceUnit: string;
  profit: string;
  selectedProduct: Product | null;
  maxQuantity: number;
  isAdvanceProduct: boolean;
  isPretProduit: boolean;
  deliveryLocation: string;
  deliveryFee: string;
  avancePretProduit: string;
}

export const createEmptyFormProduct = (): FormProduct => ({
  productId: '',
  description: '',
  sellingPriceUnit: '',
  quantitySold: '1',
  purchasePriceUnit: '',
  profit: '',
  selectedProduct: null,
  maxQuantity: 0,
  isAdvanceProduct: false,
  isPretProduit: false,
  deliveryLocation: 'Saint-Denis',
  deliveryFee: '0',
  avancePretProduit: ''
});
