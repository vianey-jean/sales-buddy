/**
 * =============================================================================
 * TendancesStatsCards - Cartes statistiques de la page Tendances
 * =============================================================================
 * 
 * Affiche les 4 cartes stats cliquables : Ventes Totales, Bénéfices,
 * Produits Vendus et Meilleur ROI.
 * 
 * @module TendancesStatsCards
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Package, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface TendancesStatsCardsProps {
  /** Revenus totaux */
  revenue: number;
  /** Bénéfice total */
  profit: number;
  /** Nombre total de transactions */
  salesCount: number;
  /** Quantité totale vendue */
  quantity: number;
  /** Nombre de produits uniques */
  uniqueProducts: number;
  /** Recommandations d'achat (pour le meilleur ROI) */
  buyingRecommendations: any[];
  /** Callback pour ouvrir une modale stats */
  onOpenModal: (type: 'ventes' | 'benefices' | 'produits' | 'roi') => void;
  /** Fonction de formatage monétaire */
  formatCurrency: (value: number) => string;
}

const TendancesStatsCards: React.FC<TendancesStatsCardsProps> = ({
  revenue,
  profit,
  salesCount,
  quantity,
  uniqueProducts,
  buyingRecommendations,
  onOpenModal,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Ventes Totales */}
      <motion.div whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} onClick={() => onOpenModal('ventes')} className="cursor-pointer">
        <Card className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white border-none shadow-2xl rounded-3xl relative overflow-hidden cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(147,51,234,0.7)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase">Ventes Totales</CardTitle>
            <DollarSign className="h-6 w-6 text-yellow-400 drop-shadow-xl animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold drop-shadow-md">
              {formatCurrency(revenue)}
            </div>
            <p className="text-xs md:text-sm text-purple-100/80 mt-1">
              +{salesCount} transactions historiques
            </p>
            <p className="text-xs text-purple-200/60 mt-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Cliquez pour détails</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bénéfices */}
      <motion.div whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} onClick={() => onOpenModal('benefices')} className="cursor-pointer">
        <Card className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white border-none shadow-2xl rounded-3xl relative overflow-hidden cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.7)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase">Bénéfices</CardTitle>
            <TrendingUp className="h-6 w-6 text-green-300 drop-shadow-xl animate-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold drop-shadow-md">
              {formatCurrency(profit)}
            </div>
            <p className="text-xs md:text-sm text-emerald-100/80 mt-1">
              Marge moyenne: {revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-emerald-200/60 mt-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Cliquez pour détails</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Produits Vendus */}
      <motion.div whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} onClick={() => onOpenModal('produits')} className="cursor-pointer">
        <Card className="bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 text-white border-none shadow-2xl rounded-3xl relative overflow-hidden cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(249,115,22,0.7)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase">Produits Vendus</CardTitle>
            <Package className="h-6 w-6 text-yellow-300 drop-shadow-xl animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold drop-shadow-md">
              {quantity}
            </div>
            <p className="text-xs md:text-sm text-orange-100/80 mt-1">
              {uniqueProducts} produits différents
            </p>
            <p className="text-xs text-orange-200/60 mt-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Cliquez pour détails</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Meilleur ROI */}
      <motion.div whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.98 }} onClick={() => onOpenModal('roi')} className="cursor-pointer">
        <Card className="bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 text-white border-none shadow-2xl rounded-3xl relative overflow-hidden cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.7)] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase">Meilleur ROI</CardTitle>
            <Award className="h-6 w-6 text-yellow-400 drop-shadow-xl animate-bounce" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold drop-shadow-md">
              {buyingRecommendations.length > 0 ? buyingRecommendations[0].roi : '0'}%
            </div>
            <p className="text-xs md:text-sm text-blue-100/80 mt-1">
              {buyingRecommendations.length > 0 ? buyingRecommendations[0].name.slice(0, 20) + '...' : 'Aucune donnée'}
            </p>
            <p className="text-xs text-blue-200/60 mt-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Cliquez pour détails</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TendancesStatsCards;
