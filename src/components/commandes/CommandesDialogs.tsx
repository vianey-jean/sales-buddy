/**
 * Dialogs de confirmation pour la page Commandes
 */
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface CommandesDialogsProps {
  // Validation
  validatingId: string | null;
  setValidatingId: (id: string | null) => void;
  confirmValidation: () => void;
  
  // Delete
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  handleDelete: (id: string) => void;
  
  // Cancel
  cancellingId: string | null;
  setCancellingId: (id: string | null) => void;
  confirmCancellation: () => void;
  
  // Reporter
  reporterModalOpen: boolean;
  setReporterModalOpen: (open: boolean) => void;
  reporterDate: string;
  setReporterDate: (date: string) => void;
  reporterHoraire: string;
  setReporterHoraire: (horaire: string) => void;
  handleReporterConfirm: () => void;
}

const CommandesDialogs: React.FC<CommandesDialogsProps> = ({
  validatingId,
  setValidatingId,
  confirmValidation,
  deleteId,
  setDeleteId,
  handleDelete,
  cancellingId,
  setCancellingId,
  confirmCancellation,
  reporterModalOpen,
  setReporterModalOpen,
  reporterDate,
  setReporterDate,
  reporterHoraire,
  setReporterHoraire,
  handleReporterConfirm
}) => {
  return (
    <>
      {/* Dialog validation */}
      <AlertDialog open={!!validatingId} onOpenChange={(open) => !open && setValidatingId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Confirmer la validation</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Êtes-vous sûr de vouloir valider cette commande/réservation ? 
              Une fois validée, elle sera retirée de la liste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmValidation} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="w-full sm:w-auto">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog annulation */}
      <AlertDialog open={!!cancellingId} onOpenChange={(open) => !open && setCancellingId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Confirmer l'annulation</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Êtes-vous sûr de vouloir annuler cette commande/réservation ? 
              Elle sera retirée de la liste mais conservée dans la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Retour</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancellation} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700">
              Annuler la commande
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Reporter */}
      <Dialog open={reporterModalOpen} onOpenChange={(open) => {
        if (!open) {
          setReporterModalOpen(false);
          setReporterDate('');
          setReporterHoraire('');
        }
      }}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Reporter la date d'échéance
            </DialogTitle>
            <DialogDescription className="text-sm">
              Modifiez la date et l'horaire pour reporter cette commande/réservation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reporterDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                📅 Nouvelle date d'échéance
              </Label>
              <Input
                id="reporterDate"
                type="date"
                value={reporterDate}
                onChange={(e) => setReporterDate(e.target.value)}
                className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="reporterHoraire" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                🕐 Nouvel horaire (facultatif)
              </Label>
              <Input
                id="reporterHoraire"
                type="time"
                value={reporterHoraire}
                onChange={(e) => setReporterHoraire(e.target.value)}
                className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setReporterModalOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button 
              onClick={handleReporterConfirm}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!reporterDate}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Confirmer le report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommandesDialogs;
