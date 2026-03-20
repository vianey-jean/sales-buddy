import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Product, SaleProduct, Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Package } from 'lucide-react';
import ProductPhotoSlideshow from '../ProductPhotoSlideshow';
import { calculateSaleProfit } from './utils/saleCalculations';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import AdvancePaymentModal from './AdvancePaymentModal';
import PretProduitFromSaleModal from './PretProduitFromSaleModal';
import axios from 'axios';
import { setFormProtection } from '@/hooks/use-realtime-sync';

// Sub-components
import SaleClientSection from './sections/SaleClientSection';
import SaleProductCard from './sections/SaleProductCard';
import SaleTotalsSection from './sections/SaleTotalsSection';
import SaleFormActions from './sections/SaleFormActions';
import ReservedProductModal from './modals/ReservedProductModal';
import { FormProduct, createEmptyFormProduct } from './types/saleFormTypes';

interface MultiProductSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
  onRefund?: (sale: Sale) => void;
}

const MultiProductSaleForm: React.FC<MultiProductSaleFormProps> = ({ isOpen, onClose, editSale, onRefund }) => {
  const { products, addSale, updateSale, deleteSale } = useApp();
  const { toast } = useToast();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [formProducts, setFormProducts] = useState<FormProduct[]>([createEmptyFormProduct()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'sale' | 'product', index?: number } | null>(null);
  
  // États pour la fonctionnalité Avance
  const [showAdvanceSection, setShowAdvanceSection] = useState(false);
  const [avancePrice, setAvancePrice] = useState('');
  const [reste, setReste] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  
  // États pour la modale de paiement d'avance sur prêts existants
  const [advancePaymentModalOpen, setAdvancePaymentModalOpen] = useState(false);
  const [currentAdvanceProductIndex, setCurrentAdvanceProductIndex] = useState<number | null>(null);
  
  // États pour la modale de création de prêt produit
  const [pretProduitModalOpen, setPretProduitModalOpen] = useState(false);
  const [currentPretProductIndex, setCurrentPretProductIndex] = useState<number | null>(null);

  // États pour la modale de confirmation produit réservé
  const [reservedModalOpen, setReservedModalOpen] = useState(false);
  const [pendingReservedProduct, setPendingReservedProduct] = useState<{ product: Product; index: number } | null>(null);
  // État pour la modale de suppression de réservation bloquante
  const [reservationConflictModalOpen, setReservationConflictModalOpen] = useState(false);
  const [conflictingReservation, setConflictingReservation] = useState<any>(null);
  const [pendingConflictProduct, setPendingConflictProduct] = useState<{ product: Product; index: number } | null>(null);
  // État pour le slideshow photo produit
  const [slideshowProduct, setSlideshowProduct] = useState<{ photos: string[]; mainPhoto?: string; name: string } | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // Référence pour éviter les réinitialisations multiples
  const isInitializedRef = useRef(false);
  const lastEditSaleIdRef = useRef<string | null>(null);

  // Activer/désactiver la protection de synchronisation quand le formulaire s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      setFormProtection(true);
      console.log('Protection formulaire activée - synchronisation bloquée');
    } else {
      setFormProtection(false);
      console.log('Protection formulaire désactivée - synchronisation autorisée');
      isInitializedRef.current = false;
      lastEditSaleIdRef.current = null;
    }
    return () => { setFormProtection(false); };
  }, [isOpen]);

  // Réinitialiser le formulaire UNIQUEMENT à l'ouverture initiale ou changement de vente
  useEffect(() => {
    const loadSaleData = async () => {
      const editSaleId = editSale?.id || null;
      const shouldInitialize = isOpen && (!isInitializedRef.current || lastEditSaleIdRef.current !== editSaleId);
      
      if (!shouldInitialize) return;

      isInitializedRef.current = true;
      lastEditSaleIdRef.current = editSaleId;

      if (editSale) {
        setDate(new Date(editSale.date).toISOString().split('T')[0]);
        setClientName(editSale.clientName || '');
        setClientPhone(editSale.clientPhone || '');
        setClientAddress(editSale.clientAddress || '');
        
        const hasReste = editSale.reste && editSale.reste > 0;
        if (hasReste) {
          setShowAdvanceSection(true);
          setAvancePrice(editSale.totalSellingPrice?.toString() || '0');
          setReste(editSale.reste.toString());
          
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/pretproduits`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const pretProduit = response.data.find((p: any) => 
              p.nom === editSale.clientName && p.date === editSale.date
            );
            if (pretProduit && pretProduit.datePaiement) {
              setNextPaymentDate(new Date(pretProduit.datePaiement).toISOString().split('T')[0]);
            }
          } catch (error) {
            console.error('Erreur lors du chargement de la date de paiement:', error);
          }
        } else {
          setShowAdvanceSection(false);
          setAvancePrice('');
          setReste('');
          setNextPaymentDate('');
        }
        
        if (editSale.products && editSale.products.length > 0) {
          const loadedProducts = editSale.products.map(saleProduct => {
            const product = products.find(p => p.id === saleProduct.productId);
            const isAdvance = saleProduct.description.toLowerCase().includes('avance');
            const absQuantity = Math.abs(saleProduct.quantitySold) || 1;
            const purchasePriceUnit = isAdvance ? saleProduct.purchasePrice : (saleProduct.purchasePrice / absQuantity);
            const sellingPriceUnit = isAdvance ? saleProduct.sellingPrice : (saleProduct.sellingPrice / absQuantity);
            const isPret = saleProduct.description.toLowerCase().includes('prêt') || 
                           saleProduct.description.toLowerCase().includes('pret');
            
            return {
              productId: saleProduct.productId,
              description: saleProduct.description,
              sellingPriceUnit: sellingPriceUnit.toString(),
              quantitySold: saleProduct.quantitySold.toString(),
              purchasePriceUnit: purchasePriceUnit.toString(),
              profit: saleProduct.profit.toString(),
              selectedProduct: product || null,
              maxQuantity: product ? (product.quantity || 0) + Math.abs(saleProduct.quantitySold) : 0,
              isAdvanceProduct: isAdvance,
              isPretProduit: isPret,
              deliveryLocation: saleProduct.deliveryLocation || 'Saint-Denis',
              deliveryFee: (saleProduct.deliveryFee || 0).toString(),
              avancePretProduit: isPret && saleProduct.sellingPrice > 0 ? saleProduct.sellingPrice.toString() : ''
            };
          });
          setFormProducts(loadedProducts);
        }
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setClientName('');
        setClientPhone('');
        setClientAddress('');
        setFormProducts([createEmptyFormProduct()]);
        setShowAdvanceSection(false);
        setAvancePrice('');
        setReste('');
        setNextPaymentDate('');
      }
    };
    loadSaleData();
  }, [isOpen, editSale]);

  // Gestion du client
  const handleClientSelect = (client: any) => {
    if (client) {
      setClientName(client.nom);
      setClientPhone(client.phone);
      setClientAddress(client.adresse);
    } else {
      setClientPhone('');
      setClientAddress('');
    }
  };

  // Ajouter un nouveau produit
  const addNewProduct = () => {
    setFormProducts(prev => [...prev, createEmptyFormProduct()]);
  };

  // Confirmer suppression d'un produit
  const handleDeleteProduct = (index: number) => {
    setDeleteTarget({ type: 'product', index });
    setDeleteDialogOpen(true);
  };

  // Confirmer suppression de toute la vente
  const handleDeleteSale = () => {
    setDeleteTarget({ type: 'sale' });
    setDeleteDialogOpen(true);
  };

  // Exécuter la suppression confirmée - avec gestion stock vente vs remboursement
  const executeDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      if (deleteTarget.type === 'product' && deleteTarget.index !== undefined) {
        // Supprimer un produit individuel
        if (formProducts.length > 1) {
          setFormProducts(prev => prev.filter((_, i) => i !== deleteTarget.index));
          toast({
            title: "Produit supprimé",
            description: "Le produit a été retiré de la vente",
            className: "notification-success",
          });
        }
      } else if (deleteTarget.type === 'sale' && editSale && deleteSale) {
        // Vérifier si c'est un remboursement
        const isRefund = editSale.isRefund === true;

        if (isRefund) {
          // REMBOURSEMENT: soustraire la quantité du stock
          // deleteSale va ajouter les quantités au stock (comportement par défaut du backend),
          // donc on doit compenser en soustrayant 2x la quantité pour obtenir un net de -quantité
          const token = localStorage.getItem('token');
          const saleProducts = editSale.products || [];

          // D'abord supprimer la vente (le backend va ajouter les quantités au stock)
          const success = await deleteSale(editSale.id);

          if (success) {
            // Maintenant soustraire 2x les quantités pour compenser l'ajout du backend + la soustraction voulue
            for (const sp of saleProducts) {
              if (sp.productId && sp.quantitySold > 0) {
                try {
                  // Récupérer le produit actuel pour connaître sa quantité après l'ajout du backend
                  const productResponse = await axios.get(`${API_BASE_URL}/api/products/${sp.productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const currentProduct = productResponse.data;
                  const newQuantity = (currentProduct.quantity || 0) - (2 * sp.quantitySold);
                  
                  await axios.put(`${API_BASE_URL}/api/products/${sp.productId}`, {
                    quantity: Math.max(0, newQuantity)
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  console.log(`📦 Stock ajusté (remboursement supprimé): ${sp.description} → -${sp.quantitySold}`);
                } catch (err) {
                  console.error(`Erreur ajustement stock produit ${sp.productId}:`, err);
                }
              }
            }
            toast({
              title: "Succès",
              description: "Le remboursement a été supprimé et le stock a été ajusté",
              className: "notification-success",
            });
            onClose();
          }
        } else {
          // VENTE NORMALE: deleteSale gère déjà la restauration du stock via le backend
          const success = await deleteSale(editSale.id);
          if (success) {
            toast({
              title: "Succès",
              description: "La vente a été supprimée et le stock a été restauré",
              className: "notification-success",
            });
            onClose();
          }
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
        className: "notification-erreur",
      });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  // Sélection d'un produit - vérifie les réservations bloquantes
  const handleProductSelect = async (product: Product, index: number) => {
    // Vérifier les réservations actives qui bloquent le stock
    try {
      const token = localStorage.getItem('token');
      const commandesResponse = await axios.get(`${API_BASE_URL}/api/commandes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allCommandes = commandesResponse.data;
      
      // Calculer la quantité réservée pour ce produit
      let reservedQty = 0;
      let blockingReservation: any = null;
      allCommandes.forEach((c: any) => {
        if (c.statut === 'valide' || c.statut === 'annule') return;
        if (c.type !== 'reservation') return;
        c.produits?.forEach((p: any) => {
          if (p.nom.toLowerCase() === product.description.toLowerCase()) {
            reservedQty += p.quantite;
            if (!blockingReservation) blockingReservation = c;
          }
        });
      });
      
      const availableQty = product.quantity - reservedQty;
      
      // Si tout le stock est réservé, proposer de supprimer la réservation
      if (availableQty <= 0 && blockingReservation) {
        setConflictingReservation(blockingReservation);
        setPendingConflictProduct({ product, index });
        setReservationConflictModalOpen(true);
        return;
      }
    } catch (error) {
      console.error('Erreur vérification réservations:', error);
    }

    if ((product as any).reserver === 'oui' && product.quantity === 1) {
      setPendingReservedProduct({ product, index });
      setReservedModalOpen(true);
      return;
    }
    applyProductSelection(product, index);
  };

  // Confirmation de vente d'un produit réservé
  const handleReservedConfirm = () => {
    if (pendingReservedProduct) {
      applyProductSelection(pendingReservedProduct.product, pendingReservedProduct.index);
    }
    setReservedModalOpen(false);
    setPendingReservedProduct(null);
  };

  // Refus de vente d'un produit réservé → fermer tout
  const handleReservedCancel = () => {
    setReservedModalOpen(false);
    setPendingReservedProduct(null);
    onClose();
  };

  // Confirmer la suppression d'une réservation bloquante
  const handleConflictReservationDelete = async () => {
    if (!conflictingReservation || !pendingConflictProduct) return;
    try {
      const token = localStorage.getItem('token');
      // Supprimer la réservation
      await axios.delete(`${API_BASE_URL}/api/commandes/${conflictingReservation.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Supprimer le RDV lié s'il existe
      try {
        const rdvResponse = await axios.get(`${API_BASE_URL}/api/rdv`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const rdvToDelete = rdvResponse.data.find((r: any) => r.commandeId === conflictingReservation.id);
        if (rdvToDelete) {
          await axios.delete(`${API_BASE_URL}/api/rdv/${rdvToDelete.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (rdvErr) {
        console.error('Erreur suppression RDV lié:', rdvErr);
      }
      // Dé-réserver le produit
      await axios.put(`${API_BASE_URL}/api/products/${pendingConflictProduct.product.id}`, { reserver: 'non' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Réservation supprimée',
        description: `La réservation de ${conflictingReservation.clientNom} a été supprimée`,
        className: "notification-success",
      });
      // Appliquer la sélection du produit maintenant libre
      applyProductSelection(pendingConflictProduct.product, pendingConflictProduct.index);
    } catch (error) {
      console.error('Erreur suppression réservation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la réservation',
        variant: 'destructive',
        className: "notification-erreur",
      });
    } finally {
      setReservationConflictModalOpen(false);
      setConflictingReservation(null);
      setPendingConflictProduct(null);
    }
  };

  // Appliquer la sélection du produit (logique extraite)
  const applyProductSelection = (product: Product, index: number) => {
    const isAdvance = product.description.toLowerCase().includes('avance');
    const productQuantity = product.quantity !== undefined ? product.quantity : 0;
    const purchasePriceUnit = product.purchasePrice;
    const suggestedSellingPrice = isAdvance ? '' : (product.purchasePrice * 1.2).toFixed(2);

    const isPretProduit = product.description.toLowerCase().includes('prêt') || 
                          product.description.toLowerCase().includes('pret');

    if (isPretProduit) {
      setCurrentPretProductIndex(index);
      setPretProduitModalOpen(true);
      return;
    }

    const isAdvancePerruqueOuTissages = product.description.toLowerCase().includes('avance') && 
                                         (product.description.toLowerCase().includes('perruque') || 
                                          product.description.toLowerCase().includes('tissage'));

    if (isAdvancePerruqueOuTissages) {
      setCurrentAdvanceProductIndex(index);
      setAdvancePaymentModalOpen(true);
      
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = {
          ...newProducts[index],
          productId: String(product.id),
          description: product.description,
          selectedProduct: product,
          maxQuantity: productQuantity,
          isAdvanceProduct: true,
          isPretProduit: false,
          purchasePriceUnit: purchasePriceUnit.toString(),
          sellingPriceUnit: '',
          quantitySold: '0',
          profit: '0',
        };
        return newProducts;
      });
      return;
    }

    setFormProducts(prev => {
      const newProducts = [...prev];
      const newQuantity = isAdvance ? '0' : '1';
      const newPurchasePriceUnit = purchasePriceUnit.toString();
      const newSellingPriceUnit = isAdvance ? '' : suggestedSellingPrice;
      
      let initialProfit = '0';
      if (!isAdvance && suggestedSellingPrice) {
        const A = Number(newPurchasePriceUnit) * Number(newQuantity);
        const V = Number(suggestedSellingPrice) * Number(newQuantity);
        initialProfit = (V - A).toFixed(2);
      }

      newProducts[index] = {
        ...newProducts[index],
        productId: String(product.id),
        description: product.description,
        selectedProduct: product,
        maxQuantity: productQuantity,
        isAdvanceProduct: isAdvance,
        isPretProduit: false,
        purchasePriceUnit: newPurchasePriceUnit,
        sellingPriceUnit: newSellingPriceUnit,
        quantitySold: newQuantity,
        profit: initialProfit,
      };
      return newProducts;
    });
  };

  // Gérer la confirmation de la modale d'avance sur prêts existants
  const handleAdvancePaymentConfirm = (totalAdvance: number) => {
    if (currentAdvanceProductIndex !== null) {
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[currentAdvanceProductIndex] = {
          ...newProducts[currentAdvanceProductIndex],
          sellingPriceUnit: totalAdvance.toString(),
          profit: '0',
        };
        return newProducts;
      });
      setCurrentAdvanceProductIndex(null);
      toast({
        title: 'Succès',
        description: `Avance de ${totalAdvance.toLocaleString('fr-FR')} € ajoutée au produit`,
      });
    }
  };

  // Gérer la création d'un prêt produit depuis la modale
  const handlePretProduitCreated = (pretProduit: any, product: Product) => {
    if (currentPretProductIndex !== null) {
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[currentPretProductIndex] = {
          ...newProducts[currentPretProductIndex],
          productId: String(product.id),
          description: `Prêt - ${pretProduit.description}`,
          selectedProduct: product,
          maxQuantity: product.quantity || 0,
          isAdvanceProduct: false,
          isPretProduit: true,
          purchasePriceUnit: product.purchasePrice.toString(),
          sellingPriceUnit: '',
          quantitySold: '1',
          profit: '0',
          avancePretProduit: ''
        };
        return newProducts;
      });
      setCurrentPretProductIndex(null);
      toast({
        title: 'Succès',
        description: `Prêt produit ajouté - veuillez entrer le prix de vente`,
        className: "notification-success",
      });
    }
  };

  // Mise à jour du profit
  const updateProfit = (index: number, priceUnit: string, quantity: string, purchasePriceUnit: string) => {
    const product = formProducts[index];
    if (product.isAdvanceProduct) {
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], profit: '0' };
        return newProducts;
      });
    } else {
      const profit = calculateSaleProfit(priceUnit, quantity, purchasePriceUnit);
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], profit };
        return newProducts;
      });
    }
  };

  const handleSellingPriceChange = (value: string, index: number) => {
    setFormProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], sellingPriceUnit: value };
      return newProducts;
    });
    const product = formProducts[index];
    updateProfit(index, value, product.quantitySold, product.purchasePriceUnit);
  };

  const handleQuantityChange = (value: string, index: number) => {
    const product = formProducts[index];
    if (!product.isAdvanceProduct) {
      setFormProducts(prev => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], quantitySold: value };
        return newProducts;
      });
      updateProfit(index, product.sellingPriceUnit, value, product.purchasePriceUnit);
    }
  };

  const handleAvanceProductChange = (value: string, index: number) => {
    setFormProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], avancePretProduit: value };
      return newProducts;
    });
  };

  const handleDeliveryChange = (location: string, fee: string, index: number) => {
    setFormProducts(prev => {
      const newProducts = [...prev];
      newProducts[index] = { ...newProducts[index], deliveryLocation: location, deliveryFee: fee };
      return newProducts;
    });
  };

  const handleShowSlideshow = (product: FormProduct) => {
    setSlideshowProduct({
      photos: product.selectedProduct?.photos || [],
      mainPhoto: product.selectedProduct?.mainPhoto || product.selectedProduct?.photos?.[0],
      name: product.selectedProduct?.description || ''
    });
  };

  // Gestion des clients
  const handleClientData = async (clientName: string, clientPhone: string, clientAddress: string) => {
    if (!clientName.trim()) return null;
    try {
      const token = localStorage.getItem('token');
      const existingClientsResponse = await axios.get(`${API_BASE_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingClient = existingClientsResponse.data.find((client: any) => 
        client.nom.toLowerCase() === clientName.toLowerCase()
      );
      if (existingClient) return existingClient;
      
      if (clientPhone.trim() && clientAddress.trim()) {
        const newClientResponse = await axios.post(`${API_BASE_URL}/api/clients`, {
          nom: clientName, phone: clientPhone, adresse: clientAddress
        }, { headers: { Authorization: `Bearer ${token}` } });
        toast({
          title: "Client enregistré",
          description: `Le client ${clientName} a été ajouté à votre base de données`,
          className: "notification-success",
        });
        return newClientResponse.data;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la gestion du client:', error);
      return null;
    }
  };

  // Calculer les totaux
  const getTotals = () => {
    return formProducts.reduce((totals, product) => {
      const quantity = product.isAdvanceProduct ? 0 : Number(product.quantitySold || 0);
      const purchasePriceUnit = Number(product.purchasePriceUnit || 0);
      const sellingPriceUnit = Number(product.sellingPriceUnit || 0);
      const deliveryFee = Number(product.deliveryFee || 0);
      
      let purchasePrice, sellingPrice;
      if (product.isAdvanceProduct) {
        purchasePrice = purchasePriceUnit;
        sellingPrice = sellingPriceUnit;
      } else {
        purchasePrice = purchasePriceUnit * quantity;
        sellingPrice = sellingPriceUnit * quantity;
      }
      
      return {
        totalPurchasePrice: totals.totalPurchasePrice + purchasePrice,
        totalSellingPrice: totals.totalSellingPrice + sellingPrice + deliveryFee,
        totalProfit: totals.totalProfit + Number(product.profit || 0),
        totalDeliveryFee: totals.totalDeliveryFee + deliveryFee
      };
    }, { totalPurchasePrice: 0, totalSellingPrice: 0, totalProfit: 0, totalDeliveryFee: 0 });
  };

  const handleAvancePriceChange = (value: string) => {
    setAvancePrice(value);
    const totals = getTotals();
    const avance = Number(value) || 0;
    const resteCalculated = totals.totalSellingPrice - avance;
    setReste(resteCalculated >= 0 ? resteCalculated.toFixed(2) : '0');
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validProducts = formProducts.filter(p => p.selectedProduct && p.sellingPriceUnit);
    if (validProducts.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit avec un prix de vente.",
        variant: "destructive", className: "notification-erreur",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (clientName.trim()) {
        await handleClientData(clientName, clientPhone, clientAddress);
      }

      const saleProducts: SaleProduct[] = validProducts.map(product => {
        const quantity = product.isAdvanceProduct ? 0 : Number(product.quantitySold);
        const purchasePriceUnit = Number(product.purchasePriceUnit);
        const sellingPriceUnit = Number(product.sellingPriceUnit);
        const deliveryFee = Number(product.deliveryFee || 0);
        
        const isPretProduit = product.isPretProduit || 
                              product.description.toLowerCase().includes('prêt') || 
                              product.description.toLowerCase().includes('pret');
        
        let purchasePrice, sellingPrice;
        if (product.isAdvanceProduct) {
          purchasePrice = purchasePriceUnit;
          sellingPrice = sellingPriceUnit;
        } else if (isPretProduit) {
          purchasePrice = purchasePriceUnit * quantity;
          const avanceValue = product.avancePretProduit?.trim();
          sellingPrice = avanceValue && Number(avanceValue) > 0 ? Number(avanceValue) : 0;
        } else {
          purchasePrice = purchasePriceUnit * quantity;
          sellingPrice = sellingPriceUnit * quantity;
        }

        return {
          productId: product.productId,
          description: product.description,
          quantitySold: quantity,
          purchasePrice,
          sellingPrice,
          profit: Number(product.profit),
          deliveryFee,
          deliveryLocation: product.deliveryLocation
        };
      });

      const totals = getTotals();
      const avancePriceValue = Number(avancePrice) || 0;
      const finalSellingPrice = avancePriceValue > 0 ? avancePriceValue : totals.totalSellingPrice;
      const resteValue = avancePriceValue > 0 ? Number(reste) : 0;
      
      const saleData = {
        date,
        products: saleProducts,
        totalPurchasePrice: totals.totalPurchasePrice,
        totalSellingPrice: finalSellingPrice,
        totalProfit: totals.totalProfit,
        totalDeliveryFee: totals.totalDeliveryFee,
        clientName: clientName || null,
        clientAddress: clientAddress || null,
        clientPhone: clientPhone || null,
        reste: resteValue,
        nextPaymentDate: avancePriceValue > 0 ? nextPaymentDate : null,
      };

      let success;
      
      if (editSale) {
        success = await updateSale({ ...saleData, id: editSale.id });
        
        if (success && avancePriceValue > 0 && nextPaymentDate) {
          try {
            const token = localStorage.getItem('token');
            const pretProduitsResponse = await axios.get(`${API_BASE_URL}/api/pretproduits`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const existingPretProduit = pretProduitsResponse.data.find((p: any) => 
              p.nom === clientName && p.date === date
            );
            const productsDescription = validProducts.map(p => p.description).join(', ');
            const pretProduitData = {
              date, datePaiement: nextPaymentDate, phone: clientPhone || '',
              description: productsDescription, nom: clientName,
              prixVente: totals.totalSellingPrice, avanceRecue: avancePriceValue,
              reste: resteValue, estPaye: resteValue === 0,
              productId: validProducts.length === 1 ? validProducts[0].productId : undefined,
            };
            if (existingPretProduit) {
              await axios.put(`${API_BASE_URL}/api/pretproduits/${existingPretProduit.id}`, pretProduitData, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } else {
              await axios.post(`${API_BASE_URL}/api/pretproduits`, pretProduitData, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
          } catch (error) {
            console.error('Erreur lors de la mise à jour du prêt produit:', error);
          }
        }
      } else {
        success = await addSale(saleData);
        
        if (success && avancePriceValue > 0 && nextPaymentDate) {
          try {
            const token = localStorage.getItem('token');
            const productsDescription = validProducts.map(p => p.description).join(', ');
            const pretProduitData = {
              date, datePaiement: nextPaymentDate, phone: clientPhone || '',
              description: productsDescription, nom: clientName,
              prixVente: totals.totalSellingPrice, avanceRecue: avancePriceValue,
              reste: resteValue, estPaye: resteValue === 0,
              productId: validProducts.length === 1 ? validProducts[0].productId : undefined,
            };
            await axios.post(`${API_BASE_URL}/api/pretproduits`, pretProduitData, {
              headers: { Authorization: `Bearer ${token}` }
            });
            toast({
              title: "Succès",
              description: `Vente enregistrée et prêt produit créé avec succès`,
              variant: "default", className: "notification-success",
            });
          } catch (error) {
            console.error('Erreur lors de l\'enregistrement du prêt produit:', error);
            toast({
              title: "Attention",
              description: "Vente enregistrée mais erreur lors de la création du prêt produit",
              variant: "destructive",
            });
          }
        }
      }
      
      if (success && !(avancePriceValue > 0 && nextPaymentDate)) {
        toast({
          title: "Succès",
          description: editSale 
            ? `Vente avec ${saleProducts.length} produit(s) mise à jour avec succès`
            : `Vente avec ${saleProducts.length} produit(s) ajoutée avec succès`,
          variant: "default", className: "notification-success",
        });
      }
      
      if (success) {
        // Vérifier si des produits vendus étaient réservés, et supprimer les réservations correspondantes
        for (const product of validProducts) {
          if ((product.selectedProduct as any)?.reserver === 'oui') {
            try {
              const token = localStorage.getItem('token');
              const commandesResponse = await axios.get(`${API_BASE_URL}/api/commandes`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const allCommandes = commandesResponse.data;
              const reservationToDelete = allCommandes.find((c: any) => 
                c.type === 'reservation' && 
                c.statut !== 'valide' && c.statut !== 'annule' &&
                c.produits?.some((p: any) => p.nom.toLowerCase() === product.description.toLowerCase())
              );
              if (reservationToDelete) {
                await axios.delete(`${API_BASE_URL}/api/commandes/${reservationToDelete.id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                console.log('✅ Réservation supprimée après vente:', reservationToDelete.id);

                try {
                  const rdvResponse = await axios.get(`${API_BASE_URL}/api/rdv`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const rdvToDelete = rdvResponse.data.find((r: any) => r.commandeId === reservationToDelete.id);
                  if (rdvToDelete) {
                    await axios.delete(`${API_BASE_URL}/api/rdv/${rdvToDelete.id}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('✅ RDV lié à la réservation supprimé:', rdvToDelete.id);
                  }
                } catch (rdvError) {
                  console.error('Erreur suppression RDV lié:', rdvError);
                }
              }
              await axios.put(`${API_BASE_URL}/api/products/${product.productId}`, { reserver: 'non' }, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } catch (error) {
              console.error('Erreur suppression réservation après vente:', error);
            }
          }
        }
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive", className: "notification-erreur",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = getTotals();
  const hasValidProducts = formProducts.filter(p => p.selectedProduct && p.sellingPriceUnit).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-400">
        <DialogHeader>
          <DialogTitle>
            {editSale ? 'Modifier la vente multi-produits' : 'Ajouter une vente multi-produits'}
          </DialogTitle>
          <DialogDescription>
            <p className="text-white">
              {editSale
                ? 'Modifiez les détails de cette vente avec plusieurs produits.'
                : 'Enregistrez une vente avec un ou plusieurs produits.'}
            </p>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de vente</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Client Section */}
          <SaleClientSection
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientAddress={clientAddress}
            setClientAddress={setClientAddress}
            onClientSelect={handleClientSelect}
            isSubmitting={isSubmitting}
          />

          {/* Products */}
          <div className="space-y-4">
            {formProducts.map((product, index) => (
              <SaleProductCard
                key={index}
                product={product}
                index={index}
                canDelete={formProducts.length > 1}
                isSubmitting={isSubmitting}
                onProductSelect={handleProductSelect}
                onSellingPriceChange={handleSellingPriceChange}
                onQuantityChange={handleQuantityChange}
                onDeleteProduct={handleDeleteProduct}
                onAvanceChange={handleAvanceProductChange}
                onDeliveryChange={handleDeliveryChange}
                onShowSlideshow={handleShowSlideshow}
              />
            ))}
          </div>

          {/* Add product button */}
          <div className="text-center py-4">
            <Button
              type="button"
              onClick={addNewProduct}
              className="rounded-xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-0.5 px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un autre produit
            </Button>
          </div>

          {/* Totals & Advance */}
          {formProducts.some(p => p.selectedProduct) && (
            <SaleTotalsSection
              totals={totals}
              showAdvanceSection={showAdvanceSection}
              setShowAdvanceSection={setShowAdvanceSection}
              avancePrice={avancePrice}
              onAvancePriceChange={handleAvancePriceChange}
              reste={reste}
              nextPaymentDate={nextPaymentDate}
              setNextPaymentDate={setNextPaymentDate}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Footer Actions */}
          <SaleFormActions
            editSale={editSale}
            isSubmitting={isSubmitting}
            hasValidProducts={hasValidProducts}
            onDeleteSale={handleDeleteSale}
            onRefund={onRefund}
            onClose={onClose}
          />
        </form>
      </DialogContent>

      {/* Modals */}
      <AdvancePaymentModal
        isOpen={advancePaymentModalOpen}
        onClose={() => { setAdvancePaymentModalOpen(false); setCurrentAdvanceProductIndex(null); }}
        onConfirm={handleAdvancePaymentConfirm}
      />

      <PretProduitFromSaleModal
        isOpen={pretProduitModalOpen}
        onClose={() => { setPretProduitModalOpen(false); setCurrentPretProductIndex(null); }}
        onPretCreated={handlePretProduitCreated}
      />

      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        onConfirm={executeDelete}
        title={deleteTarget?.type === 'sale' ? 'Supprimer toute la vente' : 'Supprimer ce produit'}
        description={deleteTarget?.type === 'sale'
          ? 'Êtes-vous sûr de vouloir supprimer définitivement cette vente complète ? Cette action est irréversible.'
          : 'Êtes-vous sûr de vouloir supprimer ce produit de la vente ? Cette action est irréversible.'}
        isSubmitting={isSubmitting}
      />

      <ReservedProductModal
        isOpen={reservedModalOpen}
        onOpenChange={setReservedModalOpen}
        pendingProduct={pendingReservedProduct}
        onConfirm={handleReservedConfirm}
        onCancel={handleReservedCancel}
      />

      {/* Modale de conflit de réservation */}
      <AlertDialog open={reservationConflictModalOpen} onOpenChange={setReservationConflictModalOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-0 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <Package className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-foreground">
                Stock réservé
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-muted-foreground">
              Le produit <span className="font-semibold text-foreground">"{pendingConflictProduct?.product.description}"</span> est entièrement réservé par <span className="font-semibold text-foreground">{conflictingReservation?.clientNom}</span>.
              <br /><br />
              Voulez-vous supprimer cette réservation pour libérer le stock ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel onClick={() => { setReservationConflictModalOpen(false); setConflictingReservation(null); setPendingConflictProduct(null); }} className="bg-secondary hover:bg-secondary/80">
              Non, annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConflictReservationDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[100px]">
              Oui, supprimer la réservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProductPhotoSlideshow
        photos={slideshowProduct?.photos || []}
        mainPhoto={slideshowProduct?.mainPhoto}
        productName={slideshowProduct?.name || ''}
        isOpen={!!slideshowProduct}
        onClose={() => setSlideshowProduct(null)}
        baseUrl={API_BASE_URL}
      />
    </Dialog>
  );
};

export default MultiProductSaleForm;
