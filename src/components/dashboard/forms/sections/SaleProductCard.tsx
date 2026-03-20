import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit3, Camera } from 'lucide-react';
import { Product } from '@/types';
import ProductSearchInput from '../../ProductSearchInput';
import SaleQuantityInput from '../SaleQuantityInput';
import { FormProduct } from '../types/saleFormTypes';

interface SaleProductCardProps {
  product: FormProduct;
  index: number;
  canDelete: boolean;
  isSubmitting: boolean;
  onProductSelect: (product: Product, index: number) => void;
  onSellingPriceChange: (value: string, index: number) => void;
  onQuantityChange: (value: string, index: number) => void;
  onDeleteProduct: (index: number) => void;
  onAvanceChange: (value: string, index: number) => void;
  onDeliveryChange: (location: string, fee: string, index: number) => void;
  onShowSlideshow: (product: FormProduct) => void;
}

const SaleProductCard: React.FC<SaleProductCardProps> = ({
  product,
  index,
  canDelete,
  isSubmitting,
  onProductSelect,
  onSellingPriceChange,
  onQuantityChange,
  onDeleteProduct,
  onAvanceChange,
  onDeliveryChange,
  onShowSlideshow,
}) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50/50 to-pink-50/30 dark:from-purple-900/30 dark:via-fuchsia-900/20 dark:to-pink-900/10 border-0 shadow-xl shadow-purple-500/10 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/15">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-fuchsia-300/20 rounded-full blur-2xl" />
      </div>
      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-bold bg-gradient-to-r from-purple-600 to-fuchsia-700 bg-clip-text text-transparent flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg text-white text-xs font-bold">
            {index + 1}
          </div>
          Produit #{index + 1}
        </CardTitle>
        <div className="flex items-center gap-2">
          {product.selectedProduct && (
            <span className="text-xs bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 px-3 py-1 rounded-full font-semibold shadow-sm">
              {product.selectedProduct.description}
            </span>
          )}
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDeleteProduct(index)}
              className="rounded-full w-8 h-8 p-0 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Photo principale du produit */}
      {product.selectedProduct?.mainPhoto && (
        <div className="flex justify-center mb-3 px-4">
          <button
            type="button"
            onClick={() => onShowSlideshow(product)}
            className="relative group cursor-pointer"
          >
            <img
              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000'}${product.selectedProduct.mainPhoto}`}
              alt={product.selectedProduct.description}
              className="w-20 h-20 object-cover rounded-xl border-2 border-purple-200 shadow-lg group-hover:border-purple-500 group-hover:scale-110 transition-all duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-200 flex items-center justify-center">
              <Edit3 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      )}
      {product.selectedProduct && !product.selectedProduct.mainPhoto && product.selectedProduct.photos && product.selectedProduct.photos.length > 0 && (
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={() => onShowSlideshow(product)}
            className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 hover:border-purple-500 hover:scale-110 transition-all duration-200 shadow-lg cursor-pointer"
          >
            <Camera className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      )}
      {product.isAdvanceProduct && (
        <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1 rounded-full font-semibold shadow-sm flex justify-center">
          ⭐ Avance
        </span>
      )}

      <CardContent className="space-y-4">
        {/* Sélection produit */}
        <div className="space-y-2">
          <Label>Produit</Label>
          <ProductSearchInput
            onProductSelect={(prod) => onProductSelect(prod, index)}
            selectedProduct={product.selectedProduct}
          />
        </div>

        {product.selectedProduct && (
          <div className="grid grid-cols-2 gap-4">
            {/* Prix d'achat unitaire */}
            <div className="space-y-2">
              <Label>Prix d'achat unitaire (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={product.purchasePriceUnit}
                readOnly
                disabled
              />
            </div>

            {/* Prix de vente unitaire */}
            <div className="space-y-2">
              <Label>Prix de vente unitaire (€)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={product.sellingPriceUnit}
                onChange={(e) => onSellingPriceChange(e.target.value, index)}
                disabled={isSubmitting}
                className={Number(product.profit) < 0 ? 'border-red-500' : ''}
              />
            </div>

            {/* Quantité */}
            <SaleQuantityInput
              quantity={product.quantitySold}
              maxQuantity={product.maxQuantity}
              onChange={(value) => onQuantityChange(value, index)}
              disabled={isSubmitting || product.isAdvanceProduct}
              showAvailableStock={!product.isAdvanceProduct}
            />

            {/* Avance (visible uniquement pour les prêts produits) */}
            {product.isPretProduit && (
              <div className="space-y-2">
                <Label>Avance (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.avancePretProduit}
                  onChange={(e) => onAvanceChange(e.target.value, index)}
                  placeholder="Montant de l'avance"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Facultatif - Si vide, le prix de vente sera 0
                </p>
              </div>
            )}

            {/* Frais de livraison */}
            <div className="space-y-2 col-span-2">
              <Label>Frais de livraison</Label>
              <select
                value={product.deliveryLocation}
                onChange={(e) => {
                  const location = e.target.value;
                  let fee = '0';
                  if (['Saint-Suzanne', 'Sainte-Marie', 'Saint-Denis', 'La Possession', 'Le Port', 'Saint-Paul'].includes(location)) {
                    fee = '0';
                  } else if (['Saint-André', 'Saint-Benoît', 'Saint-Leu'].includes(location)) {
                    fee = '10';
                  } else if (['Saint-Louis', 'Saint-Pierre', 'Le Tampon', 'Saint-Joseph'].includes(location)) {
                    fee = '20';
                  } else if (location === 'Exonération') {
                    fee = '0';
                  }
                  onDeliveryChange(location, fee, index);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="Saint-Suzanne">Saint-Suzanne: gratuit</option>
                <option value="Sainte-Marie">Sainte-Marie: gratuit</option>
                <option value="Saint-Denis">Saint-Denis: gratuit</option>
                <option value="La Possession">La Possession: gratuit</option>
                <option value="Le Port">Le Port: gratuit</option>
                <option value="Saint-Paul">Saint-Paul: gratuit</option>
                <option value="Saint-André">Saint-André: 10€</option>
                <option value="Saint-Benoît">Saint-Benoît: 10€</option>
                <option value="Saint-Leu">Saint-Leu: 10€</option>
                <option value="Saint-Louis">Saint-Louis: 20€</option>
                <option value="Saint-Pierre">Saint-Pierre: 20€</option>
                <option value="Le Tampon">Le Tampon: 20€</option>
                <option value="Saint-Joseph">Saint-Joseph: 20€</option>
                <option value="Autres">Autres: montant personnalisé</option>
                <option value="Exonération">Exonération: 0€</option>
              </select>
              {product.deliveryLocation === 'Autres' && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.deliveryFee}
                  onChange={(e) => onDeliveryChange('Autres', e.target.value, index)}
                  placeholder="Montant personnalisé"
                  className="mt-2"
                  disabled={isSubmitting}
                />
              )}
              <p className="text-sm text-gray-500">
                Frais: {Number(product.deliveryFee).toFixed(2)} €
              </p>
            </div>

            {/* Bénéfice */}
            <div className="space-y-2 col-span-2">
              <Label>Bénéfice (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={product.profit}
                readOnly
                disabled
                className={Number(product.profit) < 0 ? 'border-red-500 bg-red-50' : ''}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SaleProductCard;
