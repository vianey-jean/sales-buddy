import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackagePlus, XCircle, CheckCircle2, Package, Euro, Hash, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { productService } from '@/service/api';
import PhotoUploadSection from './PhotoUploadSection';
import FournisseurAutocomplete from './FournisseurAutocomplete';
import { fournisseurApiService } from '@/services/api/fournisseurApi';

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ isOpen, onClose }) => {
  const { addProduct, fetchProducts } = useApp();

  const [formData, setFormData] = useState({
    description: '',
    purchasePrice: '',
    quantity: '',
    fournisseur: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  // Photo state
  const [addPhotos, setAddPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({
    files: [],
    existingUrls: [],
    mainIndex: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.description) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = "Le prix d'achat est requis";
    } else if (isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = "Le prix d'achat doit être un nombre positif";
    }

    if (!formData.quantity) {
      newErrors.quantity = 'La quantité est requise';
    } else if (
      isNaN(Number(formData.quantity)) ||
      !Number.isInteger(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      newErrors.quantity = 'La quantité doit être un nombre entier positif';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setOpenConfirm(true);
  };

  const confirmAddProduct = async () => {
    setIsSubmitting(true);

    try {
      // Auto-create fournisseur if new
      if (formData.fournisseur.trim()) {
        try { await fournisseurApiService.create(formData.fournisseur.trim()); } catch (e) { console.error('Fournisseur create error:', e); }
      }

      const newProduct = await addProduct({
        description: formData.description,
        purchasePrice: Number(formData.purchasePrice),
        quantity: Number(formData.quantity),
        fournisseur: formData.fournisseur.trim() || undefined,
      });

      // Upload photos if any were selected
      if (newProduct && addPhotos.files.length > 0) {
        try {
          await productService.uploadProductPhotos(
            newProduct.id,
            addPhotos.files,
            addPhotos.mainIndex
          );
          // Refresh products to get updated photo data
          if (fetchProducts) {
            await fetchProducts();
          }
        } catch (photoError) {
          console.error('❌ Error uploading photos:', photoError);
        }
      }

      setFormData({
        description: '',
        purchasePrice: '',
        quantity: '',
        fournisseur: '',
      });
      setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 });

      setOpenConfirm(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 });
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-emerald-200/20 to-green-200/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-green-200/20 to-teal-200/20 rounded-full blur-3xl" />
          </div>

          <DialogHeader className="relative text-center space-y-4 pb-2">
            {/* Premium icon */}
            <div className="mx-auto relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 transform hover:scale-105 transition-transform duration-300">
                <PackagePlus className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl blur-xl opacity-40 -z-10 scale-110" />
            </div>

            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 bg-clip-text text-transparent">
              ✨ Nouveau Produit Premium
            </DialogTitle>
            <DialogDescription className="text-white font-medium">
              Ajoutez un nouveau produit à votre inventaire de luxe
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative space-y-5 py-4">
            {/* Description Field */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Description du produit
              </Label>
              <div className="relative group">
                <Input
                  name="description"
                  placeholder="Nom du produit premium..."
                  value={formData.description}
                  onChange={handleChange}
                  className={cn(
                    "h-12 px-4 bg-gradient-to-r from-white to-gray-50/80",
                    "border-2 border-gray-200 hover:border-emerald-300",
                    "focus:border-emerald-500 focus:from-emerald-50/50 focus:to-white",
                    "rounded-xl shadow-sm hover:shadow-md focus:shadow-lg",
                    "transition-all duration-300",
                    "placeholder:text-gray-400 text-gray-900 font-medium",
                    errors.description && "border-red-300 focus:border-red-500 bg-red-50/30"
                  )}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-sm scale-105" />
              </div>
              {errors.description && (
                <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Purchase Price Field */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Euro className="h-4 w-4 text-amber-600" />
                  Prix d'achat (€)
                </Label>
                <div className="relative group">
                  <Input
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className={cn(
                      "h-12 px-4 bg-gradient-to-r from-white to-gray-50/80",
                      "border-2 border-gray-200 hover:border-amber-300",
                      "focus:border-amber-500 focus:from-amber-50/50 focus:to-white",
                      "rounded-xl shadow-sm hover:shadow-md focus:shadow-lg",
                      "transition-all duration-300",
                      "placeholder:text-gray-400 text-gray-900 font-medium",
                      errors.purchasePrice && "border-red-300 focus:border-red-500 bg-red-50/30"
                    )}
                  />
                </div>
                {errors.purchasePrice && (
                  <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.purchasePrice}
                  </p>
                )}
              </div>

              {/* Quantity Field */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-600" />
                  Quantité
                </Label>
                <div className="relative group">
                  <Input
                    name="quantity"
                    type="number"
                    step="1"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={cn(
                      "h-12 px-4 bg-gradient-to-r from-white to-gray-50/80",
                      "border-2 border-gray-200 hover:border-blue-300",
                      "focus:border-blue-500 focus:from-blue-50/50 focus:to-white",
                      "rounded-xl shadow-sm hover:shadow-md focus:shadow-lg",
                      "transition-all duration-300",
                      "placeholder:text-gray-400 text-gray-900 font-medium",
                      errors.quantity && "border-red-300 focus:border-red-500 bg-red-50/30"
                    )}
                  />
                </div>
                {errors.quantity && (
                  <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.quantity}
                  </p>
                )}
              </div>
            </div>

            {/* Fournisseur Autocomplete */}
            <FournisseurAutocomplete
              value={formData.fournisseur}
              onChange={(val) => setFormData({ ...formData, fournisseur: val })}
              variant="light"
            />

            {/* Photo Upload Section */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 border-2 border-emerald-100 rounded-2xl">
              <PhotoUploadSection
                onPhotosChange={(files, existingUrls, mainIndex) => {
                  setAddPhotos({ files, existingUrls, mainIndex });
                }}
                maxPhotos={6}
              />
            </div>

            <DialogFooter className="flex gap-3 pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 h-12 rounded-xl font-bold",
                  "bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100",
                  "border-2 border-gray-200 hover:border-gray-300",
                  "text-gray-700 hover:text-gray-900",
                  "shadow-lg hover:shadow-xl",
                  "transition-all duration-300 transform hover:-translate-y-0.5"
                )}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex-1 h-12 rounded-xl font-bold",
                  "bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600",
                  "hover:from-emerald-600 hover:via-green-700 hover:to-teal-700",
                  "text-white border-0",
                  "shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40",
                  "transition-all duration-300 transform hover:-translate-y-0.5"
                )}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Envoi en cours...' : 'Ajouter le produit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Premium Confirmation Dialog */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-emerald-200/20 to-green-200/20 rounded-full blur-3xl" />
          </div>

          <AlertDialogHeader className="relative text-center space-y-4">
            <div className="mx-auto relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <PackagePlus className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl blur-xl opacity-40 -z-10 scale-110" />
            </div>

            <AlertDialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              ✨ Confirmer l'ajout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 font-medium">
              Voulez-vous vraiment ajouter ce produit à votre inventaire premium ?
            </AlertDialogDescription>

            {/* Product Preview */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-100">
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Produit:</span>
                  <span className="font-bold text-gray-900">{formData.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Prix d'achat:</span>
                  <span className="font-bold text-amber-600">{formData.purchasePrice} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Quantité:</span>
                  <span className="font-bold text-blue-600">{formData.quantity}</span>
                </div>
                {formData.fournisseur && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Fournisseur:</span>
                    <span className="font-bold text-orange-600">{formData.fournisseur}</span>
                  </div>
                )}
                {addPhotos.files.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Photos:</span>
                    <span className="font-bold text-purple-600">{addPhotos.files.length} photo(s)</span>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="relative flex gap-3 pt-4 sm:flex-row">
            <AlertDialogCancel
              className={cn(
                "flex-1 h-12 rounded-xl font-bold",
                "bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100",
                "border-2 border-gray-200 hover:border-gray-300",
                "text-gray-700 hover:text-gray-900",
                "shadow-lg hover:shadow-xl",
                "transition-all duration-300 transform hover:-translate-y-0.5",
                "flex items-center justify-center gap-2"
              )}
            >
              <XCircle className="h-5 w-5" />
              Annuler
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmAddProduct}
              disabled={isSubmitting}
              className={cn(
                "flex-1 h-12 rounded-xl font-bold",
                "bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600",
                "hover:from-emerald-600 hover:via-green-700 hover:to-teal-700",
                "text-white border-0",
                "shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40",
                "transition-all duration-300 transform hover:-translate-y-0.5",
                "flex items-center justify-center gap-2"
              )}
            >
              <CheckCircle2 className="h-5 w-5" />
              {isSubmitting ? "Ajout en cours..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddProductForm;
