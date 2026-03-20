/**
 * ProductSearchInput - Composant de recherche de produit
 * 
 * RÔLE :
 * Ce composant permet de rechercher un produit existant dans l'inventaire.
 * Il affiche une liste déroulante de suggestions lorsque l'utilisateur tape
 * au moins 3 caractères. Recherche possible par description OU par code unique.
 * 
 * PROPS :
 * - searchTerm: string - Terme de recherche actuel
 * - onSearchChange: (value: string) => void - Callback lors du changement de recherche
 * - filteredProducts: Product[] - Liste des produits filtrés
 * - selectedProduct: Product | null - Produit sélectionné
 * - onSelectProduct: (product: Product) => void - Callback lors de la sélection d'un produit
 * - showProductList: boolean - Afficher ou non la liste des suggestions
 * - formatEuro: (value: number) => string - Fonction de formatage monétaire
 * 
 * DÉPENDANCES :
 * - @/components/ui/input
 * - @/components/ui/badge
 * - @/types/product
 * - lucide-react (Search, CheckCircle)
 * 
 * UTILISÉ PAR :
 * - AchatFormDialog.tsx
 * - ComptabiliteModule.tsx
 */

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, Hash, Filter } from 'lucide-react';
import { Product } from '@/types/product';

type ProductCategory = 'all' | 'perruque' | 'tissage' | 'extension' | 'autres';

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'perruque', label: 'Perruque' },
  { value: 'tissage', label: 'Tissage' },
  { value: 'extension', label: 'Extension' },
  { value: 'autres', label: 'Autres' },
];

const filterByCategory = (products: Product[], category: ProductCategory): Product[] => {
  if (category === 'all') return products;
  const check = (p: Product) => p.description.toLowerCase();
  switch (category) {
    case 'perruque': return products.filter(p => check(p).includes('perruque'));
    case 'tissage': return products.filter(p => check(p).includes('tissage'));
    case 'extension': return products.filter(p => check(p).includes('extension'));
    case 'autres': return products.filter(p =>
      !check(p).includes('perruque') && !check(p).includes('tissage') && !check(p).includes('extension')
    );
    default: return products;
  }
};

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface ProductSearchInputProps {
  /** Terme de recherche actuel */
  searchTerm: string;
  /** Callback lors du changement de recherche */
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Liste des produits filtrés selon le terme de recherche */
  filteredProducts: Product[];
  /** Produit actuellement sélectionné (null si aucun) */
  selectedProduct: Product | null;
  /** Callback lors de la sélection d'un produit dans la liste */
  onSelectProduct: (product: Product) => void;
  /** Afficher ou non la liste déroulante des suggestions */
  showProductList: boolean;
  /** Fonction de formatage des montants en euros */
  formatEuro: (value: number) => string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  searchTerm,
  onSearchChange,
  filteredProducts,
  selectedProduct,
  onSelectProduct,
  showProductList,
  formatEuro
}) => {
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>('all');

  const displayedProducts = useMemo(() => {
    return filterByCategory(filteredProducts, categoryFilter);
  }, [filteredProducts, categoryFilter]);

  return (
    <div className="space-y-2">
      {/* Label du champ de recherche */}
      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        <Search className="h-4 w-4 inline mr-2" />
        Rechercher un produit (par nom ou code)
      </Label>

      {/* Filtre par catégorie */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-purple-500" />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Filtre :</span>
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setCategoryFilter(option.value)}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 border ${
              categoryFilter === option.value
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:text-purple-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      {/* Champ de recherche avec liste déroulante */}
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Tapez au moins 3 caractères (nom ou code)..."
          className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600"
        />
        
        {/* Liste déroulante des produits filtrés */}
        {displayedProducts.length > 0 && showProductList && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
            {displayedProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Code unique du produit */}
                  {product.code && (
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-mono text-xs shrink-0">
                      <Hash className="h-3 w-3 mr-0.5" />
                      {product.code}
                    </Badge>
                  )}
                  <span className="font-medium truncate">{product.description}</span>
                </div>
                <Badge variant="outline" className="shrink-0">{formatEuro(product.purchasePrice)}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Badge de produit sélectionné */}
      {selectedProduct && (
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            {selectedProduct.description} sélectionné
          </Badge>
          {selectedProduct.code && (
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-mono text-xs">
              Code: {selectedProduct.code}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchInput;
