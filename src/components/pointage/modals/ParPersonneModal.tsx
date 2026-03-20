import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Building2, Search, User, X, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PointageEntry } from '@/services/api/pointageApi';
import pointageApi from '@/services/api/pointageApi';
import avanceApi, { Avance } from '@/services/api/avanceApi';
import { Travailleur } from '@/services/api/travailleurApi';
import { useToast } from '@/hooks/use-toast';

const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

interface ParPersonneModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  travailleurs: Travailleur[];
  premiumBtnClass: string;
  mirrorShine: string;
}

const ParPersonneModal: React.FC<ParPersonneModalProps> = ({
  open, onOpenChange, travailleurs, premiumBtnClass, mirrorShine
}) => {
  const { toast } = useToast();
  const [ppMonth, setPpMonth] = useState(new Date().getMonth() + 1);
  const [ppYear, setPpYear] = useState(new Date().getFullYear());
  const [ppTravSearch, setPpTravSearch] = useState('');
  const [ppTravailleurId, setPpTravailleurId] = useState('');
  const [ppTravailleurNom, setPpTravailleurNom] = useState('');
  const [ppShowDropdown, setPpShowDropdown] = useState(false);
  const [ppResults, setPpResults] = useState<PointageEntry[]>([]);
  const [ppAvances, setPpAvances] = useState<Avance[]>([]);
  const [ppLoading, setPpLoading] = useState(false);
  const [ppSearched, setPpSearched] = useState(false);
  const ppDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setPpTravSearch('');
      setPpTravailleurId('');
      setPpTravailleurNom('');
      setPpResults([]);
      setPpAvances([]);
      setPpSearched(false);
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ppDropdownRef.current && !ppDropdownRef.current.contains(e.target as Node)) setPpShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const ppFilteredTravailleurs = ppTravSearch.length >= 3
    ? travailleurs.filter(t => {
        const q = ppTravSearch.toLowerCase();
        return `${t.prenom} ${t.nom}`.toLowerCase().includes(q) || `${t.nom} ${t.prenom}`.toLowerCase().includes(q);
      })
    : [];

  const handleSearch = async () => {
    if (!ppTravailleurId) {
      toast({ title: 'Erreur', description: 'Veuillez choisir une personne', variant: 'destructive' });
      return;
    }
    setPpLoading(true);
    try {
      const [ptRes, avRes] = await Promise.all([
        pointageApi.getByMonth(ppYear, ppMonth),
        avanceApi.getByTravailleur(ppTravailleurId, ppMonth, ppYear)
      ]);
      const filtered = ptRes.data.filter((p: any) => p.travailleurId === ppTravailleurId);
      setPpResults(filtered);
      setPpAvances(avRes.data);
      setPpSearched(true);
    } catch (err) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setPpLoading(false);
    }
  };

  const ppGroupedByEntreprise = ppResults.reduce((acc, p) => {
    const key = p.entrepriseNom || p.entrepriseId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, PointageEntry[]>);

  const ppGlobalTotal = ppResults.reduce((s, p) => s + p.montantTotal, 0);
  const ppTotalAvances = ppAvances.reduce((s, a) => s + a.montant, 0);
  const ppResteDisponible = Math.max(0, ppGlobalTotal - ppTotalAvances);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-[#800020]/30 to-[#6b001a]/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-[#800020] to-[#6b001a] rounded-2xl flex items-center justify-center shadow-xl shadow-[#800020]/30">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-[#ff6b8a] to-[#c0506f] bg-clip-text text-transparent">
            📊 Pointage Par Personne
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80">Mois</Label>
              <Select value={String(ppMonth)} onValueChange={v => setPpMonth(Number(v))}>
                <SelectTrigger className="bg-white/10 border border-white/20 rounded-xl text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {monthNames.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80">Année</Label>
              <Input type="number" value={ppYear} onChange={e => setPpYear(Number(e.target.value))}
                className="bg-white/10 border border-white/20 rounded-xl text-white" />
            </div>
          </div>

          <div className="space-y-2" ref={ppDropdownRef}>
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <User className="h-4 w-4 text-purple-400" /> Personne (min. 3 caractères)
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input value={ppTravSearch}
                onChange={e => {
                  setPpTravSearch(e.target.value);
                  setPpTravailleurId('');
                  setPpTravailleurNom('');
                  if (e.target.value.length >= 3) setPpShowDropdown(true);
                  else setPpShowDropdown(false);
                }}
                placeholder="Nom et prénom..."
                className="bg-white/10 border border-white/20 focus:border-purple-400 rounded-xl text-white placeholder:text-white/40 pl-10"
              />
              {ppShowDropdown && ppFilteredTravailleurs.length > 0 && (
                <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl bg-slate-800/95 backdrop-blur-2xl border border-white/20 shadow-2xl">
                  {ppFilteredTravailleurs.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => {
                        setPpTravailleurId(t.id);
                        setPpTravailleurNom(`${t.prenom} ${t.nom}`);
                        setPpTravSearch(`${t.prenom} ${t.nom}`);
                        setPpShowDropdown(false);
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
              {ppTravailleurNom && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <User className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-300">{ppTravailleurNom}</span>
                  <button onClick={() => { setPpTravailleurId(''); setPpTravailleurNom(''); setPpTravSearch(''); }}
                    className="ml-auto text-white/50 hover:text-white"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>
          </div>

          <Button onClick={handleSearch} disabled={!ppTravailleurId || ppLoading}
            className={cn(premiumBtnClass, "w-full bg-gradient-to-br from-[#800020] via-[#900028] to-[#6b001a] border-[#c0506070] text-white shadow-[0_20px_70px_rgba(128,0,32,0.5)] disabled:opacity-50")}>
            <span className={mirrorShine} />
            <span className="relative flex items-center justify-center w-full">
              {ppLoading ? '⏳ Chargement...' : '🔍 Rechercher'}
            </span>
          </Button>

          {ppSearched && (
            <div className="space-y-3 mt-4">
              {ppResults.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-white/50 font-bold">Aucun pointage trouvé pour {ppTravailleurNom} en {monthNames[ppMonth - 1]} {ppYear}</p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <p className="text-sm font-bold text-purple-300">📊 {ppTravailleurNom} — {monthNames[ppMonth - 1]} {ppYear}</p>
                    <p className="text-xs text-white/60 mt-1">{ppResults.length} pointage(s)</p>
                  </div>

                  {Object.entries(ppGroupedByEntreprise).map(([entName, pts]) => {
                    const totalHeures = pts.reduce((s, p) => s + (p.heures || 0), 0);
                    const totalJours = pts.filter(p => p.typePaiement === 'journalier').length;
                    const totalEntreprise = pts.reduce((s, p) => s + p.montantTotal, 0);
                    const entAvances = ppAvances.filter(a => a.entrepriseNom === entName);
                    const entAvTotal = entAvances.reduce((s, a) => s + a.montant, 0);
                    const entReste = Math.max(0, totalEntreprise - entAvTotal);
                    return (
                      <div key={entName} className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-black text-white text-sm flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-cyan-400" /> {entName}
                          </h4>
                          <span className="text-lg font-black text-emerald-400">{totalEntreprise.toFixed(2)}€</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {totalJours > 0 && (
                            <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <p className="text-amber-400 font-bold">📅 {totalJours} jour(s)</p>
                            </div>
                          )}
                          {totalHeures > 0 && (
                            <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <p className="text-blue-400 font-bold">⏰ {totalHeures}h</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 space-y-1">
                          {pts.map(p => (
                            <div key={p.id} className="flex justify-between text-xs text-white/70 px-2 py-1 rounded bg-white/5">
                              <span>{new Date(p.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                              <span>{p.typePaiement === 'journalier' ? `${p.prixJournalier}€/jour` : `${p.heures}h × ${p.prixHeure}€`}</span>
                              <span className="font-bold text-emerald-400">{p.montantTotal.toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>
                        {/* Avances pour cette entreprise */}
                        {entAvTotal > 0 && (
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center gap-1 text-xs text-amber-300 font-bold px-2">
                              <Banknote className="h-3 w-3" /> Avances reçues
                            </div>
                            {entAvances.map(a => (
                              <div key={a.id} className="flex justify-between text-xs text-white/60 px-2 py-1 rounded bg-amber-500/5">
                                <span>{new Date(a.date || a.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                <span className="font-bold text-amber-400">-{a.montant.toFixed(2)}€</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center px-2 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs mt-1">
                              <span className="text-cyan-300 font-bold">Reste</span>
                              <span className="text-cyan-400 font-black">{entReste.toFixed(2)}€</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Total pointage */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-center">
                    <p className="text-xs text-white/60 mb-1">TOTAL POINTAGE</p>
                    <p className="text-2xl font-black text-emerald-400">{ppGlobalTotal.toFixed(2)}€</p>
                  </div>

                  {/* Avances section */}
                  {ppAvances.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Banknote className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-black text-amber-300">Avances reçues</span>
                      </div>
                      <div className="space-y-1">
                        {ppAvances.map(a => (
                          <div key={a.id} className="flex justify-between text-xs text-white/70 px-2 py-1.5 rounded bg-white/5">
                            <span>{new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                            <span className="text-white/50">{a.entrepriseNom || 'Toutes'}</span>
                            <span className="font-bold text-amber-400">-{a.montant.toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between items-center px-2 pt-2 border-t border-white/10">
                        <span className="text-xs font-bold text-amber-300">Total avances</span>
                        <span className="text-lg font-black text-amber-400">-{ppTotalAvances.toFixed(2)}€</span>
                      </div>
                    </div>
                  )}

                  {/* Reste disponible */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-center">
                    <p className="text-xs text-white/60 mb-1">RESTE DISPONIBLE</p>
                    <p className={cn("text-2xl font-black", ppResteDisponible > 0 ? "text-cyan-400" : "text-red-400")}>
                      {ppResteDisponible.toFixed(2)}€
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParPersonneModal;
