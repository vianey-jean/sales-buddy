import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CalendarDays, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tache } from '@/services/api/tacheApi';

interface TacheWeekModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  weekDates: { start: string; end: string };
  taches: Tache[];
  fetchWeekTaches: () => Promise<Tache[]>;
}

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const TacheWeekModal: React.FC<TacheWeekModalProps> = ({
  open, onOpenChange, weekDates, taches, fetchWeekTaches
}) => {
  const [weekTaches, setWeekTaches] = useState<Tache[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchWeekTaches()
        .then(data => setWeekTaches(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  const getWeekDays = () => {
    const days: string[] = [];
    const start = new Date(weekDates.start + 'T00:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-amber-900/20 to-orange-900/10 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="text-center space-y-2 pb-3">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
            <CalendarDays className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-lg font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            📅 Tâches de la semaine
          </DialogTitle>
          <p className="text-xs text-white/50">{weekDates.start} → {weekDates.end}</p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] space-y-3 pr-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            weekDays.map((dateStr, idx) => {
              const dayTaches = weekTaches.filter(t => t.date === dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div key={dateStr} className={cn(
                  'rounded-xl border p-3',
                  isToday ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/5 border-white/10'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={cn('text-sm font-bold', isToday ? 'text-violet-400' : 'text-white/70')}>
                      {JOURS_SEMAINE[idx]} {dateStr.split('-')[2]}/{dateStr.split('-')[1]}
                      {isToday && <span className="ml-2 text-[10px] bg-violet-500/20 px-2 py-0.5 rounded-full">Aujourd'hui</span>}
                    </h4>
                    <span className="text-[10px] text-white/40 font-bold">{dayTaches.length} tâche(s)</span>
                  </div>
                  {dayTaches.length === 0 ? (
                    <p className="text-xs text-white/30 italic">Aucune tâche</p>
                  ) : (
                    <div className="space-y-1.5">
                      {dayTaches.sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)).map(t => (
                        <div key={t.id} className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
                          t.importance === 'pertinent'
                            ? 'bg-red-500/10 border-red-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/20'
                        )}>
                          {t.importance === 'pertinent'
                            ? <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
                            : <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                          }
                          <span className="font-bold text-white/80">{t.heureDebut}-{t.heureFin}</span>
                          <span className="text-white/60 truncate flex-1">{t.description}</span>
                          {t.travailleurNom && <span className="text-white/40 shrink-0">{t.travailleurNom}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacheWeekModal;