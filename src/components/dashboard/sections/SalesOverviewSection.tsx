import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import { DollarSign, TrendingUp, Package, BarChart3, Warehouse, Crown, Diamond, Sparkles, Gem, Zap, X, Calendar, Target, ShoppingCart, Box, Layers } from 'lucide-react';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SalesOverviewSectionProps {
  sales: any[];
  productData: any;
  currentMonth: number;
  currentYear: number;
}

const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

const SalesOverviewSection: React.FC<SalesOverviewSectionProps> = ({
  sales,
  productData,
  currentMonth,
  currentYear
}) => {
  const { formatEuro } = useCurrencyFormatter();
  const navigate = useNavigate();
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  // Fonction pour vérifier si le produit est une avance
  const isAdvanceProduct = (description: string) => {
    return description.includes("Avance Perruque ou Tissages");
  };

  // Calculer les totaux comme dans SalesTable
  const totalSellingPrice = sales.reduce((sum, sale) => {
    return sum + (sale.totalSellingPrice || sale.sellingPrice || 0);
  }, 0);

  const totalQuantitySold = sales.reduce((sum, sale) => {
    if (sale.products) {
      return sum + sale.products.reduce((productSum: number, product: any) => {
        return productSum + (isAdvanceProduct(product.description) ? 0 : product.quantitySold);
      }, 0);
    }
    return sum + (isAdvanceProduct(sale.description) ? 0 : sale.quantitySold);
  }, 0);

  const totalProfit = sales.reduce((sum, sale) => {
    return sum + (sale.totalProfit || sale.profit || 0);
  }, 0);

  const stats = [
    {
      id: 'total-ventes',
      title: 'Total ventes du mois',
      value: formatEuro(totalSellingPrice || 0),
      rawValue: totalSellingPrice || 0,
      icon: DollarSign,
      luxeIcon: Crown,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      description: 'Chiffre d\'affaires total',
      modalColor: 'emerald'
    },
    {
      id: 'benefices',
      title: 'Bénéfices du mois',
      value: formatEuro(totalProfit || 0),
      rawValue: totalProfit || 0,
      icon: TrendingUp,
      luxeIcon: Diamond,
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      description: 'Profit net réalisé',
      modalColor: 'purple'
    },
    {
      id: 'produits-vendus',
      title: 'Produits vendus',
      value: (totalQuantitySold || 0).toString(),
      rawValue: totalQuantitySold || 0,
      icon: Package,
      luxeIcon: Sparkles,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      bgGradient: 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20',
      description: 'Unités vendues ce mois',
      modalColor: 'blue'
    },
    {
      id: 'produits-disponibles',
      title: 'Produits disponibles',
      value: productData.availableProducts.length.toString(),
      rawValue: productData.availableProducts.length,
      icon: BarChart3,
      luxeIcon: Gem,
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      description: 'Produits en stock',
      modalColor: 'pink'
    },
    {
      id: 'stock-total',
      title: 'Stock total',
      value: productData.totalItems.toString(),
      rawValue: productData.totalItems,
      icon: Warehouse,
      luxeIcon: Zap,
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      bgGradient: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
      description: 'Total des unités en stock',
      modalColor: 'amber'
    }
  ];

  const getStatDetails = (statId: string): (typeof stats[0] & { details: Array<{ label: string; value: string | number; icon: any }> }) | null => {
    const stat = stats.find(s => s.id === statId);
    if (!stat) return null;

    switch (statId) {
      case 'total-ventes':
        return {
          ...stat,
          details: [
            { label: 'Nombre de ventes', value: sales.length, icon: ShoppingCart },
            { label: 'Vente moyenne', value: formatEuro(sales.length > 0 ? totalSellingPrice / sales.length : 0), icon: Target },
            { label: 'Mois en cours', value: `${monthNames[currentMonth - 1]} ${currentYear}`, icon: Calendar },
          ]
        };
      case 'benefices':
        const margin = totalSellingPrice > 0 ? ((totalProfit / totalSellingPrice) * 100).toFixed(1) : '0';
        return {
          ...stat,
          details: [
            { label: 'Marge bénéficiaire', value: `${margin}%`, icon: TrendingUp },
            { label: 'Bénéfice moyen/vente', value: formatEuro(sales.length > 0 ? totalProfit / sales.length : 0), icon: Target },
            { label: 'Total CA', value: formatEuro(totalSellingPrice), icon: DollarSign },
          ]
        };
      case 'produits-vendus':
        return {
          ...stat,
          details: [
            { label: 'Unités totales vendues', value: totalQuantitySold.toString(), icon: Package },
            { label: 'Moyenne par vente', value: (sales.length > 0 ? (totalQuantitySold / sales.length).toFixed(1) : '0'), icon: Target },
            { label: 'Période', value: `${monthNames[currentMonth - 1]} ${currentYear}`, icon: Calendar },
          ]
        };
      case 'produits-disponibles':
        return {
          ...stat,
          details: [
            { label: 'Références en stock', value: productData.availableProducts.length.toString(), icon: Box },
            { label: 'Stock total unités', value: productData.totalItems.toString(), icon: Layers },
            { label: 'Inventaire actif', value: 'Mis à jour', icon: Sparkles },
          ]
        };
      case 'stock-total':
        return {
          ...stat,
          details: [
            { label: 'Unités en stock', value: productData.totalItems.toString(), icon: Warehouse },
            { label: 'Références', value: productData.availableProducts.length.toString(), icon: Package },
            { label: 'Valeur estimée', value: 'Disponible', icon: DollarSign },
          ]
        };
      default:
        return {
          ...stat,
          details: []
        };
    }
  };

  const selectedStatDetails = selectedStat ? getStatDetails(selectedStat) : null;

  const getModalGradient = (color: string) => {
    const gradients: Record<string, string> = {
      emerald: 'from-emerald-500 to-teal-600',
      purple: 'from-purple-500 to-indigo-600',
      blue: 'from-blue-500 to-cyan-600',
      pink: 'from-pink-500 to-rose-600',
      amber: 'from-amber-500 to-orange-600'
    };
    return gradients[color] || gradients.emerald;
  };

  return (
    <section aria-labelledby="sales-overview-title" className="space-y-6">
      {/* Header Premium */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/30">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
          </div>
          <div>
            <h2
              id="sales-overview-title"
              className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Aperçu des Ventes
            </h2>
            <p className="text-sm sm:text-base text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              {monthNames[currentMonth - 1]} {currentYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
            Premium Dashboard
          </span>
        </div>
      </motion.div> */}

      {/* Stats Cards Grid Responsive - CLIQUABLES */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => setSelectedStat(stat.id)}
          >
            <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.bgGradient} p-4 sm:p-5 md:p-6 border-2 border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 active:scale-95`}>
              {/* Indicateur cliquable */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-6 h-6 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                  </div>
                  <stat.luxeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 opacity-50 group-hover:opacity-100 group-hover:text-purple-500 transition-all animate-pulse" />
                </div>

                <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 mb-1 truncate">
                  {stat.title}
                </p>
                <p
                  className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  aria-label={`${stat.title}: ${stat.value}`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:mt-2 hidden sm:block">
                  {stat.description}
                </p>
              </div>

              {/* Hover effect pour indiquer qu'on peut cliquer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de détails */}
      <AnimatePresence>
        {selectedStat && selectedStatDetails && (
          <Dialog open={!!selectedStat} onOpenChange={() => setSelectedStat(null)}>
            <DialogContent className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 shadow-2xl rounded-3xl max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header avec gradient */}
                <div className={`-mx-6 -mt-6 mb-6 p-6 bg-gradient-to-r ${getModalGradient(selectedStatDetails.modalColor)} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-xl">
                      <selectedStatDetails.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-white mb-1">{selectedStatDetails.title}</h3>
                      <p className="text-white/80 text-sm">{selectedStatDetails.description}</p>
                    </div>
                  </div>
                </div>

                {/* Valeur principale */}
                <div className="text-center mb-6">
                  <div className={`text-4xl font-black bg-gradient-to-r ${selectedStatDetails.gradient} bg-clip-text text-transparent`}>
                    {selectedStatDetails.value}
                  </div>
                  <Badge className="mt-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 border-0 font-semibold">
                    <Calendar className="h-3 w-3 mr-1" />
                    {monthNames[currentMonth - 1]} {currentYear}
                  </Badge>
                </div>

                {/* Détails */}
                <div className="space-y-3">
                  {selectedStatDetails.details?.map((detail, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => {
                        if ((selectedStat === 'produits-disponibles' || selectedStat === 'stock-total') && 
                            (detail.label === 'Références en stock' || detail.label === 'Stock total unités' || detail.label === 'Inventaire actif' || detail.label === 'Unités en stock' || detail.label === 'Références')) {
                          setSelectedStat(null);
                          navigate('/produits');
                        }
                      }}
                      className={`flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                        (selectedStat === 'produits-disponibles' || selectedStat === 'stock-total') && 
                        (detail.label === 'Références en stock' || detail.label === 'Stock total unités' || detail.label === 'Inventaire actif' || detail.label === 'Unités en stock' || detail.label === 'Références')
                          ? 'cursor-pointer hover:ring-2 hover:ring-purple-400 dark:hover:ring-purple-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedStatDetails.gradient} shadow-md`}>
                          <detail.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{detail.label}</span>
                      </div>
                      <span className={`text-lg font-black bg-gradient-to-r ${selectedStatDetails.gradient} bg-clip-text text-transparent`}>
                        {detail.value}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Décoration bas */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Statistiques Premium</span>
                  <Diamond className="h-4 w-4 text-purple-400" />
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SalesOverviewSection;
