import React from 'react';
import { Target, History, Sparkles, ArrowUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ObjectifChange } from '@/services/api/objectifApi';

const MOIS_NOMS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

interface ObjectifChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectifChanges: ObjectifChange[];
  currentObjectif: number;
  annee: number;
}

const ObjectifChangesModal: React.FC<ObjectifChangesModalProps> = ({
  isOpen,
  onClose,
  objectifChanges,
  currentObjectif,
  annee
}) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Filter: only show changes from the current month
  const filteredChanges = objectifChanges.filter(change => {
    return change.mois === currentMonth && change.annee === currentYear;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-slate-950 dark:via-violet-950/30 dark:to-slate-900 border-violet-200/50 dark:border-violet-800/50 backdrop-blur-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30">
              <History className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Objectifs — {MOIS_NOMS[currentMonth - 1]} {currentYear}
            </span>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Current Objectif Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-300/50 dark:border-violet-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-violet-600 dark:text-violet-400">Objectif actuel</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(currentObjectif)}
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
            🔄 Les objectifs se réinitialisent à 2 000 € au 1er de chaque mois. Seules les modifications du mois en cours sont affichées.
          </div>

          {/* Timeline */}
          <div className="max-h-[300px] overflow-y-auto pr-1">
            {filteredChanges.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                
                <div className="space-y-4">
                  {filteredChanges.map((change, index) => (
                    <div
                      key={index}
                      className={cn(
                        "relative pl-12 animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-3 w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      
                      <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(change.date)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                            {MOIS_NOMS[change.mois - 1]}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground line-through">
                            {formatCurrency(change.ancienObjectif)}
                          </span>
                          <ArrowUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                            {formatCurrency(change.nouveauObjectif)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Aucun changement d'objectif ce mois-ci</p>
                <p className="text-xs mt-1">Objectif de départ : 2 000 €</p>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
        >
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ObjectifChangesModal;
