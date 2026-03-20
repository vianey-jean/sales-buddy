import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface TacheConfirmDialogProps {
  deleteConfirm: string | null;
  setDeleteConfirm: (v: string | null) => void;
  onDelete: (id: string) => void;
  moveConfirm: { tacheId: string; newDate: string; newHeure: string; newHeureFin: string } | null;
  setMoveConfirm: (v: any) => void;
  onMoveConfirm: () => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const TacheConfirmDialog: React.FC<TacheConfirmDialogProps> = ({
  deleteConfirm, setDeleteConfirm, onDelete,
  moveConfirm, setMoveConfirm, onMoveConfirm,
  premiumBtnClass, mirrorShine
}) => {
  return (
    <>
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-red-900/20 to-rose-900/10 backdrop-blur-2xl border border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black">⚠️ Supprimer cette tâche ?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && onDelete(deleteConfirm)}
              className={cn(premiumBtnClass, "bg-gradient-to-br from-red-500 to-rose-600 border-red-300/40 text-white")}
            >
              <span className={mirrorShine} />
              <span className="relative">Supprimer</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!moveConfirm} onOpenChange={() => setMoveConfirm(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/20 to-purple-900/10 backdrop-blur-2xl border border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black">📋 Confirmer le déplacement ?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Déplacer cette tâche vers le{' '}
              <span className="font-bold text-violet-400">
                {moveConfirm?.newDate}
              </span>
              {' '}de{' '}
              <span className="font-bold text-violet-400">
                {moveConfirm?.newHeure}
              </span>
              {' '}à{' '}
              <span className="font-bold text-violet-400">
                {moveConfirm?.newHeureFin}
              </span> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
              Non, annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onMoveConfirm}
              className={cn(premiumBtnClass, "bg-gradient-to-br from-violet-500 to-purple-600 border-violet-300/40 text-white")}
            >
              <span className={mirrorShine} />
              <span className="relative">Oui, déplacer</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TacheConfirmDialog;