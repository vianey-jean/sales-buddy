/**
 * =============================================================================
 * RdvHero - Section héroïque de la page Rendez-vous
 * =============================================================================
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Crown, Sparkles, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RdvHeroProps {
  onNewRdv: () => void;
}

const RdvHero: React.FC<RdvHeroProps> = ({ onNewRdv }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/80 to-indigo-950 py-10 px-4 mb-8"
    >
      {/* Glass orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-[100px]"
        />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      
      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-3 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] border border-white/10"
              >
                <Crown className="h-8 w-8 text-white drop-shadow-lg" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_4px_20px_rgba(139,92,246,0.3)]">
                Gestion des Rendez-vous
              </h1>
              <Sparkles className="h-6 w-6 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
            </div>
            <p className="text-purple-200/60 mt-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Planifiez et gérez vos rendez-vous clients - <span className="text-amber-400 font-bold capitalize">{format(new Date(), 'MMMM yyyy', { locale: fr })}</span>
            </p>
          </div>
          <Button 
            onClick={onNewRdv} 
            size="lg" 
            className="bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500 hover:from-amber-400 hover:via-purple-400 hover:to-blue-400 text-white shadow-[0_20px_40px_rgba(139,92,246,0.3)] border border-white/10 font-semibold hover:scale-[1.02] transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau rendez-vous
          </Button>
        </div>
      </div>
      
      {/* Bottom shimmer */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </motion.div>
  );
};

export default RdvHero;
