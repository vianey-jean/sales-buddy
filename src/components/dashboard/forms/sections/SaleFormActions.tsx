import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Trash2, RotateCcw } from 'lucide-react';
import { Sale } from '@/types';

interface SaleFormActionsProps {
  editSale?: Sale;
  isSubmitting: boolean;
  hasValidProducts: boolean;
  onDeleteSale: () => void;
  onRefund?: (sale: Sale) => void;
  onClose: () => void;
}

const SaleFormActions: React.FC<SaleFormActionsProps> = ({
  editSale,
  isSubmitting,
  hasValidProducts,
  onDeleteSale,
  onRefund,
  onClose,
}) => {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
      {editSale && (
        <Button
          type="button"
          onClick={onDeleteSale}
          disabled={isSubmitting}
          className="sm:mr-auto rounded-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer ce vente
        </Button>
      )}

      {editSale && onRefund && !editSale.isRefund && (
        <Button
          type="button"
          onClick={() => onRefund(editSale)}
          disabled={isSubmitting}
          className="rounded-xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Rembourser
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
        className="rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300"
      >
        Annuler
      </Button>

      <Button
        type="submit"
        disabled={isSubmitting || !hasValidProducts}
        className="rounded-xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
      >
        {isSubmitting ? 'Enregistrement...' : editSale ? '✓ Mettre à jour' : '✓ Ajouter la vente'}
      </Button>
    </DialogFooter>
  );
};

export default SaleFormActions;
