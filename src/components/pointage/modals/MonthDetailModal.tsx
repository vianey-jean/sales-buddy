import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Banknote, TrendingDown, Wallet } from 'lucide-react';
import { PointageEntry } from '@/services/api/pointageApi';
import avanceApi, { Avance } from '@/services/api/avanceApi';

interface MonthDetailModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  monthTotal: number;
  pointages: PointageEntry[];
  year: number;
  month: number;
}

const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const MonthDetailModal: React.FC<MonthDetailModalProps> = ({
  open, onOpenChange, monthTotal, pointages, year, month
}) => {
  const [avances, setAvances] = useState<Avance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await avanceApi.getAll();
        const filtered = res.data.filter((a: Avance) => a.mois === month + 1 && a.annee === year);
        setAvances(filtered);
      } catch { setAvances([]); }
      finally { setLoading(false); }
    };
    load();
  }, [open, year, month]);

  const byEntreprise = pointages.reduce((acc, p) => {
    const key = p.entrepriseNom || p.entrepriseId;
    if (!acc[key]) acc[key] = { pointages: [] as PointageEntry[], total: 0 };
    acc[key].pointages.push(p);
    acc[key].total += p.montantTotal;
    return acc;
  }, {} as Record<string, { pointages: PointageEntry[]; total: number }>);

  const totalAvances = avances.reduce((s, a) => s + a.montant, 0);
  const reste = Math.max(0, monthTotal - totalAvances);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-emerald-900/20 to-teal-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            📊 Détail — {monthNames[month]} {year}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-6 text-white/50 animate-pulse font-bold">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {/* Par entreprise */}
            {Object.entries(byEntreprise).map(([name, data]) => {
              const entAvances = avances.filter(a => a.entrepriseNom === name);
              const entAvTotal = entAvances.reduce((s, a) => s + a.montant, 0);
              return (
                <div key={name} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-cyan-400" /> {name}
                    </h4>
                    <span className="text-lg font-black text-emerald-400">{data.total.toFixed(2)}€</span>
                  </div>
                  <div className="space-y-1">
                    {data.pointages.map(p => (
                      <div key={p.id} className="flex justify-between text-xs text-white/60 px-2 py-1 rounded bg-white/5">
                        <span>{new Date(p.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                        <span>{p.typePaiement === 'journalier' ? `${p.prixJournalier}€/jour` : `${p.heures}h × ${p.prixHeure}€`}</span>
                        <span className="font-bold text-emerald-400">{p.montantTotal.toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                  {entAvTotal > 0 && (
                    <div className="mt-2 px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex justify-between text-xs">
                      <span className="text-amber-300 font-bold">Avances</span>
                      <span className="text-amber-400 font-black">-{entAvTotal.toFixed(2)}€</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Total pointage */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-center">
              <p className="text-xs text-white/60 mb-1">TOTAL POINTAGE</p>
              <p className="text-3xl font-black text-emerald-400">{monthTotal.toFixed(2)}€</p>
            </div>

            {/* Avances */}
            {avances.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Banknote className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-black text-amber-300">Avances du mois</span>
                </div>
                <div className="space-y-1">
                  {avances.map(a => (
                    <div key={a.id} className="flex justify-between text-xs text-white/70 px-2 py-1.5 rounded bg-white/5">
                      <span>{new Date(a.date || a.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                      <span className="text-white/50">{a.travailleurNom}</span>
                      <span className="text-white/50">{a.entrepriseNom || 'Toutes'}</span>
                      <span className="font-bold text-amber-400">-{a.montant.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between items-center px-2 pt-2 border-t border-white/10">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Total avances</span>
                  <span className="text-lg font-black text-amber-400">-{totalAvances.toFixed(2)}€</span>
                </div>
              </div>
            )}

            {/* Reste */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-center">
              <p className="text-xs text-white/60 mb-1">RESTE DISPONIBLE</p>
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

export default MonthDetailModal;
