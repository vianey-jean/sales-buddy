/**
 * =============================================================================
 * Composant ReporterModal
 * =============================================================================
 * 
 * Modal pour reporter une commande ou réservation à une nouvelle date.
 * Permet de sélectionner une nouvelle date et horaire.
 * 
 * @module ReporterModal
 * @version 1.0.0
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock } from 'lucide-react';

interface ReporterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reporterDate: string;
  setReporterDate: (date: string) => void;
  reporterHoraire: string;
  setReporterHoraire: (horaire: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de report de date pour commande/réservation
 */
const ReporterModal: React.FC<ReporterModalProps> = ({
  isOpen,
  onOpenChange,
  reporterDate,
  setReporterDate,
  reporterHoraire,
  setReporterHoraire,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-yellow-900/30 border-2 border-orange-300 dark:border-orange-700">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-6 w-6 text-orange-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-center text-orange-700 dark:text-orange-300">
            Reporter à une nouvelle date
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Sélectionnez la nouvelle date et l'horaire
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reporterDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Nouvelle date
            </Label>
            <Input
              id="reporterDate"
              type="date"
              value={reporterDate}
              onChange={(e) => setReporterDate(e.target.value)}
              className="border-2 border-orange-300 dark:border-orange-700 focus:border-orange-500"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="reporterHoraire" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horaire (optionnel)
            </Label>
            <Input
              id="reporterHoraire"
              type="time"
              value={reporterHoraire}
              onChange={(e) => setReporterHoraire(e.target.value)}
              className="border-2 border-orange-300 dark:border-orange-700 focus:border-orange-500"
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 dark:border-gray-700"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            Confirmer le report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReporterModal;
