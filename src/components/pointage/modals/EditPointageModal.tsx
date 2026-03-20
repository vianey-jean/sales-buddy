import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PointageEntry } from '@/services/api/pointageApi';
import { Travailleur } from '@/services/api/travailleurApi';
import TravailleurSearchInput from '../TravailleurSearchInput';

interface EditPointageModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingPointage: PointageEntry | null;
  setEditingPointage: (p: PointageEntry | null) => void;
  travailleurs: Travailleur[];
  onConfirm: () => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const EditPointageModal: React.FC<EditPointageModalProps> = ({
  open, onOpenChange, editingPointage, setEditingPointage, travailleurs, onConfirm, premiumBtnClass, mirrorShine
}) => {
  if (!editingPointage) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onOpenChange(false); setEditingPointage(null); } }}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-900/30 to-indigo-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-md">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Edit className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            ✏️ Modifier Pointage
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <p className="text-sm font-bold text-white">{editingPointage.entrepriseNom}</p>
            <p className="text-xs text-white/60">{editingPointage.typePaiement === 'journalier' ? 'Paiement journalier' : 'Paiement horaire'}</p>
          </div>

          {/* Travailleur search in edit modal */}
          <TravailleurSearchInput
            travailleurs={travailleurs}
            selectedId={(editingPointage as any).travailleurId || ''}
            selectedNom={(editingPointage as any).travailleurNom || ''}
            onSelect={(id, nom) => setEditingPointage({ ...editingPointage, travailleurId: id, travailleurNom: nom } as any)}
            onClear={() => setEditingPointage({ ...editingPointage, travailleurId: '', travailleurNom: '' } as any)}
            minChars={3}
          />

          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80">Date</Label>
            <Input type="date" value={editingPointage.date} onChange={e => setEditingPointage({ ...editingPointage, date: e.target.value })}
              className="bg-white/10 border border-white/20 rounded-xl text-white" />
          </div>

          {editingPointage.typePaiement === 'journalier' ? (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80">Prix journalier (€)</Label>
              <Input type="number" step="0.01" value={editingPointage.prixJournalier}
                onChange={e => setEditingPointage({ ...editingPointage, prixJournalier: parseFloat(e.target.value) || 0 })}
                className="bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80">Nombre d'heures</Label>
              <Input type="number" step="0.5" value={editingPointage.heures}
                onChange={e => setEditingPointage({ ...editingPointage, heures: parseFloat(e.target.value) || 0 })}
                className="bg-white/10 border border-white/20 rounded-xl text-white" />
              <p className="text-xs text-emerald-400 font-bold">
                💰 Total: {(editingPointage.heures * editingPointage.prixHeure).toFixed(2)}€
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={onConfirm}
              className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.6)]")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full">✅ Sauvegarder</span>
            </Button>
            <Button onClick={() => { onOpenChange(false); setEditingPointage(null); }}
              className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-white/20 to-white/5 border-white/20 text-white/90")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full"><X className="h-4 w-4 mr-2" /> Annuler</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPointageModal;
