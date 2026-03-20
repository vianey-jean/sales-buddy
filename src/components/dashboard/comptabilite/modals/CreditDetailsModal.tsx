/**
 * CreditDetailsModal - Modal affichant les détails du crédit (ventes)
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { Sale } from '@/types/sale';
import { MONTHS } from '@/hooks/useComptabilite';

export interface CreditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlySales: Sale[];
  totalCredit: number;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({
  isOpen,
  onClose,
  monthlySales,
  totalCredit,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto
        bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30
        backdrop-blur-xl border border-green-100/50 dark:border-green-800/30
        shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)]
        rounded-2xl sm:rounded-3xl">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
              <ArrowUpCircle className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Détails Crédit - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Total: <span className="font-bold text-green-600 dark:text-green-400">{formatEuro(totalCredit)}</span> ({monthlySales.length} ventes)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {monthlySales.length > 0 ? (
            monthlySales.map((sale) => {
              const saleTotal = sale.products && Array.isArray(sale.products)
                ? (sale.totalSellingPrice || 0)
                : sale.sellingPrice * sale.quantitySold;
              const isNegative = saleTotal < 0;
              const isRefund = sale.isRefund || isNegative;

              return (
                <div
                  key={sale.id}
                  className={`relative p-4 rounded-xl border transition-all hover:scale-[1.01] ${isRefund
                    ? 'bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-800/50'
                    : 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800/50'
                  }`}
                >
                  {isRefund && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                      <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">Remboursement</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isRefund ? 'text-red-600 dark:text-red-300' : 'text-gray-800 dark:text-white/90'}`}>
                        {sale.products && Array.isArray(sale.products)
                          ? sale.products.map((p: any) => p.description).join(', ')
                          : sale.description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                        {sale.clientName && ` - ${sale.clientName}`}
                      </p>
                    </div>
                    <p className={`text-lg font-black ${isRefund || isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {formatEuro(saleTotal)}
                    </p>
                  </div>
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

export default CreditDetailsModal;
