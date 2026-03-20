/**
 * useComptabilite - Hook personnalisé pour la logique métier du module Comptabilité
 * 
 * Ce hook centralise toute la logique métier, les états et les calculs
 * du module comptabilité, permettant au composant principal d'être propre et minimal.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import nouvelleAchatApiService from '@/services/api/nouvelleAchatApi';
import comptaApiService from '@/services/api/comptaApi';
import fournisseurApiService, { Fournisseur } from '@/services/api/fournisseurApi';
import { NouvelleAchat, NouvelleAchatFormData, DepenseFormData, ComptabiliteData } from '@/types/comptabilite';
import { Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';

// Constantes
export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Types pour les états des modales
export interface ModalStates {
  showAchatForm: boolean;
  showDepenseForm: boolean;
  showExportDialog: boolean;
  showCreditModal: boolean;
  showDebitModal: boolean;
  showBeneficeVentesModal: boolean;
  showAchatsProduitsModal: boolean;
  showAutresDepensesModal: boolean;
  showSoldeNetModal: boolean;
  showBeneficeReelModal: boolean;
}

// Types pour les données de graphiques
export interface BarChartData {
  name: string;
  beneficeVentes: number;
  depenses: number;
  beneficeReel: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

export function useComptabilite() {
  const { products, allSales, fetchProducts } = useApp();
  const { formatEuro } = useCurrencyFormatter();
  
  // États de sélection de période
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  
  // États des données
  const [achats, setAchats] = useState<NouvelleAchat[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [fournisseurSearch, setFournisseurSearch] = useState('');
  const [showFournisseurList, setShowFournisseurList] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // États des modales
  const [modalStates, setModalStates] = useState<ModalStates>({
    showAchatForm: false,
    showDepenseForm: false,
    showExportDialog: false,
    showCreditModal: false,
    showDebitModal: false,
    showBeneficeVentesModal: false,
    showAchatsProduitsModal: false,
    showAutresDepensesModal: false,
    showSoldeNetModal: false,
    showBeneficeReelModal: false,
  });
  
  // États du formulaire d'achat
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductList, setShowProductList] = useState(false);
  const [achatForm, setAchatForm] = useState<NouvelleAchatFormData>({
    productDescription: '',
    purchasePrice: 0,
    quantity: 0,
    fournisseur: '',
    caracteristiques: '',
    date: ''
  });
  
  // États du formulaire de dépense
  const [depenseForm, setDepenseForm] = useState<DepenseFormData>({
    description: '',
    montant: 0,
    type: 'autre_depense',
    categorie: 'divers',
    date: ''
  });

  // Ref pour éviter les appels multiples
  const loadingRef = useRef(false);

  // Fonction pour ouvrir/fermer les modales
  const toggleModal = useCallback((modalName: keyof ModalStates, value?: boolean) => {
    setModalStates(prev => ({
      ...prev,
      [modalName]: value !== undefined ? value : !prev[modalName]
    }));
  }, []);

  // Filtrer les produits pour la recherche (par description OU code unique)
  const filteredProducts = useMemo(() => {
    if (searchTerm.length < 3 || !showProductList) return [];
    return products.filter(p => 
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, products, showProductList]);

  // Charger les achats
  const loadAchats = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      const data = await nouvelleAchatApiService.getByMonthYear(selectedYear, selectedMonth);
      setAchats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadAchats();
  }, [loadAchats]);

  // Charger les fournisseurs
  const loadFournisseurs = useCallback(async () => {
    try {
      const data = await fournisseurApiService.getAll();
      setFournisseurs(data);
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error);
    }
  }, []);

  useEffect(() => {
    loadFournisseurs();
  }, [loadFournisseurs]);

  // Fournisseurs filtrés pour l'autocomplete
  const filteredFournisseurs = useMemo(() => {
    if (!fournisseurSearch || fournisseurSearch.length < 1 || !showFournisseurList) return [];
    return fournisseurs.filter(f =>
      f.nom.toLowerCase().includes(fournisseurSearch.toLowerCase())
    );
  }, [fournisseurSearch, fournisseurs, showFournisseurList]);

  // Ventes du mois
  const monthlySales = useMemo(() => {
    return allSales.filter(sale => {
      const date = new Date(sale.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [allSales, selectedMonth, selectedYear]);

  // Calculer les statistiques de comptabilité
  const comptabiliteData = useMemo<ComptabiliteData>(() => {
    const salesTotal = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalSellingPrice || 0);
      }
      return sum + (sale.sellingPrice * sale.quantitySold);
    }, 0);

    const salesCost = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalPurchasePrice || 0);
      }
      return sum + (sale.purchasePrice * sale.quantitySold);
    }, 0);

    const salesProfit = monthlySales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return sum + (sale.totalProfit || 0);
      }
      return sum + sale.profit;
    }, 0);

    const salesCount = monthlySales.length;

    const achatsProducts = achats.filter(a => a.type === 'achat_produit');
    const depenses = achats.filter(a => a.type !== 'achat_produit');

    const achatsTotal = achatsProducts.reduce((sum, a) => sum + a.totalCost, 0);
    const depensesTotal = depenses.reduce((sum, a) => sum + a.totalCost, 0);

    const beneficeReel = salesProfit - (achatsTotal + depensesTotal);

    const totalCredit = salesTotal;
    const totalDebit = achatsTotal + depensesTotal;
    const soldeNet = totalCredit - totalDebit;

    return {
      salesTotal,
      salesProfit,
      salesCost,
      salesCount,
      achatsTotal,
      depensesTotal,
      beneficeReel,
      totalDebit,
      totalCredit,
      soldeNet
    };
  }, [monthlySales, achats]);

  // Sauvegarder les données de comptabilité
  const saveComptaData = useCallback(async () => {
    try {
      await comptaApiService.calculateMonth(selectedYear, selectedMonth);
    } catch (error) {
      console.error('Erreur sauvegarde compta:', error);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (comptabiliteData && (comptabiliteData.salesCount > 0 || achats.length > 0)) {
      saveComptaData();
    }
  }, [comptabiliteData, achats.length, saveComptaData]);

  // Données pour les graphiques mensuels
  const monthlyChartData = useMemo<BarChartData[]>(() => {
    const data: BarChartData[] = [];
    for (let i = 1; i <= 12; i++) {
      const monthSales = allSales.filter(sale => {
        const date = new Date(sale.date);
        return date.getMonth() + 1 === i && date.getFullYear() === selectedYear;
      });

      const profit = monthSales.reduce((sum, sale) => {
        if (sale.products && Array.isArray(sale.products)) {
          return sum + (sale.totalProfit || 0);
        }
        return sum + sale.profit;
      }, 0);

      const monthAchats = achats.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() + 1 === i;
      });

      const depenses = monthAchats.reduce((sum, a) => sum + a.totalCost, 0);
      const beneficeReel = profit - depenses;

      data.push({
        name: MONTHS[i - 1].slice(0, 3),
        beneficeVentes: profit,
        depenses: depenses,
        beneficeReel: beneficeReel
      });
    }
    return data;
  }, [allSales, achats, selectedYear]);

  // Répartition des dépenses
  const depensesRepartition = useMemo<PieChartData[]>(() => {
    const byType: Record<string, number> = {};
    achats.forEach(a => {
      const label = a.type === 'achat_produit' ? 'Achats Produits' : 
                   a.type === 'taxes' ? 'Taxes' :
                   a.type === 'carburant' ? 'Carburant' : 'Autres';
      byType[label] = (byType[label] || 0) + a.totalCost;
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [achats]);

  // Handler sélection produit
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.description);
    setShowProductList(false);
    setAchatForm(prev => ({
      ...prev,
      productId: product.id,
      productDescription: product.description,
      purchasePrice: 0,
      quantity: 0,
      fournisseur: prev.fournisseur || '',
      caracteristiques: prev.caracteristiques || product.description
    }));
  }, []);

  // Handler soumission achat
  const handleSubmitAchat = useCallback(async () => {
    try {
      if (!achatForm.productDescription || achatForm.quantity <= 0 || !achatForm.date) {
        toast({
          title: 'Erreur',
          description: 'Veuillez remplir la description, la quantité et la date',
          variant: 'destructive'
        });
        return;
      }

      const finalPurchasePrice = achatForm.purchasePrice > 0 
        ? achatForm.purchasePrice 
        : (selectedProduct?.purchasePrice || 0);

      await nouvelleAchatApiService.create({
        productId: selectedProduct?.id,
        productDescription: achatForm.productDescription,
        purchasePrice: finalPurchasePrice,
        quantity: achatForm.quantity,
        fournisseur: achatForm.fournisseur,
        caracteristiques: achatForm.caracteristiques,
        date: achatForm.date
      });

      if (selectedProduct) {
        const nameChanged = achatForm.productDescription !== selectedProduct.description;
        toast({
          title: 'Succès',
          description: `Stock mis à jour: +${achatForm.quantity} unités${
            achatForm.purchasePrice > 0
              ? `, nouveau prix: ${formatEuro(achatForm.purchasePrice)}`
              : ''
          }${nameChanged ? `, nom modifié` : ''}`,
          className: 'bg-green-600 text-white border-green-700'
        });
      } else {
        toast({
          title: '🆕 Nouveau produit créé',
          description: `"${achatForm.productDescription}" ajouté à l'inventaire avec ${achatForm.quantity} unités`,
          className: 'bg-blue-600 text-white border-blue-700'
        });
      }

      // Réinitialiser
      setAchatForm({
        productDescription: '',
        purchasePrice: 0,
        quantity: 0,
        fournisseur: '',
        caracteristiques: '',
        date: ''
      });
      setSelectedProduct(null);
      setSearchTerm('');
      setShowProductList(false);
      setFournisseurSearch('');
      setShowFournisseurList(false);
      toggleModal('showAchatForm', false);
      
      loadAchats();
      fetchProducts();
      loadFournisseurs();
      fetchProducts();
    } catch (error) {
      console.error('Erreur enregistrement achat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer l\'achat',
        variant: 'destructive'
      });
    }
  }, [achatForm, selectedProduct, loadAchats, fetchProducts, formatEuro, toggleModal]);

  // Handler soumission dépense
  const handleSubmitDepense = useCallback(async () => {
    try {
      if (!depenseForm.description || depenseForm.montant <= 0 || !depenseForm.date) {
        toast({
          title: 'Erreur',
          description: 'Veuillez remplir tous les champs obligatoires',
          variant: 'destructive'
        });
        return;
      }

      await nouvelleAchatApiService.addDepense({
        ...depenseForm,
        date: depenseForm.date
      });
      
      toast({
        title: 'Succès',
        description: 'Dépense enregistrée avec succès',
        className: 'bg-green-600 text-white border-green-700'
      });
      
      setDepenseForm({
        description: '',
        montant: 0,
        type: 'autre_depense',
        categorie: 'divers',
        date: ''
      });
      
      toggleModal('showDepenseForm', false);
      loadAchats();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la dépense',
        variant: 'destructive'
      });
    }
  }, [depenseForm, loadAchats, toggleModal]);

  // Handler mise à jour achat/dépense
  const handleUpdateAchat = useCallback(async (id: string, data: Partial<NouvelleAchat>) => {
    try {
      await nouvelleAchatApiService.update(id, data);
      toast({
        title: 'Succès',
        description: 'Achat/dépense modifié avec succès',
        className: 'bg-green-600 text-white border-green-700'
      });
      loadAchats();
      fetchProducts();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'achat/dépense',
        variant: 'destructive'
      });
    }
  }, [loadAchats, fetchProducts]);

  // Handler suppression achat/dépense
  const handleDeleteAchat = useCallback(async (id: string) => {
    try {
      await nouvelleAchatApiService.delete(id);
      toast({
        title: 'Succès',
        description: 'Achat/dépense supprimé avec succès',
        className: 'bg-green-600 text-white border-green-700'
      });
      loadAchats();
      fetchProducts();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'achat/dépense',
        variant: 'destructive'
      });
    }
  }, [loadAchats, fetchProducts]);

  // Handlers pour les changements de période
  const handleMonthChange = useCallback((v: string) => {
    setSelectedMonth(parseInt(v));
  }, []);

  const handleYearChange = useCallback((v: string) => {
    setSelectedYear(parseInt(v));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowProductList(value.length >= 3);
    if (value.length < 3) {
      setSelectedProduct(null);
    }
  }, []);

  const handleAchatFormChange = useCallback((field: keyof NouvelleAchatFormData, value: string | number) => {
    setAchatForm(prev => ({ ...prev, [field]: value }));
    // Sync fournisseur search with form field
    if (field === 'fournisseur') {
      setFournisseurSearch(value as string);
      setShowFournisseurList((value as string).length >= 1);
    }
  }, []);

  const handleSelectFournisseur = useCallback((nom: string) => {
    setAchatForm(prev => ({ ...prev, fournisseur: nom }));
    setFournisseurSearch(nom);
    setShowFournisseurList(false);
  }, []);

  const handleDepenseFormChange = useCallback((field: keyof DepenseFormData, value: string | number) => {
    setDepenseForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    // Données
    products,
    allSales,
    achats,
    loading,
    comptabiliteData,
    monthlySales,
    monthlyChartData,
    depensesRepartition,
    filteredProducts,
    filteredFournisseurs,
    fournisseurSearch,
    showFournisseurList,
    
    // États de sélection
    selectedMonth,
    selectedYear,
    exportMonth,
    exportYear,
    setExportMonth,
    setExportYear,
    
    // États des modales
    modalStates,
    toggleModal,
    
    // États formulaire achat
    searchTerm,
    selectedProduct,
    showProductList,
    achatForm,
    
    // États formulaire dépense
    depenseForm,
    
    // Handlers
    handleMonthChange,
    handleYearChange,
    handleSearchChange,
    handleSelectProduct,
    handleAchatFormChange,
    handleSelectFournisseur,
    handleDepenseFormChange,
    handleSubmitAchat,
    handleSubmitDepense,
    handleUpdateAchat,
    handleDeleteAchat,
    loadAchats,
    
    // Utilitaires
    formatEuro,
    fetchProducts,
  };
}

export default useComptabilite;
