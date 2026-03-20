import React from 'react';
import { TrendingUp, Coins, Sparkles, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BeneficeMensuel } from '@/services/api/objectifApi';

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

interface BeneficesHistoriqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficesHistorique: BeneficeMensuel[];
  annee: number;
}

const BeneficesHistoriqueModal: React.FC<BeneficesHistoriqueModalProps> = ({
  isOpen,
  onClose,
  beneficesHistorique,
  annee
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalAnnuel = beneficesHistorique.reduce((sum, b) => sum + b.totalBenefice, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-900 border-emerald-200/50 dark:border-emerald-800/50 backdrop-blur-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Bénéfices {annee}
            </span>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Total Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-300/50 dark:border-emerald-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Total annuel</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {formatCurrency(totalAnnuel)}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly List */}
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {beneficesHistorique.length > 0 ? (
              beneficesHistorique.map((item, index) => (
                <div
                  key={`${item.mois}-${item.annee}`}
                  className={cn(
                    "p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                        item.totalBenefice >= 0 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                          : "bg-gradient-to-br from-rose-500 to-pink-500"
                      )}>
                        {MOIS_NOMS[item.mois - 1].substring(0, 3)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                          {MOIS_NOMS[item.mois - 1]}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.annee}</p>
                      </div>
                    </div>
                    <p className={cn(
                      "text-lg font-bold",
                      item.totalBenefice >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {formatCurrency(item.totalBenefice)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Aucun bénéfice enregistré</p>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BeneficesHistoriqueModal;
