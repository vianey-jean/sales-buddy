import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PointageEntry } from '@/services/api/pointageApi';

interface PointageCalendarProps {
  currentDate: Date;
  pointages: PointageEntry[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
}

const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const PointageCalendar: React.FC<PointageCalendarProps> = ({
  currentDate, pointages, onPrevMonth, onNextMonth, onDayClick
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const getPointagesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return pointages.filter(p => p.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onPrevMonth} className="rounded-2xl hover:bg-cyan-500/10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          {monthNames[month]} {year}
        </h2>
        <Button variant="ghost" onClick={onNextMonth} className="rounded-2xl hover:bg-cyan-500/10">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs sm:text-sm font-bold text-muted-foreground py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPointages = getPointagesForDay(day);
          const dayTotal = dayPointages.reduce((sum, p) => sum + p.montantTotal, 0);
          const hasData = dayPointages.length > 0;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const workerCount = new Set(dayPointages.map((p: any) => p.travailleurNom).filter(Boolean)).size;

          return (
            <motion.div key={day} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'aspect-square rounded-xl sm:rounded-2xl p-1 sm:p-2 cursor-pointer transition-all duration-300 border flex flex-col items-center justify-center relative overflow-hidden',
                isToday(day)
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                  : hasData
                    ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/20'
                    : 'bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
              )}
            >
              {hasData && (
                <span className="absolute top-0 right-0 sm:top-0.5 sm:right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] sm:text-[10px] font-black shadow-lg">
                  {dayPointages.length}
                </span>
              )}
              <span className={cn('text-xs sm:text-sm font-bold', isToday(day) ? 'text-cyan-600 dark:text-cyan-400' : '')}>
                {day}
              </span>
              {hasData && (
                <>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {dayTotal.toFixed(0)}€
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                    {workerCount > 0 && (
                      <span className="text-[8px] sm:text-[9px] font-bold text-emerald-500">{workerCount}</span>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PointageCalendar;
