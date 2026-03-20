/**
 * AchatsProduitsModal - Modal affichant les détails des achats produits
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface AchatsProduitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achats: NouvelleAchat[];
  achatsTotal: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const AchatsProduitsModal: React.FC<AchatsProduitsModalProps> = ({
  isOpen,
  onClose,
  achats,
  achatsTotal,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  const achatsProducts = achats.filter(a => a.type === 'achat_produit');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto
        bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-900 dark:to-indigo-950/30
        backdrop-blur-xl border border-indigo-100/50 dark:border-indigo-800/30
        shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)]
        rounded-2xl sm:rounded-3xl">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Achats Produits - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Total: <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatEuro(achatsTotal)}</span> ({achatsProducts.length} achats)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {achatsProducts.length > 0 ? (
            achatsProducts.map((achat) => (
              <div
                key={achat.id}
                className="flex items-center justify-between p-4
                  rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20
                  border border-indigo-100 dark:border-indigo-800/50
                  transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20">
                    <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white/90">
                      {achat.productDescription}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
                      {new Date(achat.date).toLocaleDateString('fr-FR')}
                      {achat.fournisseur && ` • ${achat.fournisseur}`}
                      {achat.quantity && ` • Qté: ${achat.quantity}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {formatEuro(achat.totalCost)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 dark:text-white/40 py-8">Aucun achat de produit ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchatsProduitsModal;
