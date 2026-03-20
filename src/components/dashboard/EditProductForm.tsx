import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Pencil, XCircle, CheckCircle2, Package, Euro, Hash, Sparkles, Search, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { productService } from '@/service/api';
import { Product } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import ProductSearchInput from './ProductSearchInput';
import FournisseurAutocomplete from './FournisseurAutocomplete';
import { fournisseurApiService } from '@/services/api/fournisseurApi';
import { useApp } from '@/contexts/AppContext';
import PhotoUploadSection from './PhotoUploadSection';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

interface EditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { fetchProducts } = useApp();

  const [formData, setFormData] = useState({
    id: '',
    description: '',
    purchasePrice: 0,
    quantity: 0,
    additionalQuantity: 0,
    fournisseur: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Photo state
  const [editPhotos, setEditPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({
    files: [],
    existingUrls: [],
    mainIndex: 0,
  });

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        id: selectedProduct.id,
        description: selectedProduct.description,
        purchasePrice: selectedProduct.purchasePrice,
        quantity: selectedProduct.quantity,
        additionalQuantity: 0,
        fournisseur: selectedProduct.fournisseur || '',
      });
      // Reset photo state with existing product photos
      setEditPhotos({
        files: [],
        existingUrls: selectedProduct.photos || [],
        mainIndex: 0,
      });
    }
  }, [selectedProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'description' ? value : Number(value),
    });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id) {
      toast({
        title: 'Erreur',
        description: "Veuillez sélectionner un produit d'abord",
        variant: 'destructive',
        className: 'notification-erreur',
      });
      return;
    }

    setOpenConfirm(true);
  };

  const confirmUpdate = async () => {
    try {
      setIsLoading(true);

      // Auto-create fournisseur if new
      if (formData.fournisseur.trim()) {
        try { await fournisseurApiService.create(formData.fournisseur.trim()); } catch (e) { console.error('Fournisseur create error:', e); }
      }

      const updatedProduct = {
        id: formData.id,
        description: formData.description,
        purchasePrice: formData.purchasePrice,
        quantity: formData.quantity + formData.additionalQuantity,
        fournisseur: formData.fournisseur.trim() || undefined,
      };

      await productService.updateProduct(updatedProduct);

      // Handle photo updates
      const hasNewPhotos = editPhotos.files.length > 0;
      const existingPhotosChanged = selectedProduct
        ? JSON.stringify(editPhotos.existingUrls) !== JSON.stringify(selectedProduct.photos || [])
        : false;

      if (hasNewPhotos || existingPhotosChanged) {
        try {
          await productService.replaceProductPhotos(
            formData.id,
            editPhotos.files,
            editPhotos.existingUrls,
            editPhotos.mainIndex
          );
        } catch (photoError) {
          console.error('❌ Error updating photos:', photoError);
        }
      }

      toast({
        title: 'Succès',
        description: 'Le produit a été modifié avec succès',
        className: 'notification-success',
      });

      setOpenConfirm(false);
      if (fetchProducts) {
        await fetchProducts();
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors de la modification du produit",
        variant: 'destructive',
        className: 'notification-erreur',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!formData.id) {
      toast({
        title: 'Erreur',
        description: "Veuillez sélectionner un produit d'abord",
        variant: 'destructive',
        className: 'notification-erreur',
      });
      return;
    }
    setOpenDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      await productService.deleteProduct(formData.id);

      toast({
        title: '✅ Produit supprimé',
        description: `Le produit "${formData.description}" a été supprimé définitivement`,
        className: 'notification-success',
      });

      setOpenDeleteConfirm(false);
      setSelectedProduct(null);
      setFormData({
        id: '',
        description: '',
        purchasePrice: 0,
        quantity: 0,
        additionalQuantity: 0,
        fournisseur: '',
      });
      setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 });
      
      if (fetchProducts) {
        await fetchProducts();
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors de la suppression du produit",
        variant: 'destructive',
        className: 'notification-erreur',
      });
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          className="sm:max-w-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50
          backdrop-blur-xl border-0 shadow-2xl rounded-3xl
          max-h-[90vh] overflow-y-auto"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl" />
          </div>

          <DialogHeader className="relative text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Pencil className="h-8 w-8 text-white" />
            </div>

            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
              ✏️ Modifier Produit Premium
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold">
                <Search className="h-4 w-4 text-blue-600" />
                Rechercher un produit
              </Label>
              <ProductSearchInput onProductSelect={handleSelectProduct} context="edit" />
            </div>

            {selectedProduct && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold">
                    <Package className="h-4 w-4 text-indigo-600" />
                    Description
                  </Label>
                  <Input 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold">
                    <Euro className="h-4 w-4 text-amber-600" />
                    Prix d'achat (€)
                  </Label>
                  <Input 
                    name="purchasePrice" 
                    type="number" 
                    value={formData.purchasePrice} 
                    onChange={handleChange}
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold">
                    <Hash className="h-4 w-4" />
                    Quantité actuelle
                  </Label>
                  <Input 
                    value={formData.quantity} 
                    readOnly 
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-bold">
                    <Plus className="h-4 w-4 text-green-600" />
                    Ajouter quantité
                  </Label>
                  <Input
                    name="additionalQuantity"
                    type="number"
                    value={formData.additionalQuantity}
                    onChange={handleChange}
                    className="border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all duration-300"
                  />
                  <p className="text-sm text-gray-500">
                    <Sparkles className="inline h-4 w-4 mr-1 text-blue-500" />
                    Quantité finale : <b>{formData.quantity + formData.additionalQuantity}</b>
                  </p>
                </div>

                {/* Fournisseur Autocomplete */}
                <FournisseurAutocomplete
                  value={formData.fournisseur}
                  onChange={(val) => setFormData({ ...formData, fournisseur: val })}
                  variant="light"
                />

                {/* Photo Upload Section */}
                <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-2 border-blue-100 rounded-2xl">
                  <PhotoUploadSection
                    existingPhotos={selectedProduct.photos || []}
                    existingMainPhoto={selectedProduct.mainPhoto}
                    baseUrl={BASE_URL}
                    onPhotosChange={(files, existingUrls, mainIndex) => {
                      setEditPhotos({ files, existingUrls, mainIndex });
                    }}
                    maxPhotos={6}
                  />
                </div>
              </>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleClose}
                className="order-3 sm:order-1 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Annuler
              </Button>
              
              {selectedProduct && (
                <Button 
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="order-2 rounded-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Supprimer ce produit
                </Button>
              )}
              
              <Button 
                type="submit"
                disabled={!selectedProduct || isLoading}
                className="order-1 sm:order-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Pencil className="mr-2 h-5 w-5" />
                {isLoading ? 'Envoi en cours...' : 'Modifier le produit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog modification */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Confirmer la modification
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white">
              Êtes-vous sûr de vouloir modifier ce produit ? Cette action mettra à jour les informations du produit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel className="rounded-xl border-2 hover:bg-gray-50 transition-all duration-300">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUpdate}
              disabled={isLoading}
              className="rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300"
            >
              {isLoading ? 'Modification...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation dialog suppression PREMIUM */}
      <AlertDialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-red-50/30 to-rose-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 animate-pulse">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-700 to-rose-700 bg-clip-text text-transparent">
              ⚠️ Supprimer ce produit ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 space-y-2">
              <p className="font-semibold text-red-600">
                Vous êtes sur le point de supprimer définitivement :
              </p>
              <p className="text-lg font-bold text-gray-800 bg-red-100/50 px-4 py-2 rounded-xl">
                "{formData.description}"
              </p>
              <p className="text-sm text-red-500 mt-4">
                ⚠️ Cette action est <span className="font-bold">irréversible</span>. 
                Toutes les données associées seront perdues.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-6">
            <AlertDialogCancel className="flex-1 rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300">
              <XCircle className="mr-2 h-5 w-5" />
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 rounded-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditProductForm;
