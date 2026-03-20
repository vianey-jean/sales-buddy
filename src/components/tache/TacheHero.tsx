import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { ListTodo, Plus, CalendarDays, Eye, Sparkles, UserPlus, Clock, CheckCircle, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tache } from '@/services/api/tacheApi';

interface TacheHeroProps {
  totalTaches: number;
  todayCount: number;
  pertinentCount: number;
  optionnelCount: number;
  premiumBtnClass: string;
  mirrorShine: string;
  onAddTache: () => void;
  onShowToday: () => void;
  onShowWeek: () => void;
  onAddTravailleur?: () => void;
  onShareTaches?: () => void;
  allTaches?: Tache[];
  onNavigateToDate?: (dateStr: string) => void;
}

const TacheHero: React.FC<TacheHeroProps> = ({
  totalTaches, todayCount, pertinentCount, optionnelCount,
  premiumBtnClass, mirrorShine,
  onAddTache, onShowToday, onShowWeek, onAddTravailleur, onShareTaches,
  allTaches = [], onNavigateToDate
}) => {
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [showTodayModal, setShowTodayModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const uncompletedTaches = allTaches.filter(t => !t.completed);
  const todayTaches = allTaches.filter(t => t.date === todayStr);

  const handleTacheClick = (tache: Tache) => {
    setShowTotalModal(false);
    setShowTodayModal(false);
    if (onNavigateToDate) {
      onNavigateToDate(tache.date);
    }
  };

  const renderTacheList = (taches: Tache[]) => {
    const sorted = [...taches].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.heureDebut.localeCompare(b.heureDebut);
    });
    return (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {sorted.length === 0 && <p className="text-sm text-white/50 text-center py-4">Aucune tâche</p>}
        {sorted.map(t => (
          <div
            key={t.id}
            onClick={() => handleTacheClick(t)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]',
              t.completed && 'opacity-50',
              t.importance === 'pertinent'
                ? 'bg-red-500/15 border-red-500/30'
                : 'bg-emerald-500/15 border-emerald-500/30'
            )}
          >
            <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', t.importance === 'pertinent' ? 'bg-red-500' : 'bg-emerald-500')} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-bold text-white truncate', t.completed && 'line-through text-white/50')}>
                {t.description}
              </p>
              <p className="text-[11px] text-white/50">
                📅 {t.date} • <Clock className="inline h-3 w-3" /> {t.heureDebut} - {t.heureFin}
                {t.travailleurNom && ` • ${t.travailleurNom}`}
              </p>
            </div>
            {t.completed && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="relative overflow-hidden py-8 sm:py-12">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 backdrop-blur-xl">
              <ListTodo className="h-5 w-5 text-violet-500" />
              <span className="text-sm font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Gestion des Tâches</span>
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">
              📋 Planificateur de Tâches
            </h1>
            <p className="text-muted-foreground">Organisez et suivez vos tâches quotidiennes</p>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <div
                onClick={() => totalTaches > 0 && setShowTotalModal(true)}
                className={cn(
                  "px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl transition-all",
                  totalTaches > 0 && "cursor-pointer hover:scale-105 hover:shadow-violet-500/20"
                )}
              >
                <p className="text-xs text-muted-foreground">Total tâches</p>
                <p className="text-xl font-black text-violet-500">{totalTaches}</p>
              </div>
              <div
                onClick={() => todayCount > 0 && setShowTodayModal(true)}
                className={cn(
                  "px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl transition-all",
                  todayCount > 0 && "cursor-pointer hover:scale-105 hover:shadow-blue-500/20"
                )}
              >
                <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                <p className="text-xl font-black text-blue-500">{todayCount}</p>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
                <p className="text-xs text-muted-foreground">🔴 Pertinentes</p>
                <p className="text-xl font-black text-red-500">{pertinentCount}</p>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
                <p className="text-xs text-muted-foreground">🟢 Optionnelles</p>
                <p className="text-xl font-black text-emerald-500">{optionnelCount}</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-800 rounded-2xl sm:rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.45)] p-5 sm:p-7 border border-white/25 mt-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative flex flex-wrap justify-center gap-3 sm:gap-4">
                <Button onClick={onAddTache}
                  className={cn(premiumBtnClass, "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center"><Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter une Tâche</span>
                </Button>
                <Button onClick={onShowToday}
                  className={cn(premiumBtnClass, "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border-blue-300/40 text-white shadow-[0_20px_70px_rgba(59,130,246,0.5)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center"><Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Tâches du jour</span>
                </Button>
                <Button onClick={onShowWeek}
                  className={cn(premiumBtnClass, "bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 border-amber-300/40 text-white shadow-[0_20px_70px_rgba(245,158,11,0.5)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center"><CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Tâches de la semaine</span>
                </Button>
                {onAddTravailleur && (
                  <Button onClick={onAddTravailleur}
                    className={cn(premiumBtnClass, "bg-gradient-to-br from-rose-500 via-pink-600 to-red-700 border-rose-300/40 text-white shadow-[0_20px_70px_rgba(244,63,94,0.5)]")}>
                    <span className={mirrorShine} />
                    <span className="relative flex items-center"><UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter Travailleur</span>
                  </Button>
                )}
                {onShareTaches && (
                  <Button onClick={onShareTaches}
                    className={cn(premiumBtnClass, "bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 border-teal-300/40 text-white shadow-[0_20px_70px_rgba(20,184,166,0.5)] hover:shadow-[0_35px_100px_rgba(20,184,166,0.7)]")}>
                    <span className={mirrorShine} />
                    <span className="relative flex items-center"><Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Partager tâches</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Total Tâches */}
      <Dialog open={showTotalModal} onOpenChange={setShowTotalModal}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg">
          <DialogHeader className="text-center space-y-2 pb-3">
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              📋 Toutes les tâches non terminées ({uncompletedTaches.length})
            </DialogTitle>
            <p className="text-xs text-white/50">Cliquez sur une tâche pour la voir dans le calendrier</p>
          </DialogHeader>
          {renderTacheList(uncompletedTaches)}
        </DialogContent>
      </Dialog>

      {/* Modal Aujourd'hui */}
      <Dialog open={showTodayModal} onOpenChange={setShowTodayModal}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg">
          <DialogHeader className="text-center space-y-2 pb-3">
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              📅 Tâches d'aujourd'hui ({todayTaches.length})
            </DialogTitle>
            <p className="text-xs text-white/50">Cliquez sur une tâche pour la voir dans le calendrier</p>
          </DialogHeader>
          {renderTacheList(todayTaches)}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TacheHero;
