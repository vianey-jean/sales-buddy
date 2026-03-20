/**
 * ComptabiliteTabs - Onglets du module comptabilité (Version Luxe Responsive)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Clock, PieChart, TrendingUp, Crown, Diamond, Sparkles, Gem } from 'lucide-react';
import AchatsHistoriqueList from './AchatsHistoriqueList';
import DepensesRepartitionChart from './DepensesRepartitionChart';
import EvolutionMensuelleChart from './EvolutionMensuelleChart';
import { NouvelleAchat } from '@/types/comptabilite';
import { MONTHS } from '@/hooks/useComptabilite';

export interface BarChartData {
  name: string;
  beneficeVentes: number;
  depenses: number;
  beneficeReel: number;
}

export interface PieChartData {
  name: string;
  value: number;
}

export interface ComptabiliteTabsProps {
  achats: NouvelleAchat[];
  monthlyChartData: BarChartData[];
  depensesRepartition: PieChartData[];
  selectedMonth: number;
  selectedYear: number;
  formatEuro: (value: number) => string;
  onUpdateAchat?: (id: string, data: Partial<NouvelleAchat>) => Promise<void>;
  onDeleteAchat?: (id: string) => Promise<void>;
}

const ComptabiliteTabs: React.FC<ComptabiliteTabsProps> = ({
  achats,
  monthlyChartData,
  depensesRepartition,
  selectedMonth,
  selectedYear,
  formatEuro,
  onUpdateAchat,
  onDeleteAchat
}) => {
  return (
    <Tabs defaultValue="historique" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-emerald-900/50 via-teal-900/50 to-green-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1 sm:p-2 border-2 border-emerald-500/30 shadow-xl gap-1 sm:gap-2 h-auto">
        {/* Historique */}
        <TabsTrigger
          value="historique"
          className="group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl py-2 sm:py-3 px-2 sm:px-4 
                     data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 
                     data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30
                     text-emerald-200 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-emerald-500/20 group-data-[state=active]:bg-white/20">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold">
            <span className="hidden sm:inline">Historique</span>
            <span className="sm:hidden">Hist.</span>
          </span>
          <Crown className="h-3 w-3 text-yellow-400 hidden lg:block opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
        </TabsTrigger>

        {/* Répartition */}
        <TabsTrigger
          value="repartition"
          className="group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl py-2 sm:py-3 px-2 sm:px-4 
                     data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 
                     data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30
                     text-purple-200 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-purple-500/20 group-data-[state=active]:bg-white/20">
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold">
            <span className="hidden sm:inline">Répartition</span>
            <span className="sm:hidden">Rép.</span>
          </span>
          <Diamond className="h-3 w-3 text-pink-400 hidden lg:block opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
        </TabsTrigger>

        {/* Évolution */}
        <TabsTrigger
          value="evolution"
          className="group relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl py-2 sm:py-3 px-2 sm:px-4 
                     data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 
                     data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30
                     text-blue-200 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-blue-500/20 group-data-[state=active]:bg-white/20">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold">
            <span className="hidden sm:inline">Évolution</span>
            <span className="sm:hidden">Évol.</span>
          </span>
          <Sparkles className="h-3 w-3 text-blue-400 hidden lg:block opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
        </TabsTrigger>
      </TabsList>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TabsContent value="historique" className="mt-4 sm:mt-6">
          <AchatsHistoriqueList
            achats={achats}
            formatEuro={formatEuro}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            months={MONTHS}
            onUpdate={onUpdateAchat}
            onDelete={onDeleteAchat}
          />
        </TabsContent>

        <TabsContent value="repartition" className="mt-4 sm:mt-6">
          <DepensesRepartitionChart
            data={depensesRepartition}
            formatEuro={formatEuro}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>

        <TabsContent value="evolution" className="mt-4 sm:mt-6">
          <EvolutionMensuelleChart
            data={monthlyChartData}
            formatEuro={formatEuro}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>
      </motion.div>
    </Tabs>
  );
};

export default ComptabiliteTabs;
