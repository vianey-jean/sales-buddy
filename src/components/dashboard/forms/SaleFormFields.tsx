
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, Sale } from '@/types';
import ProductSearchInput from '../ProductSearchInput';
import SaleQuantityInput from './SaleQuantityInput';
import ClientSearchInput from '../ClientSearchInput';

interface FormData {
  date: string;
  description: string;
  productId: string;
  sellingPriceUnit: string;
  quantitySold: string;
  purchasePriceUnit: string;
  profit: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
}

interface SaleFormFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  selectedProduct: Product | null;
  editSale?: Sale;
  onProductSelect: (product: Product) => void;
  onSellingPriceChange: (price: string) => void;
  onQuantityChange: (quantity: string) => void;
  maxQuantity: number;
  isSubmitting: boolean;
  isOutOfStock: boolean;
  isAdvanceProduct: boolean;
  isProfitNegative: boolean;
}

const SaleFormFields: React.FC<SaleFormFieldsProps> = ({
  formData,
  setFormData,
  selectedProduct,
  editSale,
  onProductSelect,
  onSellingPriceChange,
  onQuantityChange,
  maxQuantity,
  isSubmitting,
  isOutOfStock,
  isAdvanceProduct,
  isProfitNegative
}) => {
  const handleClientSelect = (client: any) => {
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientName: client.nom,
        clientPhone: client.phone,
        clientAddress: client.adresse
      }));
    } else {
      // Si pas de client sélectionné, garder seulement le nom saisi
      setFormData(prev => ({
        ...prev,
        clientPhone: '',
        clientAddress: ''
      }));
    }
  };

  return (
    <div className="grid gap-4 py-4">
      {/* Date de vente */}
      <div className="space-y-2">
        <Label htmlFor="date">Date de vente</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
        />
      </div>

      {/* Informations client */}
      <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Informations Client
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <ClientSearchInput
              value={formData.clientName}
              onChange={(value) => setFormData(prev => ({ ...prev, clientName: value }))}
              onClientSelect={handleClientSelect}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Numéro de téléphone</Label>
              <Input
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="Ex: 0692123456"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Adresse</Label>
              <Input
                id="clientAddress"
                name="clientAddress"
                value={formData.clientAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                placeholder="Adresse complète du client"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Sélection du produit */}
      <div className="space-y-2">
        <Label htmlFor="description">Produit</Label>
        {editSale ? (
          <Input
            id="description"
            name="description"
            value={formData.description}
            readOnly
            disabled
          />
        ) : (
          <ProductSearchInput 
            onProductSelect={onProductSelect}
            selectedProduct={selectedProduct}
          />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Prix d'achat unitaire */}
        <div className="space-y-2">
          <Label htmlFor="purchasePriceUnit">Prix d'achat unitaire (€)</Label>
          <Input
            id="purchasePriceUnit"
            name="purchasePriceUnit"
            type="number"
            step="0.01"
            value={formData.purchasePriceUnit}
            readOnly
            disabled
          />
        </div>
        
        {/* Prix de vente unitaire */}
        <div className="space-y-2">
          <Label htmlFor="sellingPriceUnit">Prix de vente unitaire (€)</Label>
          <Input
            id="sellingPriceUnit"
            name="sellingPriceUnit"
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPriceUnit}
            onChange={(e) => onSellingPriceChange(e.target.value)}
            disabled={isSubmitting}
            className={isProfitNegative ? "border-red-500" : ""}
          />
          {isProfitNegative && (
            <p className="text-xs text-red-500">
              Le prix de vente est trop bas, vous allez faire une perte !
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Quantité vendue */}
        <SaleQuantityInput
          quantity={formData.quantitySold}
          maxQuantity={maxQuantity}
          onChange={onQuantityChange}
          disabled={isSubmitting || isOutOfStock || isAdvanceProduct}
          showAvailableStock={!!selectedProduct && !isAdvanceProduct}
        />
        
        {/* Bénéfice calculé */}
        <div className="space-y-2">
          <Label htmlFor="profit">Bénéfice (€)</Label>
          <Input
            id="profit"
            name="profit"
            type="number"
            step="0.01"
            value={formData.profit}
            readOnly
            disabled
            className={isProfitNegative ? "border-red-500 bg-red-50" : ""}
          />
          {isAdvanceProduct && (
            <p className="text-xs text-amber-600">
              Pour les produits d'avance, le bénéfice est calculé sans tenir compte de la quantité.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleFormFields;
