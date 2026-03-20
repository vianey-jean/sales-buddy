
import { useState, useEffect } from 'react';
import { Product, Sale } from '@/types';

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

export const useSaleForm = (editSale: Sale | undefined, products: Product[], isOpen: boolean) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    productId: '',
    sellingPriceUnit: '',
    quantitySold: '1',
    purchasePriceUnit: '',
    profit: '',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAdvanceProduct, setIsAdvanceProduct] = useState(false);

  const isOutOfStock = selectedProduct && !isAdvanceProduct && (selectedProduct.quantity === 0 || selectedProduct.quantity === undefined);

  const initializeForm = () => {
    if (editSale) {
      const product = products.find(p => p.id === editSale.productId);
      const description = editSale.description || '';
      const isAdvance = description.toLowerCase().includes('avance');
      setIsAdvanceProduct(isAdvance);
      
      const purchasePriceUnit = isAdvance ? (editSale.purchasePrice || 0) : ((editSale.purchasePrice || 0) / (editSale.quantitySold || 1));
      const sellingPriceUnit = isAdvance ? (editSale.sellingPrice || 0) : ((editSale.sellingPrice || 0) / (editSale.quantitySold || 1));
      
      setFormData({
        date: new Date(editSale.date).toISOString().split('T')[0],
        description: description,
        productId: String(editSale.productId || ''),
        sellingPriceUnit: sellingPriceUnit.toString(),
        quantitySold: (editSale.quantitySold || 0).toString(),
        purchasePriceUnit: purchasePriceUnit.toString(),
        profit: (editSale.profit || 0).toString(),
        clientName: editSale.clientName || '',
        clientAddress: editSale.clientAddress || '',
        clientPhone: editSale.clientPhone || '',
      });
      
      if (product) {
        setSelectedProduct(product);
        const editQuantity = editSale ? Number(editSale.quantitySold) : 0;
        const productQuantity = product.quantity !== undefined ? product.quantity : 0;
        setMaxQuantity(productQuantity + editQuantity);
      }
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        productId: '',
        sellingPriceUnit: '',
        quantitySold: '1',
        purchasePriceUnit: '',
        profit: '',
        clientName: '',
        clientAddress: '',
        clientPhone: '',
      });
      setSelectedProduct(null);
      setMaxQuantity(0);
      setIsAdvanceProduct(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    console.log('🎯 Produit sélectionné dans useSaleForm:', product);
    
    setSelectedProduct(product);
    
    const isAdvance = product.description.toLowerCase().includes('avance');
    setIsAdvanceProduct(isAdvance);
    
    const productQuantity = product.quantity !== undefined ? product.quantity : 0;
    setMaxQuantity(productQuantity);
    
    // Pour les produits d'avance, le prix d'achat unitaire est le prix du produit dans la DB
    // Pour les autres produits, calculer un prix de vente suggéré
    const purchasePriceUnit = product.purchasePrice;
    const suggestedSellingPrice = isAdvance ? '' : (product.purchasePrice * 1.2).toFixed(2);
    
    console.log('💰 Calculs pour produit:', {
      description: product.description,
      isAdvance: isAdvance,
      purchasePrice: product.purchasePrice,
      purchasePriceUnit: purchasePriceUnit,
      suggestedSellingPrice: suggestedSellingPrice || 'À définir par l\'utilisateur',
      quantity: isAdvance ? '0' : '1'
    });
    
    // Mettre à jour le formulaire avec les données du produit
    setFormData(prev => {
      const newQuantity = isAdvance ? '0' : '1';
      const newPurchasePriceUnit = purchasePriceUnit.toString();
      const newSellingPriceUnit = isAdvance ? '' : suggestedSellingPrice;
      
      // Calculer le profit initial
      let initialProfit = '0';
      if (!isAdvance && suggestedSellingPrice) {
        const A = Number(newPurchasePriceUnit) * Number(newQuantity);
        const V = Number(suggestedSellingPrice) * Number(newQuantity);
        initialProfit = (V - A).toFixed(2);
      }
      
      const newFormData = {
        ...prev,
        description: product.description,
        productId: String(product.id),
        purchasePriceUnit: newPurchasePriceUnit,
        sellingPriceUnit: newSellingPriceUnit,
        quantitySold: newQuantity,
        profit: initialProfit,
      };
      
      console.log('📝 FormData mis à jour:', newFormData);
      return newFormData;
    });
  };

  useEffect(() => {
    initializeForm();
  }, [editSale, products, isOpen]);

  return {
    formData,
    setFormData,
    selectedProduct,
    setSelectedProduct,
    isSubmitting,
    setIsSubmitting,
    maxQuantity,
    setMaxQuantity,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isAdvanceProduct,
    setIsAdvanceProduct,
    isOutOfStock,
    handleProductSelect,
    initializeForm
  };
};
