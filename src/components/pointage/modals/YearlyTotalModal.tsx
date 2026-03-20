import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart3, Building2, Users, User, Banknote, TrendingDown } from 'lucide-react';
import { PointageEntry } from '@/services/api/pointageApi';
import avanceApi, { Avance } from '@/services/api/avanceApi';

interface YearlyTotalModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  year: number;
  yearlyPointages: PointageEntry[];
  loading: boolean;
}

const YearlyTotalModal: React.FC<YearlyTotalModalProps> = ({
  open, onOpenChange, year, yearlyPointages, loading
}) => {
  const [avances, setAvances] = useState<Avance[]>([]);
  const [loadingAv, setLoadingAv] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoadingAv(true);
      try {
        const res = await avanceApi.getAll();
        setAvances(res.data.filter((a: Avance) => a.annee === year));
      } catch { setAvances([]); }
      finally { setLoadingAv(false); }
    };
    load();
  }, [open, year]);

  const yearlyByEntreprise = yearlyPointages.reduce((acc, p) => {
    const key = p.entrepriseNom || p.entrepriseId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, PointageEntry[]>);

  const yearlyByPerson = yearlyPointages.reduce((acc, p) => {
    const name = (p as any).travailleurNom || 'Sans nom';
    if (!acc[name]) acc[name] = [];
    acc[name].push(p);
    return acc;
  }, {} as Record<string, PointageEntry[]>);

  const yearlyGlobalTotal = yearlyPointages.reduce((s, p) => s + p.montantTotal, 0);
  const totalAvances = avances.reduce((s, a) => s + a.montant, 0);
  const reste = Math.max(0, yearlyGlobalTotal - totalAvances);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-amber-900/30 to-orange-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            📊 Total de l'année {year}
          </DialogTitle>
        </DialogHeader>

        {loading || loadingAv ? (
          <div className="text-center py-8"><p className="text-white/60 font-bold">⏳ Chargement...</p></div>
        ) : yearlyPointages.length === 0 ? (
          <div className="text-center py-8"><p className="text-white/50 font-bold">Aucun pointage en {year}</p></div>
        ) : (
          <div className="space-y-4">
            {/* Total annuel */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-center">
              <p className="text-xs text-white/60 mb-1">TOTAL ANNUEL {year}</p>
              <p className="text-3xl font-black text-emerald-400">{yearlyGlobalTotal.toFixed(2)}€</p>
              <p className="text-xs text-white/50 mt-1">{yearlyPointages.length} pointage(s)</p>
            </div>

            {/* Par Entreprise avec avances */}
            <div>
              <h4 className="text-sm font-black text-white/80 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-400" /> Par Entreprise
              </h4>
              {Object.entries(yearlyByEntreprise).map(([entName, pts]) => {
                const total = pts.reduce((s, p) => s + p.montantTotal, 0);
                const totalHeures = pts.reduce((s, p) => s + (p.heures || 0), 0);
                const totalJours = pts.filter(p => p.typePaiement === 'journalier').length;
                const entAvances = avances.filter(a => a.entrepriseNom === entName);
                const entAvTotal = entAvances.reduce((s, a) => s + a.montant, 0);
                const entReste = Math.max(0, total - entAvTotal);
                return (
                  <div key={entName} className="p-3 rounded-xl bg-white/10 border border-white/10 mb-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white">{entName}</p>
                        <p className="text-xs text-white/50">
                          {totalJours > 0 && `${totalJours} jour(s) `}
                          {totalHeures > 0 && `${totalHeures}h `}
                          — {pts.length} pointage(s)
                        </p>
                      </div>
                      <span className="text-lg font-black text-emerald-400">{total.toFixed(2)}€</span>
                    </div>
                    {entAvTotal > 0 && (
                      <>
                        <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                          <span className="text-amber-300 font-bold flex items-center gap-1"><Banknote className="h-3 w-3" /> Avances</span>
                          <span className="text-amber-400 font-black">-{entAvTotal.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs">
                          <span className="text-cyan-300 font-bold">Reste</span>
                          <span className="text-cyan-400 font-black">{entReste.toFixed(2)}€</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Par Personne avec avances */}
            <div>
              <h4 className="text-sm font-black text-white/80 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" /> Par Personne
              </h4>
              {Object.entries(yearlyByPerson).map(([name, pts]) => {
                const total = pts.reduce((s, p) => s + p.montantTotal, 0);
                const personAvances = avances.filter(a => a.travailleurNom === name);
                const personAvTotal = personAvances.reduce((s, a) => s + a.montant, 0);
                const personReste = Math.max(0, total - personAvTotal);
                return (
                  <div key={name} className="p-3 rounded-xl bg-white/10 border border-white/10 mb-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <User className="h-3 w-3 text-purple-400" /> {name}
                        </p>
                        <p className="text-xs text-white/50">{pts.length} pointage(s)</p>
                      </div>
                      <span className="text-lg font-black text-emerald-400">{total.toFixed(2)}€</span>
                    </div>
                    {personAvTotal > 0 && (
                      <>
                        <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                          <span className="text-amber-300 font-bold flex items-center gap-1"><Banknote className="h-3 w-3" /> Avances</span>
                          <span className="text-amber-400 font-black">-{personAvTotal.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs">
                          <span className="text-cyan-300 font-bold">Reste</span>
                          <span className="text-cyan-400 font-black">{personReste.toFixed(2)}€</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Avances totales */}
            {totalAvances > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-black text-amber-300">Total avances {year}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60 flex items-center gap-1"><TrendingDown className="h-3 w-3" /> {avances.length} avance(s)</span>
                  <span className="text-xl font-black text-amber-400">-{totalAvances.toFixed(2)}€</span>
                </div>
              </div>
            )}

            {/* Reste global */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-center">
              <p className="text-xs text-white/60 mb-1">RESTE DISPONIBLE {year}</p>
              <p className={`text-3xl font-black ${reste > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {reste.toFixed(2)}€
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YearlyTotalModal;
