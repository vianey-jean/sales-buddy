/**
 * ClientsHero - Section Hero pour la page Clients (Version Ultra Luxe Responsive)
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Crown, Star, Diamond, Users, Plus, Sparkles, Gem, Zap } from 'lucide-react';

interface ClientsHeroProps {
  clientsCount: number;
  onAddClient: () => void;
}

const ClientsHero: React.FC<ClientsHeroProps> = ({ clientsCount, onAddClient }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-pink-700 to-indigo-700 dark:from-purple-900 dark:via-pink-900 dark:to-indigo-900 rounded-3xl shadow-[0_25px_50px_rgba(255,255,255,0.1)] border border-white/10">
      {/* Overlay sombre avec blur */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-md rounded-3xl" />

      {/* Particules flottantes ultra luxe */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400/50 rounded-full animate-pulse" />
        <div className="absolute top-20 right-16 w-4 h-4 sm:w-6 sm:h-6 bg-pink-400/50 rounded-full animate-bounce" />
        <div className="absolute bottom-16 left-20 w-3 h-3 sm:w-5 sm:h-5 bg-blue-400/50 rounded-full animate-pulse" />
        <div className="absolute top-32 left-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-green-400/50 rounded-full animate-bounce" />
        <Zap className="absolute animate-ping w-5 h-5 top-1/3 left-3/4 text-yellow-400/40" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center">
          {/* Titre avec icônes animées */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex flex-col sm:flex-row items-center gap-4 mb-6"
          >
            {/* Icône Couronne */}
            <div className="relative">
              <Crown className="w-12 h-12 md:w-16 md:h-16 text-yellow-300 animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin-slow" />
              </div>
            </div>

            {/* Titre */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-wide drop-shadow-lg"
            >
              Listes Clients{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent animate-pulse">
                Élite
              </span>
            </motion.h1>

            {/* Icône Diamant */}
            <div className="relative">
              <Diamond className="w-12 h-12 md:w-16 md:h-16 text-purple-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-2xl animate-pulse" />
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-md"
          >
            Gérez vos clients VIP avec une sophistication et une élégance incomparables
          </motion.p>

          {/* Stats et Bouton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
          >
            {/* Statistiques clients */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/20 shadow-[0_10px_25px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform duration-500">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-emerald-300 shrink-0 animate-pulse" />
                <span className="text-white font-extrabold text-lg md:text-xl drop-shadow-md">
                  {clientsCount} Client{clientsCount > 1 ? 's' : ''}
                </span>
                <Gem className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 animate-bounce" />
              </div>
            </div>

            {/* Bouton Nouveau Client */}
            <Button
              onClick={onAddClient}
              className="group bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-black font-extrabold px-6 py-4 rounded-2xl shadow-[0_10px_20px_rgba(255,165,0,0.5)] hover:shadow-yellow-500/50 transform hover:-translate-y-1 transition-all duration-500 border-2 border-yellow-300/50 w-full sm:w-auto flex items-center justify-center"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-sm sm:text-base md:text-lg whitespace-nowrap">
                Nouveau Client <span className="hidden xs:inline">Élite</span>
              </span>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:scale-125 transition-transform duration-500" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ClientsHero;
