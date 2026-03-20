import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Briefcase, Euro, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Entreprise } from '@/services/api/entrepriseApi';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";
const mirrorShine = "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700";

interface EntrepriseEditModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entreprise: Entreprise;
  onSubmit: (data: { nom: string; adresse: string; typePaiement: 'journalier' | 'horaire'; prix: string }) => void;
}

const EntrepriseEditModal: React.FC<EntrepriseEditModalProps> = ({
  open, onOpenChange, entreprise, onSubmit
}) => {
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    typePaiement: 'journalier' as 'journalier' | 'horaire',
    prix: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (open && entreprise) {
      setForm({
        nom: entreprise.nom,
        adresse: entreprise.adresse || '',
        typePaiement: entreprise.typePaiement,
        prix: String(entreprise.prix),
      });
    }
  }, [open, entreprise]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-cyan-900/30 to-blue-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-md">
          <DialogHeader className="text-center space-y-3 pb-4">
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              ✏️ Modifier l'Entreprise
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
              <Select value={form.typePaiement} onValueChange={v => setForm({ ...form, typePaiement: v as 'journalier' | 'horaire' })}>
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
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => setShowConfirm(true)} disabled={!form.nom || !form.prix}
                className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.6)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center justify-center w-full"><Save className="h-4 w-4 mr-2" /> Modifier</span>
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

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-blue-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-blue-600">
              <Building2 className="w-5 h-5" /> Confirmer la modification
            </AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous enregistrer les modifications de <strong>{form.nom}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowConfirm(false); onSubmit(form); }}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              ✅ Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EntrepriseEditModal;
