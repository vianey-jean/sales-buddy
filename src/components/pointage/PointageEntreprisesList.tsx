import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Euro, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Entreprise } from '@/services/api/entrepriseApi';
import entrepriseApi from '@/services/api/entrepriseApi';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EntrepriseEditModal from '@/components/pointage/modals/EntrepriseEditModal';

interface PointageEntreprisesListProps {
  entreprises: Entreprise[];
  onRefresh?: () => void;
}

const PointageEntreprisesList: React.FC<PointageEntreprisesListProps> = ({ entreprises, onRefresh }) => {
  const [show, setShow] = useState(true);
  const { toast } = useToast();

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Entreprise | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editTarget, setEditTarget] = useState<Entreprise | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await entrepriseApi.delete(deleteTarget.id);
      toast({ title: '✅ Entreprise supprimée', description: `${deleteTarget.nom} a été supprimée`, className: 'bg-green-600 text-white border-green-600' });
      onRefresh?.();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer l\'entreprise', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleEditSubmit = async (data: { nom: string; adresse: string; typePaiement: 'journalier' | 'horaire'; prix: string }) => {
    if (!editTarget) return;
    try {
      await entrepriseApi.update(editTarget.id, {
        nom: data.nom,
        adresse: data.adresse,
        typePaiement: data.typePaiement,
        prix: Number(data.prix),
      });
      toast({ title: '✅ Entreprise modifiée', description: `${data.nom} a été mise à jour`, className: 'bg-green-600 text-white border-green-600' });
      setShowEditModal(false);
      setEditTarget(null);
      onRefresh?.();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de modifier l\'entreprise', variant: 'destructive' });
    }
  };

  if (entreprises.length === 0) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4 sm:p-6">
        <button onClick={() => setShow(!show)}
          className="w-full flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity">
          <h3 className="text-lg font-black bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-500" /> Listes des Entreprises ({entreprises.length})
          </h3>
          {show ? <ChevronUp className="h-5 w-5 text-cyan-500" /> : <ChevronDown className="h-5 w-5 text-cyan-500" />}
        </button>
        {show && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entreprises.map(ent => (
              <div key={ent.id} className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{ent.nom}</h4>
                    {ent.adresse && <p className="text-xs text-muted-foreground mt-1">{ent.adresse}</p>}
                  </div>
                  <span className={cn(
                    'text-[10px] px-2 py-1 rounded-full font-bold',
                    ent.typePaiement === 'journalier' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  )}>
                    {ent.typePaiement === 'journalier' ? 'Journalier' : 'Horaire'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Euro className="h-4 w-4 text-emerald-500" />
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {ent.prix}€ {ent.typePaiement === 'horaire' ? '/h' : '/jour'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditTarget(ent); setShowEditModal(true); }}
                      className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ent)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-red-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" /> Supprimer l'entreprise
            </AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer <strong>{deleteTarget?.nom}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white">
              {deleting ? 'Suppression...' : '🗑️ Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit modal */}
      {editTarget && (
        <EntrepriseEditModal
          open={showEditModal}
          onOpenChange={v => { setShowEditModal(v); if (!v) setEditTarget(null); }}
          entreprise={editTarget}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
};

export default PointageEntreprisesList;
