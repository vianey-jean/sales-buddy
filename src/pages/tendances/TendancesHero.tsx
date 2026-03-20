/**
 * =============================================================================
 * TendancesHero - Section héroïque de la page Tendances
 * =============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, BarChart3 } from 'lucide-react';

const TendancesHero: React.FC = () => {
  return (
    <div className="relative text-center mb-12 py-8 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Badge premium */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center px-5 py-3 bg-white/[0.06] dark:bg-white/[0.04] backdrop-blur-2xl rounded-full text-emerald-600 dark:text-emerald-300 text-sm font-semibold mb-6 border border-emerald-400/20 dark:border-emerald-500/20 shadow-[0_8px_32px_rgba(16,185,129,0.15)]"
      >
        <TrendingUp className="h-5 w-5 mr-2 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        Analyse des tendances en temps réel
        <Sparkles className="h-4 w-4 ml-2 text-amber-400" />
      </motion.div>

      {/* Titre */}
      <motion.h1
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-5xl md:text-6xl font-extrabold 
                   bg-gradient-to-r from-emerald-600 via-teal-500 to-purple-600 dark:from-emerald-400 dark:via-teal-300 dark:to-purple-400
                   bg-clip-text text-transparent 
                   mb-6 text-center drop-shadow-xl"
      >
        Tendances & Analytics
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto 
                  bg-white/[0.04] dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl px-6 py-4 
                  border border-white/[0.08] dark:border-white/[0.05]
                  shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
      >
        <BarChart3 className="inline h-5 w-5 mr-2 text-emerald-500" />
        Découvrez vos performances, identifiez les opportunités et optimisez vos ventes
      </motion.p>
    </div>
  );
};

export default TendancesHero;
