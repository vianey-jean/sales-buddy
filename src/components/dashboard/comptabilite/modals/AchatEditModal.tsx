/**
 * AchatEditModal - Modale de modification d'un achat/dépense
 * 
 * RÔLE :
 * Ce composant affiche une modale pour modifier un achat ou une dépense existant.
 * 
 * PROPS :
 * - achat: NouvelleAchat | null - L'achat/dépense à modifier
 * - isOpen: boolean - État d'ouverture de la modale
 * - onClose: () => void - Callback de fermeture
 * - onSave: (data: Partial<NouvelleAchat>) => Promise<void> - Callback de sauvegarde
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Receipt, 
  Fuel, 
  DollarSign, 
  Save,
  X,
  Loader2,
  CalendarIcon
} from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface AchatEditModalProps {
  achat: NouvelleAchat | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<NouvelleAchat>) => Promise<void>;
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return <Package className="h-6 w-6 text-blue-400" />;
    case 'taxes':
      return <Receipt className="h-6 w-6 text-red-400" />;
    case 'carburant':
      return <Fuel className="h-6 w-6 text-orange-400" />;
    default:
      return <DollarSign className="h-6 w-6 text-purple-400" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return 'Achat Produit';
    case 'taxes':
      return 'Taxes';
    case 'carburant':
      return 'Carburant';
    default:
      return 'Autre Dépense';
  }
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AchatEditModal: React.FC<AchatEditModalProps> = ({
  achat,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    productDescription: '',
    description: '',
    purchasePrice: 0,
    quantity: 1,
    fournisseur: '',
    date: new Date()
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    if (achat) {
      // Pour les dépenses, on utilise totalCost car elles n'ont pas de purchasePrice
      const isDepense = achat.type !== 'achat_produit';
      const price = isDepense 
        ? (achat.totalCost || 0) 
        : (achat.purchasePrice || achat.totalCost || 0);
      
      setFormData({
        productDescription: achat.productDescription || '',
        description: achat.description || '',
        purchasePrice: price,
        quantity: achat.quantity || 1,
        fournisseur: achat.fournisseur || '',
        date: achat.date ? new Date(achat.date) : new Date()
      });
    }
  }, [achat]);

  if (!achat) return null;

  const isAchatProduit = achat.type === 'achat_produit';

  const handleChange = (field: string, value: string | number | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    
    try {
      const dataToSave: Partial<NouvelleAchat> = {
        date: formData.date.toISOString(),
        ...(isAchatProduit ? {
          productDescription: formData.productDescription,
          purchasePrice: Number(formData.purchasePrice),
          quantity: Number(formData.quantity),
          fournisseur: formData.fournisseur,
          totalCost: Number(formData.purchasePrice) * Number(formData.quantity)
        } : {
          description: formData.description,
          totalCost: Number(formData.purchasePrice)
        })
      };
      
      await onSave(achat.id, dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                {getTypeIcon(achat.type)}
              </div>
              <div>
                <DialogTitle className="text-xl">Modifier {getTypeLabel(achat.type)}</DialogTitle>
                <p className="text-sm text-muted-foreground">Modifiez les informations ci-dessous</p>
              </div>
            </div>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 mt-4"
          >
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                {isAchatProduit ? 'Description du produit' : 'Description'}
              </Label>
              <Input
                id="description"
                value={isAchatProduit ? formData.productDescription : formData.description}
                onChange={(e) => handleChange(isAchatProduit ? 'productDescription' : 'description', e.target.value)}
                className="h-12 rounded-xl"
                placeholder={isAchatProduit ? "Nom du produit..." : "Description de la dépense..."}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal rounded-xl",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && handleChange('date', date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Prix */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                {isAchatProduit ? 'Prix unitaire (€)' : 'Montant (€)'}
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
                className="h-12 rounded-xl"
              />
            </div>

            {/* Quantité (uniquement pour achats produit) */}
            {isAchatProduit && (
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                  className="h-12 rounded-xl"
                />
              </div>
            )}

            {/* Fournisseur (uniquement pour achats produit) */}
            {isAchatProduit && (
              <div className="space-y-2">
                <Label htmlFor="fournisseur" className="text-sm font-medium">Fournisseur</Label>
                <Input
                  id="fournisseur"
                  value={formData.fournisseur}
                  onChange={(e) => handleChange('fournisseur', e.target.value)}
                  className="h-12 rounded-xl"
                  placeholder="Nom du fournisseur..."
                />
              </div>
            )}

            {/* Total calculé */}
            {isAchatProduit && (
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-sm text-muted-foreground">Total calculé</p>
                <p className="text-2xl font-bold text-red-500">
                  -{(Number(formData.purchasePrice) * Number(formData.quantity)).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="
                  flex-1 h-12 rounded-xl
                  bg-gradient-to-r from-primary to-primary/80
                  hover:from-primary/90 hover:to-primary/70
                  shadow-lg
                "
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Confirmation d'enregistrement */}
      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-primary/20">
                <Save className="h-6 w-6 text-primary" />
              </div>
              <AlertDialogTitle className="text-xl">Confirmer l'enregistrement</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Voulez-vous vraiment enregistrer ces modifications ?
              <br />
              <span className="text-muted-foreground text-sm mt-2 block">
                Les données seront mises à jour dans tous les modules concernés.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              className="rounded-xl bg-primary hover:bg-primary/90"
            >
              Oui, enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AchatEditModal;
