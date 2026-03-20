import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { Tache } from '@/services/api/tacheApi';

interface TacheValidationModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tache: Tache | null;
  onValidate: (tache: Tache) => void;
  onCreateFollowUp: (tache: Tache) => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const TacheValidationModal: React.FC<TacheValidationModalProps> = ({
  open, onOpenChange, tache, onValidate, onCreateFollowUp, premiumBtnClass, mirrorShine
}) => {
  if (!tache) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-md">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className={cn(
            "mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl",
            tache.importance === 'pertinent'
              ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
          )}>
            <AlertTriangle className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-lg font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            ⏰ Vérification de tâche
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className={cn(
            'p-4 rounded-2xl border',
            tache.importance === 'pertinent'
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-emerald-500/10 border-emerald-500/20'
          )}>
            <p className="text-sm font-bold text-white">{tache.description}</p>
            <p className="text-xs text-white/60 mt-1">
              {tache.heureDebut} - {tache.heureFin}
              {tache.travailleurNom && ` • ${tache.travailleurNom}`}
            </p>
          </div>

          <p className="text-center text-sm text-white/70 font-semibold">
            Cette tâche est-elle terminée ?
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => onValidate(tache)}
              className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)]")}
            >
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full">
                <CheckCircle className="h-4 w-4 mr-2" /> Oui, terminée
              </span>
            </Button>
            <Button
              onClick={() => onCreateFollowUp(tache)}
              className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 border-amber-300/40 text-white shadow-[0_20px_70px_rgba(245,158,11,0.5)]")}
            >
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full">
                <RotateCcw className="h-4 w-4 mr-2" /> Non, reporter
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacheValidationModal;
