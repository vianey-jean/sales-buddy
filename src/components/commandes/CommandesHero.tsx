import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Diamond, Star } from 'lucide-react';

const CommandesHero: React.FC = () => {
  return (
    <div className="relative text-center mb-6 sm:mb-8 md:mb-12 overflow-hidden py-10 sm:py-14 bg-gradient-to-br from-slate-900 via-purple-950/80 to-indigo-950">
      {/* Glass orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-1/4 w-72 h-72 bg-pink-500/15 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]"
        />
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
      
      {/* Badge premium */}
      <div className="relative z-10 inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-4
        bg-white/[0.06] backdrop-blur-2xl rounded-full
        text-purple-300
        text-xs sm:text-sm font-bold
        mb-5 sm:mb-6
        border border-white/[0.1]
        shadow-[0_10px_30px_rgba(139,92,246,0.2)]
      ">
        <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
        <span className="hidden xs:inline">Gestion Premium</span>
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400" />
      </div>
      
      {/* Hero Title */}
      <motion.h1
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black 
          text-white
          mb-4 sm:mb-6
          text-center px-2
          drop-shadow-[0_4px_20px_rgba(139,92,246,0.3)]
        "
      >
        <span className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <Diamond className="h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          <span>Commandes & Réservations</span>
          <Star className="h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
        </span>
      </motion.h1>
      
      {/* Subtitle */}
      <p className="relative z-10 text-sm sm:text-base md:text-lg lg:text-xl text-purple-200/50 max-w-3xl mx-auto px-4 font-medium">
        Une expérience de gestion <span className="font-bold text-purple-300">ultra-premium</span> pour vos commandes d'élite
      </p>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </div>
  );
};

export default CommandesHero;
