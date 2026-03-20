/**
 * =============================================================================
 * Composant CommandeFormDialog
 * =============================================================================
 * 
 * Modal de création/édition de commande ou réservation.
 * Contient le formulaire complet avec gestion client, produits et dates.
 * 
 * @module CommandeFormDialog
 * @version 1.0.0
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, ShoppingCart, Crown, Star, Sparkles, Gift, Award, Zap, Filter } from 'lucide-react';
import SaleQuantityInput from '@/components/dashboard/forms/SaleQuantityInput';
import { Commande, CommandeProduit } from '@/types/commande';

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
}

interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
}

type ProductCategory = 'all' | 'perruque' | 'tissage' | 'extension' | 'autres';

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'perruque', label: 'Perruque' },
  { value: 'tissage', label: 'Tissage' },
  { value: 'extension', label: 'Extension' },
  { value: 'autres', label: 'Autres' },
];

const filterProductsByCategory = (products: Product[], category: ProductCategory): Product[] => {
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

interface CommandeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCommande: Commande | null;
  
  // Client fields
  clientNom: string;
  setClientNom: (value: string) => void;
  clientPhone: string;
  setClientPhone: (value: string) => void;
  clientAddress: string;
  setClientAddress: (value: string) => void;
  clientSearch: string;
  setClientSearch: (value: string) => void;
  showClientSuggestions: boolean;
  setShowClientSuggestions: (value: boolean) => void;
  filteredClients: Client[];
  handleClientSelect: (client: Client) => void;
  
  // Type field
  type: 'commande' | 'reservation';
  setType: (value: 'commande' | 'reservation') => void;
  
  // Product fields
  produitNom: string;
  setProduitNom: (value: string) => void;
  prixUnitaire: string;
  setPrixUnitaire: (value: string) => void;
  quantite: string;
  setQuantite: (value: string) => void;
  prixVente: string;
  setPrixVente: (value: string) => void;
  productSearch: string;
  setProductSearch: (value: string) => void;
  showProductSuggestions: boolean;
  setShowProductSuggestions: (value: boolean) => void;
  filteredProducts: Product[];
  handleProductSelect: (product: Product) => void;
  selectedProduct: Product | null;
  availableQuantityForSelected?: number | null;
  
  // Products list
  produitsListe: CommandeProduit[];
  editingProductIndex: number | null;
  handleAddProduit: () => void;
  handleEditProduit: (index: number) => void;
  handleRemoveProduit: (index: number) => void;
  
  // Date fields
  dateArrivagePrevue: string;
  setDateArrivagePrevue: (value: string) => void;
  dateEcheance: string;
  setDateEcheance: (value: string) => void;
  horaire: string;
  setHoraire: (value: string) => void;
  
  // Actions
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
}

/**
 * Modal de formulaire pour créer/éditer une commande ou réservation
 */
const CommandeFormDialog: React.FC<CommandeFormDialogProps> = ({
  isOpen,
  onOpenChange,
  editingCommande,
  clientNom,
  setClientNom,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  clientSearch,
  setClientSearch,
  showClientSuggestions,
  setShowClientSuggestions,
  filteredClients,
  handleClientSelect,
  type,
  setType,
  produitNom,
  setProduitNom,
  prixUnitaire,
  setPrixUnitaire,
  quantite,
  setQuantite,
  prixVente,
  setPrixVente,
  productSearch,
  setProductSearch,
  showProductSuggestions,
  setShowProductSuggestions,
  filteredProducts,
  handleProductSelect,
  selectedProduct,
  produitsListe,
  editingProductIndex,
  handleAddProduit,
  handleEditProduit,
  handleRemoveProduit,
  dateArrivagePrevue,
  setDateArrivagePrevue,
  dateEcheance,
  setDateEcheance,
  horaire,
  setHoraire,
  handleSubmit,
  resetForm,
  availableQuantityForSelected,
}) => {
  const [productCategoryFilter, setProductCategoryFilter] = React.useState<ProductCategory>('all');
  const categoryFilteredProducts = React.useMemo(() => filterProductsByCategory(filteredProducts, productCategoryFilter), [filteredProducts, productCategoryFilter]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/40 to-pink-50/40 dark:from-gray-900 dark:via-purple-900/30 dark:to-pink-900/30 backdrop-blur-2xl border-2 border-purple-300/50 dark:border-purple-600/50 shadow-[0_20px_70px_rgba(168,85,247,0.4)]">
        <DialogHeader className="border-b-2 border-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 dark:from-purple-700 dark:via-pink-700 dark:to-indigo-700 pb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
            <Sparkles className="h-6 w-6 text-pink-500" />
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent text-center">
            {editingCommande ? (
              <span className="flex items-center justify-center gap-2">
                <Edit className="h-6 w-6 text-purple-600" />
                Modifier Commande Premium
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Gift className="h-6 w-6 text-pink-600" />
                Nouvelle Commande Elite
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-3 text-center font-medium">
            ✨ Créez une expérience d'achat exclusive et luxueuse ✨
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Section Client Premium */}
          <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-700 shadow-[0_8px_30px_rgba(59,130,246,0.3)]">
            <h3 className="font-black text-xl flex items-center gap-3 text-blue-700 dark:text-blue-300">
              <span className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm shadow-lg">
                <Crown className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-2">
                Client Premium
                <Star className="h-5 w-5 text-yellow-500" />
              </span>
            </h3>
            
            <div className="relative">
              <Label htmlFor="clientNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                👤 Nom du Client
              </Label>
              <Input
                id="clientNom"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setClientNom(e.target.value);
                  setShowClientSuggestions(e.target.value.length >= 3);
                }}
                placeholder="Saisir au moins 3 caractères..."
                className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                required
              />
              {showClientSuggestions && filteredClients.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{client.nom}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                        📱 {client.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  📞 Téléphone
                </Label>
                <Input
                  id="clientPhone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Numéro de téléphone"
                  className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="clientAddress" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  🏠 Adresse
                </Label>
                <Input
                  id="clientAddress"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Adresse complète"
                  className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section Produit Premium */}
          <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-rose-900/30 border-2 border-purple-300 dark:border-purple-700 shadow-[0_8px_30px_rgba(168,85,247,0.3)]">
            <h3 className="font-black text-xl flex items-center gap-3 text-purple-700 dark:text-purple-300">
              <span className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shadow-lg">
                <ShoppingCart className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-2">
                Produits Elite
                <Sparkles className="h-5 w-5 text-pink-500" />
              </span>
            </h3>

            {/* Filtre par catégorie */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Filter className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Filtre :</span>
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setProductCategoryFilter(option.value)}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 border ${
                    productCategoryFilter === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:text-purple-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Label htmlFor="produitNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                📦 Nom du Produit
              </Label>
              <Input
                id="produitNom"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProduitNom(e.target.value);
                  setShowProductSuggestions(e.target.value.length >= 3);
                }}
                placeholder="Saisir au moins 3 caractères..."
                className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
              />
              {showProductSuggestions && categoryFilteredProducts.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {categoryFilteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{product.description}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <span>💰 {product.purchasePrice}€</span>
                        <span>📊 Stock: {product.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prixUnitaire" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  💵 Prix Unitaire (€)
                </Label>
                <Input
                  id="prixUnitaire"
                  type="number"
                  step="0.01"
                  value={prixUnitaire}
                  onChange={(e) => setPrixUnitaire(e.target.value)}
                  placeholder="Prix d'achat"
                  className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
                />
              </div>

              <div>
                <Label htmlFor="quantite" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  📊 Quantité {selectedProduct && `(disponible: ${availableQuantityForSelected !== null && availableQuantityForSelected !== undefined ? availableQuantityForSelected : selectedProduct.quantity})`}
                </Label>
                <SaleQuantityInput
                  quantity={quantite}
                  onChange={setQuantite}
                  maxQuantity={availableQuantityForSelected !== null && availableQuantityForSelected !== undefined ? availableQuantityForSelected : selectedProduct?.quantity}
                  showAvailableStock={false}
                />
              </div>

              <div>
                <Label htmlFor="prixVente" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  💎 Prix de Vente (€)
                </Label>
                <Input
                  id="prixVente"
                  type="number"
                  step="0.01"
                  value={prixVente}
                  onChange={(e) => setPrixVente(e.target.value)}
                  placeholder="Prix de vente"
                  className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-sm"
                />
              </div>
            </div>

            <Button 
              type="button"
              onClick={handleAddProduit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              {editingProductIndex !== null ? 'Modifier ce produit' : 'Ajouter ce produit au panier'}
            </Button>

            {/* Liste des produits dans le panier */}
            {produitsListe.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  🛒 Panier ({produitsListe.length} produit{produitsListe.length > 1 ? 's' : ''})
                </Label>
                <div className="space-y-2">
                  {produitsListe.map((produit, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 shadow-sm transition-all ${
                        editingProductIndex === index 
                          ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800' 
                          : 'border-purple-200 dark:border-purple-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {produit.nom}
                          {editingProductIndex === index && (
                            <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                              En édition
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qté: {produit.quantite} | Prix unitaire: {produit.prixUnitaire}€ | Prix vente: {produit.prixVente}€
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduit(index)}
                          className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl transition-all duration-300"
                          title="Modifier ce produit"
                        >
                          <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduit(index)}
                          className="hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 rounded-xl transition-all duration-300"
                          title="Retirer ce produit"
                        >
                          <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section Type et Date */}
          <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 border-2 border-green-300 dark:border-green-700 shadow-[0_8px_30px_rgba(34,197,94,0.3)]">
            <h3 className="font-black text-xl flex items-center gap-3 text-green-700 dark:text-green-300">
              <span className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm shadow-lg">
                <Award className="h-5 w-5" />
              </span>
              <span className="flex items-center gap-2">
                Type & Planification
                <Zap className="h-5 w-5 text-yellow-500" />
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  📋 Type
                </Label>
                <Select value={type} onValueChange={(value: 'commande' | 'reservation') => setType(value)}>
                  <SelectTrigger className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commande">📦 Commande</SelectItem>
                    <SelectItem value="reservation">📅 Réservation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === 'commande' ? (
                <div>
                  <Label htmlFor="dateArrivagePrevue" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    📅 Date d'arrivage prévue
                  </Label>
                  <Input
                    id="dateArrivagePrevue"
                    type="date"
                    value={dateArrivagePrevue}
                    onChange={(e) => setDateArrivagePrevue(e.target.value)}
                    className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="dateEcheance" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    📅 Date d'échéance
                  </Label>
                  <Input
                    id="dateEcheance"
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="horaire" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                ⏰ Horaire (optionnel)
              </Label>
              <Input
                id="horaire"
                type="time"
                value={horaire}
                onChange={(e) => setHoraire(e.target.value)}
                className="border-2 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-500 bg-white dark:bg-gray-900 shadow-sm"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              className="border-2 border-gray-300 dark:border-gray-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              {editingCommande ? 'Modifier' : 'Créer'} la {type === 'commande' ? 'commande' : 'réservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommandeFormDialog;
