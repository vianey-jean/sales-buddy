import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Timer, CalendarDays, Building2, Euro, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Entreprise } from '@/services/api/entrepriseApi';
import { Travailleur } from '@/services/api/travailleurApi';
import TravailleurSearchInput from '../TravailleurSearchInput';

interface PointageFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: { date: string; entrepriseId: string; heures: string; prixJournalier: string; travailleurId: string; travailleurNom: string };
  setForm: (f: any) => void;
  entreprises: Entreprise[];
  travailleurs: Travailleur[];
  onSubmit: () => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const PointageFormModal: React.FC<PointageFormModalProps> = ({
  open, onOpenChange, form, setForm, entreprises, travailleurs, onSubmit, premiumBtnClass, mirrorShine
}) => {
  const selectedEntreprise = entreprises.find(e => e.id === form.entrepriseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-emerald-900/30 to-teal-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-md">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <Timer className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            ✨ Nouveau Pointage
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <TravailleurSearchInput
            travailleurs={travailleurs}
            selectedId={form.travailleurId}
            selectedNom={form.travailleurNom}
            onSelect={(id, nom) => setForm({ ...form, travailleurId: id, travailleurNom: nom })}
            onClear={() => setForm({ ...form, travailleurId: '', travailleurNom: '' })}
            minChars={3}
          />

          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-cyan-400" /> Date
            </Label>
            <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" /> Entreprise
            </Label>
            <Select value={form.entrepriseId} onValueChange={v => setForm({ ...form, entrepriseId: v })}>
              <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white">
                <SelectValue placeholder="Choisir une entreprise" />
              </SelectTrigger>
              <SelectContent>
                {entreprises.map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nom} ({e.typePaiement === 'journalier' ? `${e.prix}€/jour` : `${e.prix}€/h`})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEntreprise && selectedEntreprise.typePaiement === 'journalier' && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                <Euro className="h-4 w-4 text-amber-400" /> Prix journalier (€)
              </Label>
              <Input type="number" step="0.01" value={form.prixJournalier || selectedEntreprise.prix}
                onChange={e => setForm({ ...form, prixJournalier: e.target.value })} placeholder={`${selectedEntreprise.prix}`}
                className="bg-white/10 border border-white/20 focus:border-amber-400 rounded-xl text-white placeholder:text-white/40" />
              <p className="text-xs text-emerald-400 font-bold">
                💰 Total: {(form.prixJournalier ? parseFloat(form.prixJournalier) : selectedEntreprise.prix).toFixed(2)}€
              </p>
            </div>
          )}

          {selectedEntreprise && selectedEntreprise.typePaiement === 'horaire' && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" /> Nombre d'heures
              </Label>
              <Input type="number" step="0.5" value={form.heures} onChange={e => setForm({ ...form, heures: e.target.value })} placeholder="Ex: 8"
                className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40" />
              {form.heures && (
                <p className="text-xs text-emerald-400 font-bold">
                  💰 Total: {(parseFloat(form.heures) * selectedEntreprise.prix).toFixed(2)}€ ({form.heures}h × {selectedEntreprise.prix}€)
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={onSubmit} disabled={!form.entrepriseId}
              className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)] disabled:opacity-50 disabled:hover:scale-100")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full">✅ Enregistrer</span>
            </Button>
            <Button onClick={() => onOpenChange(false)}
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

export default PointageFormModal;
