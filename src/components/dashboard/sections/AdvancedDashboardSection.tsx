import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Diamond, Sparkles, Gem, Zap, TrendingUp } from 'lucide-react';
import AdvancedDashboard from '@/components/dashboard/AdvancedDashboard';

const AdvancedDashboardSection: React.FC = () => {
  return (
    <section 
      aria-labelledby="advanced-dashboard-title"
      className="space-y-6"
    >
      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-xl shadow-purple-500/30">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
          </div>
          <div>
            <h2 
              id="advanced-dashboard-title" 
              className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Tableau de Bord Avancé
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500" />
              Analyses détaillées et insights business
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full flex items-center gap-1">
            <Gem className="h-3 w-3" />
            Executive
          </span>
        </div>
      </motion.div>
      
      <AdvancedDashboard />
    </section>
  );
};

export default AdvancedDashboardSection;
