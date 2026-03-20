/**
 * Hero pour les prêts produits
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

const PretHero: React.FC = () => {
  return (
    <div className="text-center mb-6 sm:mb-8 md:mb-12">
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-sm rounded-full text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-purple-200/50 dark:border-purple-800/50"
      >
        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-pulse" />
        Gestion Premium des Prêts
      </motion.div>
      
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-4 px-2">
        Prêts Produits
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
        Gérez vos prêts par personne avec élégance
      </p>
    </div>
  );
};

export default PretHero;
