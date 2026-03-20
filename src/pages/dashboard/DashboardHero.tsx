/**
 * =============================================================================
 * DashboardHero - Section héroïque du tableau de bord
 * =============================================================================
 * 
 * Affiche le titre animé et la description du dashboard premium.
 * Composant purement visuel sans logique métier.
 * 
 * @module DashboardHero
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Diamond, Gem, Star, Award } from 'lucide-react';

const DashboardHero: React.FC = () => {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-12">
      {/* Badge premium animé */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 backdrop-blur-xl rounded-full text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-purple-300/30 dark:border-purple-700/30 shadow-xl shadow-purple-500/10"
      >
        <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-500 animate-pulse" />
        <span className="hidden xs:inline">Tableau de bord Premium en temps réel</span>
        <span className="xs:hidden">Dashboard Premium</span>
        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2 text-pink-500" />
      </motion.div>
      
      {/* Titre principal animé */}
      <motion.h1
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold 
                  bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
                  bg-[length:200%_200%] animate-gradient 
                  bg-clip-text text-transparent mb-4 sm:mb-6 text-center text-3d px-2"
      >
        <Diamond className="inline h-8 w-8 sm:h-10 sm:w-10 mr-2 text-purple-500" />
        Tableau de Bord
        <Gem className="inline h-8 w-8 sm:h-10 sm:w-10 ml-2 text-pink-500" />
      </motion.h1>
      
      {/* Description */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 flex items-center justify-center gap-2"
      >
        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
        Gérez efficacement vos ventes, inventaires et finances en un seul endroit
        <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
      </motion.p>
    </div>
  );
};

export default DashboardHero;
