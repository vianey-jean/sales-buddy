import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, Clock, Edit, Trash2, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PointageEntry } from '@/services/api/pointageApi';

interface DayDetailModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDay: string | null;
  pointages: PointageEntry[];
  onEdit: (pt: PointageEntry) => void;
  onDelete: (id: string) => void;
  onAddPointage: () => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({
  open, onOpenChange, selectedDay, pointages, onEdit, onDelete, onAddPointage, premiumBtnClass, mirrorShine
}) => {
  const dayPointages = selectedDay ? pointages.filter(p => p.date === selectedDay) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-indigo-900/30 to-violet-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <CalendarDays className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            📅 {selectedDay && new Date(selectedDay + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </DialogTitle>
        </DialogHeader>
        {selectedDay && (
          <div className="space-y-3">
            {dayPointages.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50 font-bold">Aucun pointage ce jour</p>
                <Button onClick={onAddPointage}
                  className={cn(premiumBtnClass, "mt-4 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center"><Plus className="h-4 w-4 mr-2" /> Ajouter un pointage</span>
                </Button>
              </div>
            ) : (
              <>
                {dayPointages.map(pt => (
                  <div key={pt.id} className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{pt.entrepriseNom}</h4>
                        {(pt as any).travailleurNom && (
                          <p className="text-xs text-purple-400 mt-0.5 flex items-center gap-1">
                            <User className="h-3 w-3" /> {(pt as any).travailleurNom}
                          </p>
                        )}
                        <p className="text-xs text-white/60 mt-1">
                          {pt.typePaiement === 'journalier'
                            ? `Journalier: ${pt.prixJournalier}€`
                            : `${pt.heures}h × ${pt.prixHeure}€/h`}
                        </p>
                      </div>
                      <span className="text-lg font-black text-emerald-400">{pt.montantTotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => onEdit(pt)}
                        className={cn(premiumBtnClass, "bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30 text-blue-300 !py-1.5 !px-3 text-xs")}>
                        <span className="relative flex items-center"><Edit className="h-3 w-3 mr-1" /> Modifier</span>
                      </Button>
                      <Button size="sm" onClick={() => onDelete(pt.id)}
                        className={cn(premiumBtnClass, "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30 text-red-300 !py-1.5 !px-3 text-xs")}>
                        <span className="relative flex items-center"><Trash2 className="h-3 w-3 mr-1" /> Supprimer</span>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-sm font-black text-emerald-400">
                    Total du jour: {dayPointages.reduce((s, p) => s + p.montantTotal, 0).toFixed(2)}€
                  </span>
                </div>
                <Button onClick={onAddPointage}
                  className={cn(premiumBtnClass, "w-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center justify-center w-full"><Plus className="h-4 w-4 mr-2" /> Ajouter un autre pointage</span>
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DayDetailModal;
