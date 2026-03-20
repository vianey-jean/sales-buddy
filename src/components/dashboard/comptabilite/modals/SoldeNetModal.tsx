/**
 * SoldeNetModal - Modal affichant les détails du solde net
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, ArrowUpCircle, ArrowDownCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { ComptabiliteData } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface SoldeNetModalProps {
  isOpen: boolean;
  onClose: () => void;
  comptabiliteData: ComptabiliteData;
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
}

const SoldeNetModal: React.FC<SoldeNetModalProps> = ({
  isOpen,
  onClose,
  comptabiliteData,
  selectedMonth,
  selectedYear,
  formatEuro
}) => {
  const ratio = comptabiliteData.totalCredit > 0
    ? (comptabiliteData.totalDebit / comptabiliteData.totalCredit) * 100
    : 0;
  const healthyRatio = ratio <= 70;
  const isPositive = comptabiliteData.soldeNet >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[80vh] overflow-y-auto
        bg-gradient-to-br ${isPositive ? 'from-white to-cyan-50/50 dark:from-gray-900 dark:to-cyan-950/30' : 'from-white to-red-50/50 dark:from-gray-900 dark:to-red-950/30'}
        backdrop-blur-xl border ${isPositive ? 'border-cyan-100/50 dark:border-cyan-800/30' : 'border-red-100/50 dark:border-red-800/30'}
        shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)]
        rounded-2xl sm:rounded-3xl`}>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-lg text-white ${isPositive ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-orange-600'}`}>
              <PiggyBank className="h-5 w-5" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r ${isPositive ? 'from-cyan-600 to-blue-600' : 'from-red-600 to-orange-600'} bg-clip-text text-transparent`}>
              Solde Net - {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Solde Net = Total Crédit - Total Débit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Comparaison visuelle Crédit vs Débit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-green-50/80 dark:bg-green-500/[0.06] border border-green-200/60 dark:border-green-500/20 rounded-xl backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/20">
                  <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">Total Crédit</p>
                  <p className="text-2xl font-black text-green-700 dark:text-green-400">{formatEuro(comptabiliteData.totalCredit)}</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-red-50/80 dark:bg-red-500/[0.06] border border-red-200/60 dark:border-red-500/20 rounded-xl backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/20">
                  <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">Total Débit</p>
                  <p className="text-2xl font-black text-red-700 dark:text-red-400">{formatEuro(comptabiliteData.totalDebit)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Solde final */}
          <div className={`p-5 rounded-xl backdrop-blur-sm border shadow-sm ${isPositive
            ? 'bg-cyan-50/80 dark:bg-cyan-500/[0.06] border-cyan-200/60 dark:border-cyan-500/20'
            : 'bg-red-50/80 dark:bg-red-500/[0.06] border-red-200/60 dark:border-red-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${isPositive
                  ? 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/20'
                  : 'bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/20'
                }`}>
                  <PiggyBank className={`h-6 w-6 ${isPositive ? 'text-cyan-600 dark:text-cyan-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isPositive ? 'text-cyan-700 dark:text-cyan-400' : 'text-red-700 dark:text-red-400'}`}>Solde Net</p>
                  <p className={`text-3xl font-black ${isPositive ? 'text-cyan-700 dark:text-cyan-400' : 'text-red-700 dark:text-red-400'}`}>{formatEuro(comptabiliteData.soldeNet)}</p>
                </div>
              </div>
              {isPositive ? (
                <span className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-1.5 bg-green-100 dark:bg-green-500/10 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-500/20">
                  <CheckCircle className="h-4 w-4" /> Positif
                </span>
              ) : (
                <span className="text-red-700 dark:text-red-400 text-sm font-medium flex items-center gap-1.5 bg-red-100 dark:bg-red-500/10 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-500/20">
                  <AlertCircle className="h-4 w-4" /> Négatif
                </span>
              )}
            </div>
          </div>

          {/* Ratio dépenses/revenus */}
          <div className="border-t border-gray-200/60 dark:border-white/[0.06] pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-700 dark:text-white/70">Ratio Dépenses/Revenus</p>
              <span className={`text-sm font-black px-3 py-1 rounded-full border ${healthyRatio
                ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
                : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
              }`}>
                {ratio.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(ratio, 100)} className="h-3" />
            <p className="text-xs text-gray-500 dark:text-white/40 mt-2">
              {healthyRatio
                ? '✅ Ratio sain (moins de 70% des revenus dépensés)'
                : '⚠️ Attention: plus de 70% des revenus sont dépensés'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SoldeNetModal;
