import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, Building2, Search, User, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Travailleur } from '@/services/api/travailleurApi';
import { Entreprise } from '@/services/api/entrepriseApi';
import pointageApi from '@/services/api/pointageApi';
import avanceApi from '@/services/api/avanceApi';
import { useToast } from '@/hooks/use-toast';

interface AvanceModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  travailleurs: Travailleur[];
  entreprises: Entreprise[];
  premiumBtnClass: string;
  mirrorShine: string;
}

const AvanceModal: React.FC<AvanceModalProps> = ({
  open, onOpenChange, travailleurs, entreprises, premiumBtnClass, mirrorShine
}) => {
  const { toast } = useToast();
  const [travSearch, setTravSearch] = useState('');
  const [travId, setTravId] = useState('');
  const [travNom, setTravNom] = useState('');
  const [showTravDropdown, setShowTravDropdown] = useState(false);
  const [entrepriseId, setEntrepriseId] = useState('');
  const [totalPointage, setTotalPointage] = useState(0);
  const [totalAvancesDejaRecues, setTotalAvancesDejaRecues] = useState(0);
  const [montantAvance, setMontantAvance] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSalary, setLoadingSalary] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    if (!open) {
      setTravSearch(''); setTravId(''); setTravNom('');
      setEntrepriseId(''); setTotalPointage(0); setTotalAvancesDejaRecues(0);
      setMontantAvance(''); setConfirmSave(false);
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowTravDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredTravailleurs = travSearch.length >= 3
    ? travailleurs.filter(t => {
        const q = travSearch.toLowerCase();
        return `${t.prenom} ${t.nom}`.toLowerCase().includes(q) || `${t.nom} ${t.prenom}`.toLowerCase().includes(q);
      })
    : [];

  // Load salary details when travailleur + entreprise are selected
  useEffect(() => {
    if (!travId) { setTotalPointage(0); setTotalAvancesDejaRecues(0); return; }
    const loadSalary = async () => {
      setLoadingSalary(true);
      try {
        const [ptRes, avRes] = await Promise.all([
          pointageApi.getByMonth(currentYear, currentMonth),
          avanceApi.getByTravailleur(travId, currentMonth, currentYear)
        ]);
        let pts = ptRes.data.filter((p: any) => p.travailleurId === travId);
        if (entrepriseId) {
          pts = pts.filter((p: any) => p.entrepriseId === entrepriseId);
        }
        const total = pts.reduce((s: number, p: any) => s + p.montantTotal, 0);
        const totalAv = avRes.data.reduce((s: number, a: any) => s + a.montant, 0);
        setTotalPointage(total);
        setTotalAvancesDejaRecues(totalAv);
      } catch {
        setTotalPointage(0);
        setTotalAvancesDejaRecues(0);
      } finally {
        setLoadingSalary(false);
      }
    };
    loadSalary();
  }, [travId, entrepriseId, currentMonth, currentYear]);

  const disponible = Math.max(0, totalPointage - totalAvancesDejaRecues);
  const montantNum = parseFloat(montantAvance) || 0;
  const resteApres = disponible - montantNum;
  const depassement = montantNum > disponible;

  const handleSave = async () => {
    if (!travId || montantNum <= 0 || depassement) return;
    setLoading(true);
    try {
      const entNom = entreprises.find(e => e.id === entrepriseId)?.nom || '';
      await avanceApi.create({
        travailleurId: travId,
        travailleurNom: travNom,
        entrepriseId,
        entrepriseNom: entNom,
        montant: montantNum,
        totalPointage,
        resteApresAvance: resteApres,
        mois: currentMonth,
        annee: currentYear,
      });
      toast({ title: '✅ Avance enregistrée', description: `${travNom} - ${montantNum.toFixed(2)}€` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setLoading(false);
      setConfirmSave(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-amber-900/20 to-orange-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Banknote className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            💰 Prise d'Avance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Travailleur search */}
          <div className="space-y-2" ref={dropdownRef}>
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <User className="h-4 w-4 text-purple-400" /> Personne (min. 3 caractères)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input value={travSearch}
                onChange={e => {
                  setTravSearch(e.target.value);
                  setTravId(''); setTravNom('');
                  if (e.target.value.length >= 3) setShowTravDropdown(true);
                  else setShowTravDropdown(false);
                }}
                placeholder="Nom et prénom..."
                className="bg-white/10 border border-white/20 focus:border-amber-400 rounded-xl text-white placeholder:text-white/40 pl-10"
              />
              {showTravDropdown && filteredTravailleurs.length > 0 && (
                <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl bg-slate-800/95 backdrop-blur-2xl border border-white/20 shadow-2xl">
                  {filteredTravailleurs.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => {
                        setTravId(t.id);
                        setTravNom(`${t.prenom} ${t.nom}`);
                        setTravSearch(`${t.prenom} ${t.nom}`);
                        setShowTravDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                        {t.prenom[0]}{t.nom[0]}
                      </div>
                      <div className="text-sm font-bold text-white">{t.prenom} {t.nom}</div>
                    </button>
                  ))}
                </div>
              )}
              {travNom && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <User className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">{travNom}</span>
                  <button onClick={() => { setTravId(''); setTravNom(''); setTravSearch(''); }}
                    className="ml-auto text-white/50 hover:text-white"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>
          </div>

          {/* Entreprise select */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" /> Entreprise (optionnel)
            </Label>
            <Select value={entrepriseId} onValueChange={setEntrepriseId}>
              <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white">
                <SelectValue placeholder="Toutes les entreprises" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entreprises</SelectItem>
                {entreprises.map(e => <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Salary details */}
          {travId && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              {loadingSalary ? (
                <p className="text-white/50 text-sm text-center animate-pulse">Chargement...</p>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Total pointage du mois</span>
                    <span className="text-lg font-black text-emerald-400">{totalPointage.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Avances déjà reçues</span>
                    <span className="text-lg font-black text-orange-400">-{totalAvancesDejaRecues.toFixed(2)}€</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white/90">Disponible</span>
                    <span className="text-xl font-black text-cyan-400">{disponible.toFixed(2)}€</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Avance amount */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-amber-400" /> Montant de l'avance
            </Label>
            <Input type="number" min="0" max={disponible}
              value={montantAvance}
              onChange={e => setMontantAvance(e.target.value)}
              placeholder="0.00"
              className={cn("bg-white/10 border rounded-xl text-white text-lg font-bold", depassement ? "border-red-500" : "border-white/20")}
            />
            {depassement && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertTriangle className="h-3.5 w-3.5" /> Le montant dépasse le disponible ({disponible.toFixed(2)}€)
              </div>
            )}
            {montantNum > 0 && !depassement && (
              <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs text-emerald-300">Reste après avance</span>
                <span className="text-sm font-black text-emerald-400">{resteApres.toFixed(2)}€</span>
              </div>
            )}
          </div>

          {/* Confirm */}
          {confirmSave ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <p className="text-sm font-bold text-amber-300">⚠️ Confirmer l'enregistrement de cette avance de {montantNum.toFixed(2)}€ pour {travNom} ?</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmSave(false)} className="flex-1 rounded-xl border-white/20 text-white hover:bg-white/10">Annuler</Button>
                <Button onClick={handleSave} disabled={loading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold">
                  {loading ? '⏳...' : '✅ Confirmer'}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setConfirmSave(true)}
              disabled={!travId || montantNum <= 0 || depassement || loading}
              className={cn(premiumBtnClass, "w-full bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 border-amber-300/40 text-white shadow-[0_20px_70px_rgba(245,158,11,0.5)] disabled:opacity-50")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full">
                💰 Enregistrer l'avance
              </span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvanceModal;
