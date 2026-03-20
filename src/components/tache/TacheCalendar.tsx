import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tache } from '@/services/api/tacheApi';
import indisponibleApi, { Indisponibilite } from '@/services/api/indisponibleApi';

interface TacheCalendarProps {
  currentDate: Date;
  taches: Tache[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
  onDragTache: (tacheId: string, newDate: string) => void;
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const TacheCalendar: React.FC<TacheCalendarProps> = ({
  currentDate, taches, onPrevMonth, onNextMonth, onDayClick, onDragTache
}) => {
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    indisponibleApi.getAll().then(setIndisponibilites).catch(() => {});
  }, [year, month]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  const todayStr = new Date().toISOString().split('T')[0];

  const getTachesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return taches.filter(t => t.date === dateStr);
  };

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isDayFullyIndisponible = (dateStr: string) => {
    return indisponibilites.some(i => i.date === dateStr && i.journeeComplete);
  };

  const hasPartialIndispo = (dateStr: string) => {
    return indisponibilites.some(i => i.date === dateStr && !i.journeeComplete);
  };

  const handleDragOver = (e: React.DragEvent, day: number) => {
    const dateStr = getDateStr(day);
    if (isDayFullyIndisponible(dateStr)) return;
    e.preventDefault();
    setDragOverDate(dateStr);
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    const dateStr = getDateStr(day);
    if (isDayFullyIndisponible(dateStr)) return;
    const tacheId = e.dataTransfer.getData('tacheId');
    if (tacheId) {
      onDragTache(tacheId, dateStr);
    }
    setDragOverDate(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onPrevMonth}
          className="p-2 rounded-xl bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-lg">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
          {MOIS[month]} {year}
        </h2>
        <button onClick={onNextMonth}
          className="p-2 rounded-xl bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-lg">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {JOURS.map(j => (
          <div key={j} className="text-center text-xs sm:text-sm font-bold text-muted-foreground py-2">{j}</div>
        ))}
        {days.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;
          const dateStr = getDateStr(day);
          const dayTaches = getTachesForDay(day);
          const isToday = dateStr === todayStr;
          const hasPertinent = dayTaches.some(t => t.importance === 'pertinent');
          const hasOptionnel = dayTaches.some(t => t.importance === 'optionnel');
          const isDragOver = dragOverDate === dateStr;
          const isFullyIndispo = isDayFullyIndisponible(dateStr);
          const hasPartial = hasPartialIndispo(dateStr);

          return (
            <div
              key={day}
              onClick={() => {
                if (!isFullyIndispo) onDayClick(dateStr);
              }}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={(e) => handleDrop(e, day)}
              className={cn(
                'relative p-1 sm:p-2 rounded-xl sm:rounded-2xl transition-all duration-200 min-h-[48px] sm:min-h-[64px] flex flex-col items-center justify-start',
                isFullyIndispo
                  ? 'bg-red-500/15 border-2 border-red-500/30 cursor-not-allowed opacity-70'
                  : isToday
                    ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-500/40 shadow-lg shadow-violet-500/20 cursor-pointer hover:scale-105'
                    : 'bg-white/40 dark:bg-white/5 border border-white/10 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer hover:scale-105',
                hasPartial && !isFullyIndispo && 'ring-1 ring-red-400/40',
                isDragOver && !isFullyIndispo && 'ring-2 ring-violet-500 bg-violet-500/10'
              )}
            >
              <span className={cn(
                'text-xs sm:text-sm font-bold',
                isFullyIndispo ? 'text-red-500 dark:text-red-400' : isToday ? 'text-violet-600 dark:text-violet-400' : ''
              )}>
                {day}
              </span>
              {isFullyIndispo && (
                <Ban className="h-3 w-3 text-red-500 mt-0.5" />
              )}
              {hasPartial && !isFullyIndispo && (
                <span className="text-[7px] font-bold text-red-400 mt-0.5">partiel</span>
              )}
              {dayTaches.length > 0 && !isFullyIndispo && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {hasPertinent && (
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                  )}
                  {hasOptionnel && (
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  )}
                  <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground ml-0.5">{dayTaches.length}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 justify-center text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" /> Pertinent
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Optionnel
        </div>
        <div className="flex items-center gap-1.5">
          <Ban className="h-3 w-3 text-red-500" /> Indisponible
        </div>
      </div>
    </motion.div>
  );
};

export default TacheCalendar;