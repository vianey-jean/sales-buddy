import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Sale } from '@/types';
import { Search, RotateCcw, Trash2, Euro, Package, X, AlertTriangle, Edit3, PackageCheck } from 'lucide-react';
import remboursementApiService from '@/services/api/remboursementApi';
import pretProduitApiService from '@/services/api/pretProduitApi';

interface RefundFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
}

interface RefundProduct {
  productId: string;
  description: string;
  quantitySold: number;
  maxQuantity: number;
  purchasePriceUnit: number;
  refundPriceUnit: number;
  originalSellingPriceUnit: number;
  profit: number;
}

const RefundForm: React.FC<RefundFormProps> = ({ isOpen, onClose, editSale }) => {
  const { refreshData } = useApp();
  const { toast } = useToast();

  const [clientSearch, setClientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [refundProducts, setRefundProducts] = useState<RefundProduct[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [linkedPrets, setLinkedPrets] = useState<any[]>([]);
  const [pretAction, setPretAction] = useState<'delete' | 'modify'>('delete');
  const [showStockConfirm, setShowStockConfirm] = useState(false);
  const [stockRestoreProducts, setStockRestoreProducts] = useState<RefundProduct[]>([]);

  React.useEffect(() => {
    if (isOpen && editSale) {
      setSelectedSale(editSale);
      initRefundProducts(editSale);
      setClientSearch(editSale.clientName || '');
      setDate(new Date().toISOString().split('T')[0]);
      checkLinkedPrets(editSale);
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, editSale]);

  const resetForm = () => {
    setClientSearch('');
    setSearchResults([]);
    setSelectedSale(null);
    setRefundProducts([]);
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedYear(new Date().getFullYear());
    setLinkedPrets([]);
    setPretAction('delete');
    setShowStockConfirm(false);
    setStockRestoreProducts([]);
  };

  const initRefundProducts = (sale: Sale) => {
    if (sale.products && sale.products.length > 0) {
      setRefundProducts(sale.products.map(p => ({
        productId: p.productId,
        description: p.description,
        quantitySold: p.quantitySold,
        maxQuantity: p.quantitySold,
        purchasePriceUnit: p.purchasePrice / (p.quantitySold || 1),
        refundPriceUnit: p.sellingPrice / (p.quantitySold || 1),
        originalSellingPriceUnit: p.sellingPrice / (p.quantitySold || 1),
        profit: p.profit
      })));
    } else if (sale.productId) {
      setRefundProducts([{
        productId: sale.productId,
        description: sale.description || '',
        quantitySold: sale.quantitySold || 1,
        maxQuantity: sale.quantitySold || 1,
        purchasePriceUnit: (sale.purchasePrice || 0) / (sale.quantitySold || 1),
        refundPriceUnit: (sale.sellingPrice || 0) / (sale.quantitySold || 1),
        originalSellingPriceUnit: (sale.sellingPrice || 0) / (sale.quantitySold || 1),
        profit: sale.profit || 0
      }]);
    }
  };

  const checkLinkedPrets = async (sale: Sale) => {
    try {
      const allPrets = await pretProduitApiService.getAll();
      const clientName = sale.clientName?.toLowerCase() || '';
      const saleProducts = sale.products?.map(p => p.description?.toLowerCase()) || [sale.description?.toLowerCase()];

      const linked = allPrets.filter(pret => {
        const pretNom = (pret.nom || '').toLowerCase();
        const pretDesc = (pret.description || '').toLowerCase();
        return (pretNom.includes(clientName) || clientName.includes(pretNom)) &&
          saleProducts.some(sp => sp && (pretDesc.includes(sp) || sp.includes(pretDesc)));
      });

      setLinkedPrets(linked);
    } catch (error) {
      // silently fail
    }
  };

  const handleSearch = useCallback(async (value: string) => {
    setClientSearch(value);
    if (value.length >= 3) {
      setIsSearching(true);
      try {
        const results = await remboursementApiService.searchSalesByClient(value);
        // Filtrer par l'année sélectionnée
        const filteredByYear = results.filter((sale: Sale) => {
          const saleDate = new Date(sale.date);
          return saleDate.getFullYear() === selectedYear;
        });
        setSearchResults(filteredByYear);
      } catch (error) {
        // silently fail
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [selectedYear]);

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    setSearchResults([]);
    setClientSearch(sale.clientName || '');
    initRefundProducts(sale);
    checkLinkedPrets(sale);
  };

  const removeProduct = (index: number) => {
    if (refundProducts.length <= 1) return;
    setRefundProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, value: string) => {
    const qty = Math.max(1, Math.min(Number(value) || 1, refundProducts[index].maxQuantity));
    setRefundProducts(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantitySold: qty,
        profit: (qty * updated[index].refundPriceUnit) - (qty * updated[index].purchasePriceUnit)
      };
      return updated;
    });
  };

  const updateRefundPrice = (index: number, value: string) => {
    const price = Number(value) || 0;
    setRefundProducts(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        refundPriceUnit: price,
        profit: (updated[index].quantitySold * price) - (updated[index].quantitySold * updated[index].purchasePriceUnit)
      };
      return updated;
    });
  };

  const totals = refundProducts.reduce((acc, p) => ({
    totalRefundPrice: acc.totalRefundPrice + (p.quantitySold * p.refundPriceUnit),
    totalPurchasePrice: acc.totalPurchasePrice + (p.quantitySold * p.purchasePriceUnit),
    totalProfit: acc.totalProfit + p.profit
  }), { totalRefundPrice: 0, totalPurchasePrice: 0, totalProfit: 0 });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR');

  // All refunds now use original prices, so all products qualify for stock restore
  const getFullRefundProducts = (): RefundProduct[] => {
    return refundProducts;
  };

  const handlePretOnRefund = async () => {
    if (linkedPrets.length === 0) return;

    for (const pret of linkedPrets) {
      try {
        const refundedDescriptions = refundProducts.map(p => p.description.toLowerCase());
        const pretDesc = (pret.description || '').toLowerCase();
        const isLinked = refundedDescriptions.some(desc => pretDesc.includes(desc) || desc.includes(pretDesc));
        if (!isLinked) continue;

        if (pretAction === 'delete') {
          await pretProduitApiService.delete(pret.id);
        } else {
          const refundTotal = totals.totalRefundPrice;
          const newAvance = Math.max(0, (pret.avanceRecue || 0) - refundTotal);
          const newReste = (pret.prixVente || 0) - newAvance;

          if (newAvance <= 0) {
            await pretProduitApiService.delete(pret.id);
          } else {
            await pretProduitApiService.update(pret.id, {
              avanceRecue: newAvance,
              reste: newReste,
              estPaye: newReste <= 0
            });
          }
        }
      } catch (error) {
        // silently fail
      }
    }
  };

  const handlePreSubmit = () => {
    if (!selectedSale || refundProducts.length === 0) return;

    // Check which products are full refund (price matches original)
    const fullRefundProducts = getFullRefundProducts();

    if (fullRefundProducts.length > 0) {
      // Show stock confirmation modal for full refund products
      setStockRestoreProducts(fullRefundProducts);
      setShowStockConfirm(true);
    } else {
      // All partial (price changed) → no stock restore needed
      handleSubmit(false);
    }
  };

  const handleSubmit = async (restoreStock: boolean) => {
    if (!selectedSale || refundProducts.length === 0) return;
    setIsSubmitting(true);
    setShowStockConfirm(false);

    try {
      await handlePretOnRefund();

      // Determine which products to restore stock for
      const productsToRestore = restoreStock ? stockRestoreProducts.map(p => p.productId) : [];

      await remboursementApiService.create({
        originalSaleId: selectedSale.id,
        date,
        products: refundProducts.map(p => {
          // Si le prix de remboursement unitaire a été modifié par rapport au prix de vente original,
          // alors quantitySold = 0 → pas de changement de stock
          const absoluteQuantity = Math.abs(p.quantitySold);
          const effectiveQuantity = -absoluteQuantity;
          const totalRefundAmount = absoluteQuantity * p.refundPriceUnit;
          const totalPurchaseAmount = absoluteQuantity * p.purchasePriceUnit;

          return {
            productId: p.productId,
            description: p.description,
            quantitySold: effectiveQuantity,
            sellingPrice: totalRefundAmount,
            refundPrice: totalRefundAmount,
            refundPriceUnit: p.refundPriceUnit,
            purchasePrice: totalPurchaseAmount,
            profit: p.profit
          };
        }),
        totalRefundPrice: totals.totalRefundPrice,
        totalPurchasePrice: totals.totalPurchasePrice,
        totalProfit: totals.totalProfit,
        clientName: selectedSale.clientName,
        clientPhone: selectedSale.clientPhone,
        clientAddress: selectedSale.clientAddress,
        restoreStock,
        productsToRestore
      });

      toast({
        title: "✅ Remboursement enregistré",
        description: `Remboursement de ${formatCurrency(totals.totalRefundPrice)} effectué avec succès${restoreStock ? ' (stock restauré)' : ''}${linkedPrets.length > 0 ? ' (prêt produit mis à jour)' : ''}`,
        className: "notification-success",
      });

      if (refreshData) await refreshData();
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du remboursement",
        variant: "destructive",
        className: "notification-erreur",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto
          bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-900 dark:to-amber-950/30
          backdrop-blur-xl border border-amber-100/50 dark:border-amber-800/30
          shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)]
          rounded-2xl sm:rounded-3xl">

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
                <RotateCcw className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Remboursement
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
              Recherchez un client et sélectionnez la vente à rembourser
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-white/70 font-semibold">Date du remboursement</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-gray-100/60 dark:bg-white/[0.06] border-gray-200/80 dark:border-white/[0.1] text-gray-900 dark:text-white rounded-xl shadow-sm"
              />
            </div>

            {/* Choix année */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-white/70 font-semibold">Année de recherche</Label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setSearchResults([]);
                  setSelectedSale(null);
                  setRefundProducts([]);
                  if (clientSearch.length >= 3) {
                    handleSearch(clientSearch);
                  }
                }}
                className="w-full h-10 px-3 rounded-xl bg-gray-100/60 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/[0.1] text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Search client */}
            {!selectedSale && (
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-white/70 font-semibold">Rechercher par nom du client (min. 3 caractères)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-white/30" />
                  <Input
                    value={clientSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Nom du client..."
                    className="pl-10 bg-gray-100/60 dark:bg-white/[0.06] border-gray-200/80 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 rounded-xl shadow-sm"
                  />
                </div>

                {isSearching && <p className="text-sm text-gray-400 dark:text-white/40">Recherche en cours...</p>}

                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border border-gray-200/60 dark:border-white/[0.08] rounded-xl divide-y divide-gray-100 dark:divide-white/[0.06] bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm shadow-lg">
                    {searchResults.map((sale) => (
                      <div
                        key={sale.id}
                        onClick={() => handleSelectSale(sale)}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-white/[0.06] cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm text-gray-800 dark:text-white/90">{sale.clientName}</p>
                            <p className="text-xs text-gray-500 dark:text-white/40">
                              {sale.products
                                ? sale.products.map(p => p.description).join(', ')
                                : sale.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(sale.totalSellingPrice || sale.sellingPrice || 0)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-white/40">{formatDate(sale.date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {clientSearch.length >= 3 && !isSearching && searchResults.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-white/40">Aucune vente trouvée pour ce client</p>
                )}
              </div>
            )}

            {/* Selected sale info */}
            {selectedSale && (
              <>
                <div className="p-4 bg-amber-50/80 dark:bg-amber-500/[0.06] border border-amber-200/60 dark:border-amber-500/20 rounded-xl backdrop-blur-sm shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        Vente sélectionnée - {selectedSale.clientName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
                        Date: {formatDate(selectedSale.date)} •
                        Total: {formatCurrency(selectedSale.totalSellingPrice || selectedSale.sellingPrice || 0)}
                      </p>
                    </div>
                    {!editSale && (
                      <Button variant="ghost" size="sm" onClick={resetForm} className="text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                        <X className="h-4 w-4" /> Changer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Linked Pret Produit Warning */}
                {linkedPrets.length > 0 && (
                  <div className="p-4 bg-yellow-50/80 dark:bg-yellow-500/[0.06] border border-yellow-200/60 dark:border-yellow-500/20 rounded-xl backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <p className="font-bold text-sm text-yellow-700 dark:text-yellow-400">
                        ⚠️ Cette vente a {linkedPrets.length} prêt(s) produit avec avance
                      </p>
                    </div>
                    {linkedPrets.map(pret => (
                      <div key={pret.id} className="text-xs text-gray-600 dark:text-white/50 mb-1">
                        • {pret.description} — Avance: {formatCurrency(pret.avanceRecue || 0)} / Reste: {formatCurrency(pret.reste || 0)}
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <Button
                        type="button"
                        size="sm"
                        variant={pretAction === 'delete' ? 'default' : 'outline'}
                        onClick={() => setPretAction('delete')}
                        className={pretAction === 'delete'
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/30'
                          : 'bg-gray-50 dark:bg-white/[0.04] text-gray-600 dark:text-white/50 border-gray-200 dark:border-white/[0.1] hover:bg-gray-100 dark:hover:bg-white/[0.08]'}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Supprimer le prêt
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={pretAction === 'modify' ? 'default' : 'outline'}
                        onClick={() => setPretAction('modify')}
                        className={pretAction === 'modify'
                          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-200 dark:hover:bg-blue-500/30'
                          : 'bg-gray-50 dark:bg-white/[0.04] text-gray-600 dark:text-white/50 border-gray-200 dark:border-white/[0.1] hover:bg-gray-100 dark:hover:bg-white/[0.08]'}
                      >
                        <Edit3 className="h-3 w-3 mr-1" /> Modifier l'avance
                      </Button>
                    </div>
                  </div>
                )}

                {/* Products to refund */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700 dark:text-white/70">Produits à rembourser</Label>
                  {refundProducts.map((product, index) => (
                    <div
                      key={index}
                      className="p-4
                        bg-gray-50/80 dark:bg-white/[0.04]
                        border border-gray-200/60 dark:border-white/[0.08]
                        rounded-xl backdrop-blur-sm space-y-3 transition-all duration-300
                        hover:border-amber-300 dark:hover:border-amber-500/20
                        shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20">
                            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-bold text-sm text-gray-800 dark:text-white/90">{product.description}</span>
                        </div>
                        {refundProducts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProduct(index)}
                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500 dark:text-white/50">Quantité (max: {product.maxQuantity})</Label>
                          <Input
                            type="number"
                            min="1"
                            max={product.maxQuantity}
                            value={product.quantitySold}
                            onChange={(e) => updateQuantity(index, e.target.value)}
                            className="bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white rounded-xl shadow-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500 dark:text-white/50">Prix remb. unitaire (€)</Label>
                          <div className="h-10 flex items-center px-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.1] font-semibold text-gray-700 dark:text-white/70 text-sm shadow-sm cursor-not-allowed">
                            {formatCurrency(product.refundPriceUnit)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500 dark:text-white/50">Total remboursement</Label>
                          <div className="h-10 flex items-center px-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 font-black text-amber-700 dark:text-amber-400 text-sm shadow-sm">
                            {formatCurrency(product.quantitySold * product.refundPriceUnit)}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-white/40">
                        Prix d'achat unitaire: {formatCurrency(product.purchasePriceUnit)} •
                        Bénéfice: <span className={product.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {formatCurrency(product.profit)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-500/[0.06] dark:to-orange-500/[0.06] border border-amber-200/60 dark:border-amber-500/20 rounded-xl backdrop-blur-sm shadow-sm">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40">Total remboursement</p>
                      <p className="text-lg font-black text-amber-700 dark:text-amber-400">
                        {formatCurrency(totals.totalRefundPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40">Coût d'achat</p>
                      <p className="text-lg font-black text-gray-600 dark:text-white/60">
                        {formatCurrency(totals.totalPurchasePrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40">Impact bénéfice</p>
                      <p className="text-lg font-black text-red-600 dark:text-red-400">
                        -{formatCurrency(Math.abs(totals.totalProfit))}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:text-gray-900 dark:hover:text-white"
            >
              Annuler
            </Button>
            <Button
              onClick={handlePreSubmit}
              disabled={isSubmitting || !selectedSale || refundProducts.length === 0}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg border border-amber-400/20"
            >
              {isSubmitting ? 'Enregistrement...' : '✓ Valider le remboursement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock restore confirmation modal */}
      <Dialog open={showStockConfirm} onOpenChange={setShowStockConfirm}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30 backdrop-blur-xl border border-emerald-100/50 dark:border-emerald-800/30 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                <PackageCheck className="h-5 w-5" />
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                Remettre en stock ?
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-white/50">
              Les produits suivants ont été remboursés au prix intégral. Voulez-vous les remettre en stock ?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-4">
            {stockRestoreProducts.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{p.description}</span>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +{p.quantitySold} unité(s)
                </span>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-white/70"
            >
              Non, ne pas remettre
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg"
            >
              <PackageCheck className="h-4 w-4 mr-2" />
              {isSubmitting ? 'En cours...' : 'Oui, remettre en stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RefundForm;
