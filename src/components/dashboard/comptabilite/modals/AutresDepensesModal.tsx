/**
 * AutresDepensesModal - Modal affichant les autres dépenses (hors achats produits)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Receipt, Fuel, DollarSign } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface AutresDepensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  achats: NouvelleAchat[];
  depensesTotal: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const AutresDepensesModal: React.FC<AutresDepensesModalProps> = ({
  isOpen,
  onClose,
  achats,
  depensesTotal,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  const depenses = achats.filter(a => a.type !== 'achat_produit');

  const getIcon = (type: string) => {
    switch (type) {
      case 'carburant': return <Fuel className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'taxes': return <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default: return <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'carburant': return 'Carburant';
      case 'taxes': return 'Taxes';
      default: return 'Autre';
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'carburant':
        return {
          bg: 'bg-orange-100 dark:bg-orange-500/20',
          border: 'border-orange-200 dark:border-orange-500/20',
          text: 'text-orange-700 dark:text-orange-400'
        };
      case 'taxes':
        return {
          bg: 'bg-red-100 dark:bg-red-500/20',
          border: 'border-red-200 dark:border-red-500/20',
          text: 'text-red-700 dark:text-red-400'
        };
      default:
        return {
          bg: 'bg-purple-100 dark:bg-purple-500/20',
          border: 'border-purple-200 dark:border-purple-500/20',
          text: 'text-purple-700 dark:text-purple-400'
        };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto
        bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/30
        backdrop-blur-xl border border-orange-100/50 dark:border-orange-800/30
        shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)]
        rounded-2xl sm:rounded-3xl">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Autres Dépenses - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Total: <span className="font-bold text-orange-600 dark:text-orange-400">{formatEuro(depensesTotal)}</span> ({depenses.length} dépenses)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {depenses.length > 0 ? (
            depenses.map((depense) => {
              const colors = getColorClasses(depense.type);
              return (
                <div
                  key={depense.id}
                  className="flex items-center justify-between p-4
                    rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-900/20 dark:to-amber-900/20
                    border border-orange-100 dark:border-orange-800/50
                    transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${colors.bg} ${colors.border}`}>
                      {getIcon(depense.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {depense.productDescription || depense.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
                        {new Date(depense.date).toLocaleDateString('fr-FR')}
                        {' • '}
                        <span className="font-medium">{getTypeLabel(depense.type)}</span>
                        {depense.categorie && ` • ${depense.categorie}`}
                      </p>
                    </div>
                  </div>
                  <p className={`text-lg font-black ${colors.text}`}>
                    {formatEuro(depense.totalCost)}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-400 dark:text-white/40 py-8">Aucune autre dépense ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutresDepensesModal;
