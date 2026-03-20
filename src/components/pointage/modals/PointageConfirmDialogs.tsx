import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointageConfirmDialogsProps {
  deleteConfirm: string | null;
  setDeleteConfirm: (v: string | null) => void;
  onDelete: (id: string) => void;
  editConfirm: boolean;
  setEditConfirm: (v: boolean) => void;
  onEditConfirm: () => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const PointageConfirmDialogs: React.FC<PointageConfirmDialogsProps> = ({
  deleteConfirm, setDeleteConfirm, onDelete, editConfirm, setEditConfirm, onEditConfirm, premiumBtnClass, mirrorShine
}) => {
  return (
    <>
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-red-900/30 to-rose-900/20 backdrop-blur-2xl border border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black">🗑️ Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Voulez-vous vraiment supprimer ce pointage ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={cn(premiumBtnClass, "bg-gradient-to-br from-white/20 to-white/5 border-white/20 text-white/90")}>
              <span className="relative flex items-center"><X className="h-4 w-4 mr-2" /> Annuler</span>
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && onDelete(deleteConfirm)}
              className={cn(premiumBtnClass, "bg-gradient-to-br from-red-500 via-red-600 to-rose-700 border-red-300/40 text-white shadow-[0_20px_70px_rgba(239,68,68,0.5)]")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center"><Trash2 className="h-4 w-4 mr-2" /> Supprimer</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={editConfirm} onOpenChange={setEditConfirm}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-blue-900/30 to-indigo-900/20 backdrop-blur-2xl border border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black">✏️ Confirmer la modification</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Voulez-vous enregistrer les modifications de ce pointage ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className={cn(premiumBtnClass, "bg-gradient-to-br from-white/20 to-white/5 border-white/20 text-white/90")}>
              <span className="relative flex items-center"><X className="h-4 w-4 mr-2" /> Annuler</span>
            </AlertDialogCancel>
            <AlertDialogAction onClick={onEditConfirm}
              className={cn(premiumBtnClass, "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.6)]")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center">✅ Confirmer</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PointageConfirmDialogs;
