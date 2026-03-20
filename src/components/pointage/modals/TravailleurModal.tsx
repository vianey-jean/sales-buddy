import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, User, MapPin, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TravailleurModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: { nom: string; prenom: string; adresse: string; phone: string; genre: 'homme' | 'femme'; role?: 'administrateur' | 'autre' };
  setForm: (f: any) => void;
  onSubmit: () => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const TravailleurModal: React.FC<TravailleurModalProps> = ({
  open, onOpenChange, form, setForm, onSubmit, premiumBtnClass, mirrorShine
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-red-900/30 to-rose-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-md">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            ✨ Ajouter un Travailleur
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2"><User className="h-4 w-4 text-red-400" /> Nom *</Label>
            <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Dupont"
              className="bg-white/10 border border-white/20 focus:border-red-400 rounded-xl text-white placeholder:text-white/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2"><User className="h-4 w-4 text-rose-400" /> Prénom *</Label>
            <Input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Ex: Jean"
              className="bg-white/10 border border-white/20 focus:border-rose-400 rounded-xl text-white placeholder:text-white/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" /> Adresse</Label>
            <Input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Ex: 12 rue de la Paix"
              className="bg-white/10 border border-white/20 focus:border-amber-400 rounded-xl text-white placeholder:text-white/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2"><Phone className="h-4 w-4 text-blue-400" /> Numéro de téléphone</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Ex: 0692123456" type="tel"
              className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">🏷️ Rôle</Label>
            <Select value={form.role || 'autre'} onValueChange={v => setForm({ ...form, role: v as 'administrateur' | 'autre' })}>
              <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="administrateur">👑 Administrateur</SelectItem>
                <SelectItem value="autre">👤 Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80">Genre</Label>
            <Select value={form.genre} onValueChange={v => setForm({ ...form, genre: v as 'homme' | 'femme' })}>
              <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="homme">👨 Homme</SelectItem>
                <SelectItem value="femme">👩 Femme</SelectItem>
              </SelectContent>
            </Select>
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

export default TravailleurModal;
