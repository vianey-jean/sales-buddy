import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Clock, Building2, Plus, Timer, Sparkles, UserPlus, Users, BarChart3, Banknote, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PointageHeroProps {
  entreprisesCount: number;
  travailleursCount: number;
  pointagesCount: number;
  monthTotal: number;
  premiumBtnClass: string;
  mirrorShine: string;
  onAddEntreprise: () => void;
  onAddTravailleur: () => void;
  onNewPointage: () => void;
  onShowParPersonne: () => void;
  onShowYearlyTotal: () => void;
  onPriseAvance: () => void;
  onShowMonthDetail: () => void;
  onSharePointage?: () => void;
  year: number;
}

const PointageHero: React.FC<PointageHeroProps> = ({
  entreprisesCount, travailleursCount, pointagesCount, monthTotal,
  premiumBtnClass, mirrorShine,
  onAddEntreprise, onAddTravailleur, onNewPointage, onShowParPersonne, onShowYearlyTotal, onPriseAvance, onShowMonthDetail, onSharePointage, year
}) => {
  return (
    <div className="relative overflow-hidden py-8 sm:py-12">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-xl">
            <Clock className="h-5 w-5 text-cyan-500" />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Gestion du Pointage</span>
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
            ⏰ Pointage de Travail
          </h1>
          <p className="text-muted-foreground">Suivez vos heures et revenus par entreprise</p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
              <p className="text-xs text-muted-foreground">Entreprises</p>
              <p className="text-xl font-black text-cyan-500">{entreprisesCount}</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
              <p className="text-xs text-muted-foreground">Travailleurs</p>
              <p className="text-xl font-black text-purple-500">{travailleursCount}</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
              <p className="text-xs text-muted-foreground">Pointages ce mois</p>
              <p className="text-xl font-black text-blue-500">{pointagesCount}</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl cursor-pointer hover:scale-105 transition-transform hover:shadow-2xl hover:border-emerald-500/30"
              onClick={onShowMonthDetail}>
              <p className="text-xs text-muted-foreground">Total du mois</p>
              <p className="text-xl font-black text-emerald-500">{monthTotal.toFixed(2)}€</p>
              <p className="text-[10px] text-emerald-500/60 font-semibold">Cliquer pour détails</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl cursor-pointer hover:scale-105 transition-transform hover:shadow-2xl"
              onClick={onShowYearlyTotal}>
              <p className="text-xs text-muted-foreground">Total de l'année {year}</p>
              <p className="text-xl font-black text-amber-500">📊 Voir</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-700 via-blue-700 to-purple-800 rounded-2xl sm:rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.45)] p-5 sm:p-7 border border-white/25 mt-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-wrap justify-center gap-3 sm:gap-4">
              <Button onClick={onAddEntreprise}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 border-cyan-300/40 text-white shadow-[0_20px_70px_rgba(6,182,212,0.5)] hover:shadow-[0_35px_100px_rgba(6,182,212,0.7)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter Entreprise</span>
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onAddTravailleur}
                      className={cn(premiumBtnClass, "bg-gradient-to-br from-red-500 via-red-600 to-rose-700 border-red-300/40 text-white shadow-[0_20px_70px_rgba(239,68,68,0.5)] hover:shadow-[0_35px_100px_rgba(239,68,68,0.7)] !px-3 sm:!px-4")}>
                      <span className={mirrorShine} />
                      <span className="relative flex items-center"><UserPlus className="h-5 w-5 sm:h-6 sm:w-6" /></span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-red-600 text-white border-red-500 font-bold"><p>Ajouter un Travailleur</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button onClick={onNewPointage}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-emerald-300/40 text-white shadow-[0_20px_70px_rgba(16,185,129,0.6)] hover:shadow-[0_35px_100px_rgba(16,185,129,0.75)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><Timer className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Nouveau Pointage</span>
              </Button>

              <Button onClick={onPriseAvance}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 border-amber-300/40 text-white shadow-[0_20px_70px_rgba(245,158,11,0.5)] hover:shadow-[0_35px_100px_rgba(245,158,11,0.7)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><Banknote className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Prise Avance</span>
              </Button>

              <Button onClick={onShowParPersonne}
                className={cn(premiumBtnClass, "bg-gradient-to-br from-[#800020] via-[#900028] to-[#6b001a] border-[#c0506070] text-white shadow-[0_20px_70px_rgba(128,0,32,0.6)] hover:shadow-[0_35px_100px_rgba(128,0,32,0.75)]")}>
                <span className={mirrorShine} />
                <span className="relative flex items-center"><BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Afficher pointage Par Personne</span>
              </Button>

              {onSharePointage && (
                <Button onClick={onSharePointage}
                  className={cn(premiumBtnClass, "bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 border-teal-300/40 text-white shadow-[0_20px_70px_rgba(20,184,166,0.5)] hover:shadow-[0_35px_100px_rgba(20,184,166,0.7)]")}>
                  <span className={mirrorShine} />
                  <span className="relative flex items-center"><Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Partager pointage</span>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PointageHero;
