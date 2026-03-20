/**
 * =============================================================================
 * DashboardTabNavigation - Navigation par onglets du dashboard
 * =============================================================================
 * 
 * Composant réutilisable qui affiche les 6 onglets principaux du dashboard :
 * Ventes, Prêt Familles, Prêt Produits, Dépenses, Inventaire, Calcul Bénéfice
 * 
 * @module DashboardTabNavigation
 */

import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, Users, Package, CreditCard, 
  Archive, Calculator, Sparkles, Crown, 
  Gem, Zap, Diamond, Award 
} from 'lucide-react';

/** Configuration d'un onglet du dashboard */
interface TabConfig {
  value: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeIcon: React.ElementType;
  gradient: string;
  hoverGradient: string;
  shadowColor: string;
}

/** Liste des onglets configurés */
const TABS: TabConfig[] = [
  {
    value: 'ventes',
    label: 'Ventes Produits',
    shortLabel: 'Ventes',
    icon: ShoppingCart,
    badgeIcon: Sparkles,
    gradient: 'from-purple-600 via-pink-600 to-purple-700',
    hoverGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30',
    shadowColor: 'purple',
  },
  {
    value: 'pret-familles',
    label: 'Prêt Familles',
    shortLabel: 'Prêt',
    icon: Users,
    badgeIcon: Crown,
    gradient: 'from-blue-600 via-cyan-600 to-blue-700',
    hoverGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
    shadowColor: 'blue',
  },
  {
    value: 'pret-produits',
    label: 'Prêt Produits',
    shortLabel: 'Prêt',
    icon: Package,
    badgeIcon: Gem,
    gradient: 'from-indigo-600 via-violet-600 to-indigo-700',
    hoverGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30',
    shadowColor: 'indigo',
  },
  {
    value: 'depenses',
    label: 'Dépenses du Mois',
    shortLabel: 'Dépenses',
    icon: CreditCard,
    badgeIcon: Zap,
    gradient: 'from-rose-600 via-pink-600 to-rose-700',
    hoverGradient: 'from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30',
    shadowColor: 'rose',
  },
  {
    value: 'inventaire',
    label: 'Inventaire',
    shortLabel: 'Inventaire',
    icon: Archive,
    badgeIcon: Diamond,
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    hoverGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30',
    shadowColor: 'emerald',
  },
  {
    value: 'calcul-benefice',
    label: 'Calcul Bénéfice',
    shortLabel: 'Calcul',
    icon: Calculator,
    badgeIcon: Award,
    gradient: 'from-amber-600 via-yellow-600 to-amber-700',
    hoverGradient: 'from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30',
    shadowColor: 'amber',
  },
];

interface DashboardTabNavigationProps {
  /** Onglet actuellement actif */
  activeTab: string;
  /** Si l'utilisateur est sur mobile */
  isMobile: boolean;
}

const DashboardTabNavigation: React.FC<DashboardTabNavigationProps> = ({ activeTab, isMobile }) => {
  return (
    <TabsList className={cn(
      "relative grid w-full h-auto p-2 sm:p-3 bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-gray-900/60 dark:to-gray-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/40 dark:border-gray-700/40 shadow-inner",
      "grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3"
    )}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const BadgeIcon = tab.badgeIcon;
        const isActive = activeTab === tab.value;

        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "group relative font-bold text-[10px] xs:text-xs sm:text-sm uppercase flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 md:gap-3 py-3 sm:py-4 md:py-5 px-2 sm:px-4 md:px-6 rounded-xl sm:rounded-2xl transition-all duration-500",
              `data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.gradient} data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-${tab.shadowColor}-500/30 data-[state=active]:scale-105`,
              `hover:bg-gradient-to-r hover:${tab.hoverGradient}`,
              isActive 
                ? `text-white shadow-2xl shadow-${tab.shadowColor}-500/40` 
                : "text-gray-600 dark:text-gray-300"
            )}
          >
            {/* Icône avec badge */}
            <div className={cn(
              "relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg shrink-0",
              `bg-gradient-to-br from-${tab.shadowColor}-500/20 to-${tab.shadowColor}-500/20`,
              "group-data-[state=active]:bg-white/20"
            )}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <BadgeIcon className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {/* Label */}
            <span className="text-center leading-tight">
              {tab.shortLabel}
              <span className="hidden sm:inline">
                {tab.label !== tab.shortLabel ? ` ${tab.label.replace(tab.shortLabel, '').trim()}` : ''}
              </span>
            </span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
};

export default DashboardTabNavigation;
