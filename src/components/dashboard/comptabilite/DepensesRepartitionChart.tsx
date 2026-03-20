/**
 * DepensesRepartitionChart - Graphique camembert de répartition des dépenses
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { StablePieChart } from './StableCharts';
import { MONTHS } from '@/hooks/useComptabilite';

export interface DepensesRepartitionChartProps {
  data: { name: string; value: number }[];
  formatEuro: (value: number) => string;
  selectedMonth: number;
  selectedYear: number;
}

const DepensesRepartitionChart: React.FC<DepensesRepartitionChartProps> = ({
  data,
  formatEuro,
  selectedMonth,
  selectedYear
}) => {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/30"
        >
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          <CardTitle className="text-xl font-semibold tracking-wide bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent text-center">
            Répartition des Dépenses
            <span className="block text-sm text-green-600 font-bold mt-1 opacity-80">
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <StablePieChart data={data} formatEuro={formatEuro} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Aucune dépense enregistrée pour cette période</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepensesRepartitionChart;
