/**
 * =============================================================================
 * TendancesTabNavigation - Navigation par onglets de la page Tendances
 * =============================================================================
 * 
 * Barre d'onglets premium avec 5 sections : Vue d'ensemble, Par Produits,
 * Par Catégories, Recommandations, Prévention Stock.
 * 
 * @module TendancesTabNavigation
 */

import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, ShoppingCart, Target, Sparkles, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TendancesTabNavigationProps {
  /** Onglet actuellement actif */
  activeTab: string;
  /** Indique si on est sur mobile */
  isMobile: boolean;
}

const TendancesTabNavigation: React.FC<TendancesTabNavigationProps> = ({ activeTab, isMobile }) => {
  const tabs = [
    { value: 'overview', label: "Vue d'ensemble", icon: TrendingUp, gradient: 'from-emerald-600 to-blue-600' },
    { value: 'products', label: 'Par Produits', icon: ShoppingCart, gradient: 'from-purple-600 to-pink-600' },
    { value: 'categories', label: 'Par Catégories', icon: Target, gradient: 'from-orange-600 to-red-600' },
    { value: 'clients', label: 'Par Clients', icon: Users, gradient: 'from-indigo-600 to-violet-600' },
    { value: 'recommendations', label: 'Recommandations', icon: Sparkles, gradient: 'from-yellow-600 to-orange-600' },
    { value: 'intelligence', label: 'Prévention Stock', icon: AlertTriangle, gradient: 'from-red-600 to-pink-600' },
  ];

  return (
    <div className={cn(
      "relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20",
      isMobile && "pt-8 pb-12"
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 rounded-3xl"></div>
      
      <TabsList className={cn(
        "relative grid w-full h-auto p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/20",
        isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-6 gap-2'
      )}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "font-bold text-xs uppercase flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300",
              activeTab === tab.value
                ? `text-white bg-gradient-to-r ${tab.gradient} shadow-lg scale-105`
                : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:scale-102"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default TendancesTabNavigation;
