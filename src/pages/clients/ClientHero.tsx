/**
 * =============================================================================
 * ClientHero - Section héroïque de la page Clients
 * =============================================================================
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Crown, Star, Diamond, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClientHeroProps {
  clientCount: number;
  onAddClient: () => void;
}

const ClientHero: React.FC<ClientHeroProps> = ({ clientCount, onAddClient }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950">
      {/* Animated glass orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Shimmer top line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
      
      <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-10 sm:py-14 md:py-20">
        <div className="text-center">
          <div className="inline-flex flex-col xs:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              <Crown className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-2.5 h-2.5 text-white" />
              </div>
            </motion.div>
           
            <motion.h1
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 text-center drop-shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
            >
               Listes Clients <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent">Élite</span>
            </motion.h1>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Diamond className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-purple-300/60" />
              <div className="absolute inset-0 bg-purple-400/10 rounded-full blur-xl" />
            </motion.div>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl text-purple-200/60 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Gérez vos clients VIP avec une sophistication et une élégance incomparables
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <div className="bg-white/[0.06] backdrop-blur-2xl rounded-2xl px-6 sm:px-8 py-3 sm:py-4 border border-white/[0.1] shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 shrink-0 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
                <span className="text-white font-bold text-base sm:text-lg md:text-xl">
                  {clientCount} Client{clientCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={onAddClient} 
              className="group bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-400 hover:via-pink-400 hover:to-blue-400 text-white font-bold px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 rounded-2xl shadow-[0_20px_40px_rgba(139,92,246,0.3)] hover:shadow-[0_30px_60px_rgba(139,92,246,0.4)] transform hover:-translate-y-2 transition-all duration-500 border border-white/20 w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
              <span className="text-sm sm:text-base md:text-lg whitespace-nowrap">
                Nouveau Client<span className="hidden xs:inline"> Élite</span>
              </span>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:scale-125 transition-transform duration-300 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom shimmer */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
    </div>
  );
};

export default ClientHero;
