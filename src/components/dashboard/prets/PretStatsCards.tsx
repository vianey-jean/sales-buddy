/**
 * Cartes de statistiques pour les prêts produits
 */
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, Clock, CheckCircle } from 'lucide-react';

interface PretStatsCardsProps {
  totalVentes: number;
  totalAvances: number;
  totalReste: number;
  pretsPayes: number;
  totalPrets: number;
  formatCurrency: (amount: number) => string;
}

const PretStatsCards: React.FC<PretStatsCardsProps> = ({
  totalVentes,
  totalAvances,
  totalReste,
  pretsPayes,
  totalPrets,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-emerald-100 text-xs sm:text-sm truncate">Total Ventes</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{formatCurrency(totalVentes)}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-blue-100 text-xs sm:text-sm truncate">Avances</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{formatCurrency(totalAvances)}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-orange-100 text-xs sm:text-sm truncate">Reste</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{formatCurrency(totalReste)}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-right min-w-0 flex-1">
                <p className="text-purple-100 text-xs sm:text-sm truncate">Payés</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{pretsPayes}/{totalPrets}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PretStatsCards;
