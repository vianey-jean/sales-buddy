import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Sparkles, Star, User, Zap, Timer, CheckCircle2 } from 'lucide-react';
import { Tache } from '@/services/api/tacheApi';

interface TacheTickerProps {
  taches: Tache[];
}

const TacheTicker: React.FC<TacheTickerProps> = ({ taches }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tickKey, setTickKey] = useState(0);
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting' | 'gap'>('gap');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTaches = taches.filter(t => t.date === todayStr && !t.completed);

  // Clear all timers
  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // Reset when taches change
  useEffect(() => {
    setCurrentIndex(0);
    setTickKey(k => k + 1);
  }, [todayTaches.length]);

  // Animation cycle
  useEffect(() => {
    if (todayTaches.length === 0) return;
    clearTimers();

    // Start entering
    setPhase('entering');

    // After 600ms enter → visible for 5s
    const t1 = setTimeout(() => setPhase('visible'), 600);

    // After 5.6s → exit
    const t2 = setTimeout(() => setPhase('exiting'), 5600);

    // After 6.2s → gap
    const t3 = setTimeout(() => setPhase('gap'), 6200);

    // After 8.2s → next tick
    const t4 = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % todayTaches.length);
      setTickKey(k => k + 1);
    }, 8200);

    timersRef.current = [t1, t2, t3, t4];
    return clearTimers;
  }, [tickKey, todayTaches.length]);

  if (todayTaches.length === 0) return null;

  const tache = todayTaches[currentIndex % todayTaches.length];
  if (!tache) return null;

  const isPertinent = tache.importance === 'pertinent';

  return (
    <div className="max-w-7xl mx-auto px-4 mb-2 overflow-hidden">
      <div
        className={`relative rounded-xl overflow-hidden h-7 sm:h-8 ${
          isPertinent
            ? 'bg-gradient-to-r from-red-600 via-red-500 to-rose-600 shadow-lg shadow-red-500/30'
            : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30'
        }`}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />

        {/* Sparkle dots */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-1 left-3 w-1 h-1 rounded-full ${isPertinent ? 'bg-red-200' : 'bg-emerald-200'} animate-pulse`} />
          <div className={`absolute bottom-1 right-6 w-1 h-1 rounded-full ${isPertinent ? 'bg-rose-200' : 'bg-teal-200'} animate-pulse`} style={{ animationDelay: '0.5s' }} />
          <div className={`absolute top-2 right-20 w-0.5 h-0.5 rounded-full ${isPertinent ? 'bg-red-100' : 'bg-emerald-100'} animate-pulse`} style={{ animationDelay: '1s' }} />
        </div>

        <AnimatePresence mode="wait">
          {(phase === 'entering' || phase === 'visible') && (
            <motion.div
              key={tickKey}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: '0%', opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 text-white"
            >
              {isPertinent ? (
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 animate-pulse" />
              ) : (
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 animate-pulse" />
              )}

              <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-bold whitespace-nowrap">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {tache.heureDebut}–{tache.heureFin}
              </span>

              <span className="w-px h-3 bg-white/40 flex-shrink-0" />

              <span className="text-[10px] sm:text-xs font-semibold truncate max-w-[120px] sm:max-w-[300px]">
                {tache.description}
              </span>

              {tache.travailleurNom && (
                <>
                  <span className="w-px h-3 bg-white/40 flex-shrink-0 hidden sm:block" />
                  <span className="hidden sm:flex items-center gap-0.5 text-[10px] font-medium opacity-90 whitespace-nowrap">
                    <User className="w-2.5 h-2.5" />
                    {tache.travailleurNom.split(' ')[0]}
                  </span>
                </>
              )}

              <span className="ml-auto flex-shrink-0 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                {isPertinent ? '⚡ URGENT' : '✓ OPT'}
              </span>

              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0 opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {todayTaches.length > 1 && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
            {todayTaches.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex % todayTaches.length ? 'bg-white scale-125' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TacheTicker;
