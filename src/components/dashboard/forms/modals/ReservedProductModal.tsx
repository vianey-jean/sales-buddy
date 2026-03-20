import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package } from 'lucide-react';
import { Product } from '@/types';

interface ReservedProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pendingProduct: { product: Product; index: number } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ReservedProductModal: React.FC<ReservedProductModalProps> = ({
  isOpen,
  onOpenChange,
  pendingProduct,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-0 shadow-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Package className="h-5 w-5 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              Produit réservé
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-muted-foreground">
            Le produit <span className="font-semibold text-foreground">"{pendingProduct?.product.description}"</span> est déjà réservé. Voulez-vous toujours le vendre ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 sm:gap-2">
          <AlertDialogCancel onClick={onCancel} className="bg-secondary hover:bg-secondary/80">
            Non
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-amber-500 text-white hover:bg-amber-600 min-w-[100px]">
            Oui, vendre
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReservedProductModal;
