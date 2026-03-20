/**
 * BeneficeVentesModal - Modal affichant les détails du bénéfice des ventes
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TrendingUp } from 'lucide-react';
import { Sale } from '@/types/sale';
import { MONTHS } from '@/hooks/useComptabilite';

export interface BeneficeVentesModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlySales: Sale[];
  salesProfit: number;
  salesCount: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const BeneficeVentesModal: React.FC<BeneficeVentesModalProps> = ({
  isOpen,
  onClose,
  monthlySales,
  salesProfit,
  salesCount,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto
        bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30
        backdrop-blur-xl border border-blue-100/50 dark:border-blue-800/30
        shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)]
        rounded-2xl sm:rounded-3xl">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Détails Bénéfice Ventes - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Total: <span className="font-bold text-blue-600 dark:text-blue-400">{formatEuro(salesProfit)}</span> ({salesCount} ventes)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {monthlySales.length > 0 ? (
            monthlySales.map((sale) => {
              const profit = sale.products && Array.isArray(sale.products)
                ? (sale.totalProfit || 0)
                : sale.profit;
              return (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4
                    rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20
                    border border-blue-100 dark:border-blue-800/50
                    transition-all hover:scale-[1.01]"
                >
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white/90">
                      {sale.products && Array.isArray(sale.products)
                        ? sale.products.map((p: any) => p.description).join(', ')
                        : sale.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
                      {new Date(sale.date).toLocaleDateString('fr-FR')}
                      {sale.clientName && ` - ${sale.clientName}`}
                    </p>
                  </div>
                  <p className={`text-lg font-black ${profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatEuro(profit)}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-400 dark:text-white/40 py-8">Aucune vente ce mois</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficeVentesModal;
