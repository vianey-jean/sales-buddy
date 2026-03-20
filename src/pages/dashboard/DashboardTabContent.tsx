/**
 * =============================================================================
 * DashboardTabContent - Contenu des onglets du dashboard
 * =============================================================================
 * 
 * Composant qui gère l'affichage du contenu pour chaque onglet du dashboard.
 * Chaque onglet a un header visuel (icône + titre) et charge le composant associé.
 * 
 * @module DashboardTabContent
 */

import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import VentesProduits from '@/components/dashboard/VentesProduits';
import PretFamilles from '@/components/dashboard/PretFamilles';
import PretProduits from '@/components/dashboard/PretProduits';
import DepenseDuMois from '@/components/dashboard/DepenseDuMois';
import Inventaire from '@/components/dashboard/Inventaire';
import ProfitCalculator from '@/components/dashboard/ProfitCalculator';
import { 
  ShoppingCart, Users, Package, CreditCard, Archive, Calculator,
  Sparkles, Crown, Gem, Diamond, Award, TrendingUp, Star
} from 'lucide-react';

/** Configuration d'un contenu d'onglet */
interface TabContentConfig {
  value: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badgeIcon: React.ElementType;
  gradient: string;
  shadowColor: string;
  titleGradient: string;
  component: React.ReactNode;
}

/** Toutes les configurations de contenu */
const TAB_CONTENTS: TabContentConfig[] = [
  {
    value: 'ventes',
    title: 'Ventes & Produits',
    subtitle: 'Gérez vos ventes et votre inventaire premium',
    icon: ShoppingCart,
    badgeIcon: Sparkles,
    gradient: 'from-purple-600 via-pink-600 to-purple-700',
    shadowColor: 'purple',
    titleGradient: 'from-purple-600 to-pink-600',
    component: <VentesProduits />,
  },
  {
    value: 'pret-familles',
    title: 'Prêts aux Familles',
    subtitle: 'Suivi des prêts et remboursements familiaux',
    icon: Users,
    badgeIcon: Diamond,
    gradient: 'from-blue-600 via-cyan-600 to-blue-700',
    shadowColor: 'blue',
    titleGradient: 'from-blue-600 to-cyan-600',
    component: <PretFamilles />,
  },
  {
    value: 'pret-produits',
    title: 'Prêts de Produits',
    subtitle: 'Gestion premium des produits prêtés',
    icon: Package,
    badgeIcon: Award,
    gradient: 'from-indigo-600 via-violet-600 to-indigo-700',
    shadowColor: 'indigo',
    titleGradient: 'from-indigo-600 to-violet-600',
    component: <PretProduits />,
  },
  {
    value: 'depenses',
    title: 'Dépenses Mensuelles',
    subtitle: 'Suivi et contrôle intelligent de vos dépenses',
    icon: CreditCard,
    badgeIcon: TrendingUp,
    gradient: 'from-rose-600 via-pink-600 to-rose-700',
    shadowColor: 'rose',
    titleGradient: 'from-rose-600 to-pink-600',
    component: <DepenseDuMois />,
  },
  {
    value: 'inventaire',
    title: 'Inventaire des Produits',
    subtitle: 'Gestion complète et premium de votre stock',
    icon: Archive,
    badgeIcon: Diamond,
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    shadowColor: 'emerald',
    titleGradient: 'from-emerald-600 to-teal-600',
    component: <Inventaire />,
  },
];

/** Header visuel pour chaque onglet */
const TabHeader: React.FC<{ config: TabContentConfig }> = ({ config }) => {
  const Icon = config.icon;
  const BadgeIcon = config.badgeIcon;

  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div className={`relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${config.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-${config.shadowColor}-500/30`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        <BadgeIcon className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
      </div>
      <div className="min-w-0">
        <h2 className={`text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent truncate flex items-center gap-2`}>
          {config.title}
          <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">
          {config.subtitle}
        </p>
      </div>
    </div>
  );
};

const DashboardTabContent: React.FC = () => {
  return (
    <>
      {/* Onglets standards */}
      {TAB_CONTENTS.map((config) => (
        <TabsContent
          key={config.value}
          value={config.value}
          className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
        >
          <TabHeader config={config} />
          {config.component}
        </TabsContent>
      ))}

      {/* Onglet Calcul Bénéfice (mise en page spéciale) */}
      <TabsContent
        value="calcul-benefice"
        className="mt-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-[0_20px_40px_rgba(255,184,28,0.35)]">
            <Calculator className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-lg" />
            <Award className="absolute -top-1 -right-1 h-5 w-5 text-orange-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
              Calcul de Bénéfices
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 animate-spin-slow" />
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 truncate">
              Calculez vos marges et prix de vente optimaux
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
          <ProfitCalculator />
        </div>
      </TabsContent>
    </>
  );
};

export default DashboardTabContent;
