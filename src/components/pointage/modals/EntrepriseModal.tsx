import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Briefcase, Euro, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import parametresApi from '@/services/api/parametresApi';

interface EntrepriseModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: { nom: string; adresse: string; typePaiement: 'journalier' | 'horaire'; prix: string };
  setForm: (f: any) => void;
  onSubmit: () => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const EntrepriseModal: React.FC<EntrepriseModalProps> = ({
  open, onOpenChange, form, setForm, onSubmit, premiumBtnClass, mirrorShine
}) => {
  const [prixDefaults, setPrixDefaults] = useState({ prixHeure: 10, prixJournalier: 80 });

  useEffect(() => {
    if (open) {
      parametresApi.getPrixPointage()
        .then(data => {
          setPrixDefaults(data);
          // Auto-fill price based on current type
          if (!form.prix) {
            const defaultPrix = form.typePaiement === 'journalier' ? data.prixJournalier : data.prixHeure;
            setForm({ ...form, prix: String(defaultPrix) });
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const handleTypeChange = (v: 'journalier' | 'horaire') => {
    const newPrix = v === 'journalier' ? prixDefaults.prixJournalier : prixDefaults.prixHeure;
    setForm({ ...form, typePaiement: v, prix: String(newPrix) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-cyan-900/30 to-blue-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-md">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/30">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            ✨ Nouvelle Entreprise
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" /> Nom de l'entreprise
            </Label>
            <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Restaurant Le Paradis"
              className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white placeholder:text-white/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-400" /> Adresse (optionnel)
            </Label>
            <Input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Ex: 12 rue de la Paix"
              className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80">Type de paiement</Label>
            <Select value={form.typePaiement} onValueChange={v => handleTypeChange(v as 'journalier' | 'horaire')}>
              <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="journalier">💰 Paiement Journalier</SelectItem>
                <SelectItem value="horaire">⏰ Paiement par Heure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Euro className="h-4 w-4 text-emerald-400" />
              {form.typePaiement === 'journalier' ? 'Prix par jour (€)' : 'Prix par heure (€)'}
            </Label>
            <Input type="number" step="0.01" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} placeholder="Ex: 25"
              className="bg-white/10 border border-white/20 focus:border-emerald-400 rounded-xl text-white placeholder:text-white/40" />
            <p className="text-xs text-white/40">
              Prix par défaut : {form.typePaiement === 'journalier' ? `${prixDefaults.prixJournalier}€/jour` : `${prixDefaults.prixHeure}€/h`}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={onSubmit}
              className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)]")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full">✅ Ajouter</span>
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

export default EntrepriseModal;
