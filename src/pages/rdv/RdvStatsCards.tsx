/**
 * =============================================================================
 * RdvStatsCards - Cartes statistiques de la page Rendez-vous
 * =============================================================================
 * 
 * 4 cartes cliquables : Aujourd'hui, Ce mois, En attente, Total du mois.
 * 
 * @module RdvStatsCards
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp, CalendarCheck, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface RdvStats {
  today: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  total: number;
}

interface RdvStatsCardsProps {
  stats: RdvStats;
  currentMonthCount: number;
  onOpenModal: (type: 'today' | 'month' | 'pending' | 'total') => void;
}

const RdvStatsCards: React.FC<RdvStatsCardsProps> = ({ stats, currentMonthCount, onOpenModal }) => {
  const cards = [
    { type: 'today' as const, label: "Aujourd'hui", value: stats.today, delay: 0.1, colors: 'from-blue-500/15 via-blue-400/10 to-blue-600/5 border-blue-300/50 dark:border-blue-700/50', textColor: 'text-blue-600/80 dark:text-blue-400', gradientText: 'from-blue-600 to-blue-800', iconBg: 'from-blue-500 to-blue-600', iconShadow: 'shadow-blue-500/30', icon: Clock },
    { type: 'month' as const, label: 'Ce mois', value: currentMonthCount, delay: 0.2, colors: 'from-emerald-500/15 via-emerald-400/10 to-emerald-600/5 border-emerald-300/50 dark:border-emerald-700/50', textColor: 'text-emerald-600/80 dark:text-emerald-400', gradientText: 'from-emerald-600 to-emerald-800', iconBg: 'from-emerald-500 to-emerald-600', iconShadow: 'shadow-emerald-500/30', icon: TrendingUp },
    { type: 'pending' as const, label: 'En attente', value: stats.pending, delay: 0.3, colors: 'from-amber-500/15 via-amber-400/10 to-orange-600/5 border-amber-300/50 dark:border-amber-700/50', textColor: 'text-amber-600/80 dark:text-amber-400', gradientText: 'from-amber-600 to-orange-600', iconBg: 'from-amber-500 to-orange-500', iconShadow: 'shadow-amber-500/30', icon: CalendarCheck },
    { type: 'total' as const, label: 'Total du mois', value: stats.total, delay: 0.4, colors: 'from-purple-500/15 via-purple-400/10 to-purple-600/5 border-purple-300/50 dark:border-purple-700/50', textColor: 'text-purple-600/80 dark:text-purple-400', gradientText: 'from-purple-600 to-purple-800', iconBg: 'from-purple-500 to-purple-600', iconShadow: 'shadow-purple-500/30', icon: Crown },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
      {cards.map((card) => (
        <motion.div
          key={card.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <Card
            className={`relative overflow-hidden bg-gradient-to-br ${card.colors} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
            onClick={() => onOpenModal(card.type)}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-current/20 to-transparent rounded-bl-full opacity-20"></div>
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textColor}`}>{card.label}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradientText} bg-clip-text text-transparent`}>{card.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${card.iconBg} rounded-xl shadow-lg ${card.iconShadow}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default RdvStatsCards;
