import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedSalesData, useOptimizedProductData } from '@/services/dataOptimizationService';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';
import { ShoppingCart, Sparkles, Diamond } from 'lucide-react';
import PremiumLoading from '../ui/premium-loading';
import SalesOverviewSection from './sections/SalesOverviewSection';
import SalesManagementSection from './sections/SalesManagementSection';

/**
 * Composant principal pour la gestion des ventes et produits
 * Affiche uniquement la gestion des ventes (sans le tableau de bord avancé)
 */
const VentesProduits: React.FC = React.memo(() => {
  const { 
    sales, 
    products, 
    isLoading: appLoading,
    currentMonth,
    currentYear
  } = useApp();
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { announceToScreenReader } = useAccessibility();

  const optimizedSalesData = useOptimizedSalesData(sales);
  const optimizedProductData = useOptimizedProductData(products);

  if (!isAuthenticated) {
    return (
      <PremiumLoading
        text="Authentification requise"
        variant="ventes"
        size="lg"
      />
    );
  }

  if (appLoading || authLoading) {
    return (
      <PremiumLoading 
        text="Chargement des Ventes et Produits ...."
        size="md"
        variant="ventes"
        showText={true}
      />
    );
  }

  return (
    <div 
      className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 min-h-screen"
      role="main"
      aria-label="Gestion des ventes et produits"
    >
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-xl shadow-emerald-500/30">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Gestion des Ventes
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                Mois en cours: {currentMonth}/{currentYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
              Premium
            </span>
          </div>
        </div>
      </motion.header>

      {/* Sales content directly without tabs */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <SalesOverviewSection 
          sales={sales}
          productData={optimizedProductData}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
        
        <SalesManagementSection 
          sales={sales}
          products={products}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
});

VentesProduits.displayName = 'VentesProduits';

export default VentesProduits;
