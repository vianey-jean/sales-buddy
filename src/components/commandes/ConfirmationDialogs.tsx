/**
 * =============================================================================
 * Composants de Confirmation pour les Commandes
 * =============================================================================
 * 
 * Dialogs de confirmation pour les actions critiques:
 * - Validation d'une commande/réservation
 * - Annulation d'une commande/réservation
 * - Suppression d'une commande/réservation
 * 
 * @module ConfirmationDialogs
 * @version 1.0.0
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface ValidationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog de confirmation pour valider une commande/réservation
 */
export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 border-2 border-green-300 dark:border-green-700">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-bold text-green-700 dark:text-green-300">
            Confirmer la validation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Cette action va enregistrer la commande comme une vente validée et mettre à jour le stock.
            Êtes-vous sûr de vouloir continuer ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 justify-center">
          <AlertDialogCancel
            onClick={onCancel}
            className="border-gray-300 dark:border-gray-700"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            Valider la commande
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface CancellationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog de confirmation pour annuler une commande/réservation
 */
export const CancellationDialog: React.FC<CancellationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-900/30 dark:via-rose-900/30 dark:to-pink-900/30 border-2 border-red-300 dark:border-red-700">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-2">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-bold text-red-700 dark:text-red-300">
            Confirmer l'annulation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Cette action va annuler la commande. Si elle était validée, la vente sera également supprimée
            et le stock sera restauré. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 justify-center">
          <AlertDialogCancel
            onClick={onCancel}
            className="border-gray-300 dark:border-gray-700"
          >
            Retour
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
          >
            Confirmer l'annulation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface DeleteDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog de confirmation pour supprimer une commande/réservation
 */
export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-900/50 dark:via-slate-900/50 dark:to-zinc-900/50 border-2 border-gray-300 dark:border-gray-700">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-2">
            <Trash2 className="h-12 w-12 text-gray-500" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-bold text-gray-700 dark:text-gray-300">
            Supprimer cette entrée ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Cette action supprimera définitivement cette commande/réservation et toutes les données associées.
            Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 justify-center">
          <AlertDialogCancel
            onClick={onCancel}
            className="border-gray-300 dark:border-gray-700"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white"
          >
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
