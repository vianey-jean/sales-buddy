import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Award, AlertTriangle, BarChart3, Euro, ShoppingCart, ArrowUpRight, ArrowDownRight, Minus, CalendarDays, Eye, Package, Percent, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { useYearlyData, getSaleValues, YearlyStats } from '@/hooks/useYearlyData';

type ModalType = 'ca' | 'profit' | 'ventes' | 'bestYear' | 'worstYear' | 'yearDetail' | null;

interface MonthlyData {
  monthNum: number;
  monthName: string;
  value: number;
  prevYearValue: number | null;
  change: number | null;
}

const YearlyComparison: React.FC = () => {
  const { allSales } = useApp();
  const { formatCurrency } = useCurrencyFormatter();
  const {
    currentYear,
    allYearsStats,
    yearComparison,
    bestAndWorstYears
  } = useYearlyData(allSales);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Calculer les données mensuelles pour l'année en cours avec comparaison à l'année précédente
  const monthlyBreakdown = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    // Stats pour l'année en cours
    const currentYearStats: { [key: number]: { revenue: number; profit: number; salesCount: number } } = {};
    // Stats pour l'année précédente
    const prevYearStats: { [key: number]: { revenue: number; profit: number; salesCount: number } } = {};
    
    // Initialiser les mois écoulés
    for (let m = 1; m <= 12; m++) {
      currentYearStats[m] = { revenue: 0, profit: 0, salesCount: 0 };
      prevYearStats[m] = { revenue: 0, profit: 0, salesCount: 0 };
    }
    
    // Calculer les stats par mois pour les deux années
    allSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const year = saleDate.getFullYear();
      const month = saleDate.getMonth() + 1;
      const values = getSaleValues(sale);
      
      if (year === currentYear) {
        currentYearStats[month].revenue += values.revenue;
        currentYearStats[month].profit += values.profit;
        currentYearStats[month].salesCount += 1;
      } else if (year === currentYear - 1) {
        prevYearStats[month].revenue += values.revenue;
        prevYearStats[month].profit += values.profit;
        prevYearStats[month].salesCount += 1;
      }
    });
    
    // Convertir en tableau avec comparaisons année précédente
    const caData: MonthlyData[] = [];
    const profitData: MonthlyData[] = [];
    const ventesData: MonthlyData[] = [];
    
    for (let m = 1; m <= currentMonth; m++) {
      const currentStats = currentYearStats[m];
      const prevStats = prevYearStats[m];
      
      // Calcul du changement vs même mois année précédente
      const calcChange = (current: number, prev: number) => {
        if (prev === 0) return current > 0 ? 100 : 0;
        return ((current - prev) / prev) * 100;
      };
      
      caData.push({
        monthNum: m,
        monthName: monthNames[m - 1],
        value: currentStats.revenue,
        prevYearValue: prevStats.revenue,
        change: calcChange(currentStats.revenue, prevStats.revenue)
      });
      
      profitData.push({
        monthNum: m,
        monthName: monthNames[m - 1],
        value: currentStats.profit,
        prevYearValue: prevStats.profit,
        change: calcChange(currentStats.profit, prevStats.profit)
      });
      
      ventesData.push({
        monthNum: m,
        monthName: monthNames[m - 1],
        value: currentStats.salesCount,
        prevYearValue: prevStats.salesCount,
        change: calcChange(currentStats.salesCount, prevStats.salesCount)
      });
    }
    
    return { ca: caData, profit: profitData, ventes: ventesData };
  }, [allSales, currentYear]);

  // Calculer les données mensuelles pour une année spécifique
  const getYearMonthlyData = (year: number) => {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    const monthlyStats: { [key: number]: { revenue: number; profit: number; cost: number; salesCount: number; quantity: number } } = {};
    
    for (let m = 1; m <= 12; m++) {
      monthlyStats[m] = { revenue: 0, profit: 0, cost: 0, salesCount: 0, quantity: 0 };
    }
    
    allSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate.getFullYear() === year) {
        const month = saleDate.getMonth() + 1;
        const values = getSaleValues(sale);
        monthlyStats[month].revenue += values.revenue;
        monthlyStats[month].profit += values.profit;
        monthlyStats[month].cost += values.cost;
        monthlyStats[month].quantity += values.quantity;
        monthlyStats[month].salesCount += 1;
      }
    });
    
    // Filtrer les mois avec des données (ou jusqu'au mois actuel si année en cours)
    const isCurrentYearData = year === currentYear;
    const currentMonth = new Date().getMonth() + 1;
    
    return monthNames.map((name, index) => {
      const monthNum = index + 1;
      const stats = monthlyStats[monthNum];
      const hasData = stats.salesCount > 0;
      const shouldShow = isCurrentYearData ? monthNum <= currentMonth : hasData;
      
      return {
        monthNum,
        monthName: name,
        ...stats,
        hasData,
        shouldShow
      };
    }).filter(m => m.shouldShow || m.hasData);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const formatChange = (change: number) => {
    const Icon = getChangeIcon(change);
    return (
      <div className={`flex items-center gap-1 ${getChangeColor(change)}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    );
  };

  // Rendu d'une ligne mensuelle avec comparaison année précédente
  const renderMonthRow = (data: MonthlyData, formatValue: (v: number) => string, colorClass: string, bgClass: string) => (
    <div 
      key={data.monthNum}
      className={`flex items-center justify-between p-4 rounded-xl ${bgClass} border border-gray-100 dark:border-gray-700/50 transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} text-white font-bold text-sm`}>
          {data.monthNum}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{data.monthName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {data.monthName} {currentYear - 1}: {formatValue(data.prevYearValue || 0)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-lg font-bold ${colorClass.replace('bg-gradient-to-r', 'bg-clip-text text-transparent bg-gradient-to-r')}`}>
            {formatValue(data.value)}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          data.change !== null && data.change > 0 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : data.change !== null && data.change < 0 
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {data.change !== null && data.change > 0 ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : data.change !== null && data.change < 0 ? (
            <ArrowDownRight className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          {data.change !== null ? `${data.change >= 0 ? '+' : ''}${data.change.toFixed(1)}%` : '0%'}
        </div>
      </div>
    </div>
  );

  // Données pour le graphique de comparaison annuelle
  const chartData = allYearsStats.map(stat => ({
    year: stat.year.toString(),
    'Chiffre d\'Affaires': stat.totalRevenue,
    'Profit': stat.totalProfit,
    'Ventes': stat.salesCount
  }));

  // Obtenir les données de l'année sélectionnée
  const selectedYearStats = selectedYear ? allYearsStats.find(s => s.year === selectedYear) : null;
  const selectedYearMonthlyData = selectedYear ? getYearMonthlyData(selectedYear) : [];

  // Ouvrir la modale de détail pour une année
  const openYearDetailModal = (year: number) => {
    setSelectedYear(year);
    setActiveModal('yearDetail');
  };

  return (
    <div className="space-y-6">
      {/* Modal CA */}
      <Dialog open={activeModal === 'ca'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Euro className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Chiffre d'Affaires Mensuel {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyBreakdown.ca.map(data => 
                renderMonthRow(
                  data, 
                  (v) => formatCurrency(v),
                  'bg-gradient-to-r from-blue-500 to-indigo-600',
                  'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20'
                )
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Année</span>
              <span className="text-2xl font-bold">{formatCurrency(yearComparison.current.totalRevenue)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Profit */}
      <Dialog open={activeModal === 'profit'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Profit Mensuel {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyBreakdown.profit.map(data => 
                renderMonthRow(
                  data, 
                  (v) => formatCurrency(v),
                  'bg-gradient-to-r from-emerald-500 to-green-600',
                  'bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20'
                )
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Année</span>
              <span className="text-2xl font-bold">{formatCurrency(yearComparison.current.totalProfit)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ventes */}
      <Dialog open={activeModal === 'ventes'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ventes Mensuelles {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyBreakdown.ventes.map(data => 
                renderMonthRow(
                  data, 
                  (v) => `${v} vente${v > 1 ? 's' : ''}`,
                  'bg-gradient-to-r from-purple-500 to-pink-600',
                  'bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20'
                )
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Année</span>
              <span className="text-2xl font-bold">{yearComparison.current.salesCount} ventes</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Meilleure Année */}
      <Dialog open={activeModal === 'bestYear'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-yellow-50/50 dark:from-gray-900 dark:to-yellow-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                Détails - Meilleure Année {bestAndWorstYears.bestRevenue?.year}
              </span>
            </DialogTitle>
          </DialogHeader>
          {bestAndWorstYears.bestRevenue && (
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-4 py-2">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200/50 dark:border-yellow-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Euro className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-yellow-700 dark:text-yellow-400">CA Total</span>
                    </div>
                    <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
                      {formatCurrency(bestAndWorstYears.bestRevenue.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Profit</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                      {formatCurrency(bestAndWorstYears.bestRevenue.totalProfit)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-400">Ventes</span>
                    </div>
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                      {bestAndWorstYears.bestRevenue.salesCount}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-700 dark:text-purple-400">Marge</span>
                    </div>
                    <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
                      {((bestAndWorstYears.bestRevenue.totalProfit / bestAndWorstYears.bestRevenue.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Détails mensuels */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Répartition Mensuelle
                </h3>
                <div className="space-y-2">
                  {getYearMonthlyData(bestAndWorstYears.bestRevenue.year).map(month => (
                    <div 
                      key={month.monthNum}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-50/80 to-amber-50/80 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-100 dark:border-yellow-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                          {month.monthNum}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{month.monthName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="text-yellow-700 dark:text-yellow-400 font-semibold">{formatCurrency(month.revenue)}</p>
                          <p className="text-xs text-gray-500">{month.salesCount} ventes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(month.profit)}</p>
                          <p className="text-xs text-gray-500">profit</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Année à Améliorer */}
      <Dialog open={activeModal === 'worstYear'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Détails - Année à Améliorer {bestAndWorstYears.worstRevenue?.year}
              </span>
            </DialogTitle>
          </DialogHeader>
          {bestAndWorstYears.worstRevenue && (
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-4 py-2">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200/50 dark:border-orange-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Euro className="h-4 w-4 text-orange-600" />
                      <span className="text-xs text-orange-700 dark:text-orange-400">CA Total</span>
                    </div>
                    <p className="text-lg font-bold text-orange-800 dark:text-orange-300">
                      {formatCurrency(bestAndWorstYears.worstRevenue.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Profit</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                      {formatCurrency(bestAndWorstYears.worstRevenue.totalProfit)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-400">Ventes</span>
                    </div>
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                      {bestAndWorstYears.worstRevenue.salesCount}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-700 dark:text-purple-400">Marge</span>
                    </div>
                    <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
                      {bestAndWorstYears.worstRevenue.totalRevenue > 0 
                        ? ((bestAndWorstYears.worstRevenue.totalProfit / bestAndWorstYears.worstRevenue.totalRevenue) * 100).toFixed(1)
                        : '0.0'}%
                    </p>
                  </div>
                </div>

                {/* Détails mensuels */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Répartition Mensuelle
                </h3>
                <div className="space-y-2">
                  {getYearMonthlyData(bestAndWorstYears.worstRevenue.year).map(month => (
                    <div 
                      key={month.monthNum}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xs">
                          {month.monthNum}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{month.monthName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="text-orange-700 dark:text-orange-400 font-semibold">{formatCurrency(month.revenue)}</p>
                          <p className="text-xs text-gray-500">{month.salesCount} ventes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(month.profit)}</p>
                          <p className="text-xs text-gray-500">profit</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Détail Année (depuis le tableau) */}
      <Dialog open={activeModal === 'yearDetail'} onOpenChange={(open) => { if (!open) { setActiveModal(null); setSelectedYear(null); } }}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-900 dark:to-indigo-950/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Détails de l'Année {selectedYear}
              </span>
              {selectedYear === currentYear && (
                <Badge className="bg-indigo-500 text-white">En cours</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedYearStats && (
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="space-y-4 py-2">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Euro className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-400">CA Total</span>
                    </div>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                      {formatCurrency(selectedYearStats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Profit</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                      {formatCurrency(selectedYearStats.totalProfit)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200/50 dark:border-red-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-700 dark:text-red-400">Coûts</span>
                    </div>
                    <p className="text-xl font-bold text-red-800 dark:text-red-300">
                      {formatCurrency(selectedYearStats.totalCost)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-700 dark:text-purple-400">Ventes</span>
                    </div>
                    <p className="text-xl font-bold text-purple-800 dark:text-purple-300">
                      {selectedYearStats.salesCount}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-700 dark:text-amber-400">Quantité</span>
                    </div>
                    <p className="text-xl font-bold text-amber-800 dark:text-amber-300">
                      {selectedYearStats.quantitySold}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 border border-cyan-200/50 dark:border-cyan-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-cyan-600" />
                      <span className="text-xs text-cyan-700 dark:text-cyan-400">Marge</span>
                    </div>
                    <p className="text-xl font-bold text-cyan-800 dark:text-cyan-300">
                      {selectedYearStats.totalRevenue > 0 
                        ? ((selectedYearStats.totalProfit / selectedYearStats.totalRevenue) * 100).toFixed(1)
                        : '0.0'}%
                    </p>
                  </div>
                </div>

                {/* Détails mensuels */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Détails par Mois
                </h3>
                <div className="space-y-2">
                  {selectedYearMonthlyData.length > 0 ? (
                    selectedYearMonthlyData.map(month => (
                      <div 
                        key={month.monthNum}
                        className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 hover:scale-[1.01] transition-transform"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            {month.monthNum}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{month.monthName}</span>
                            <p className="text-xs text-gray-500">{month.salesCount} vente{month.salesCount > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="text-blue-700 dark:text-blue-400 font-semibold">{formatCurrency(month.revenue)}</p>
                            <p className="text-xs text-gray-500">CA</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(month.profit)}</p>
                            <p className="text-xs text-gray-500">profit</p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(month.cost)}</p>
                            <p className="text-xs text-gray-500">coûts</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Aucune donnée pour cette année</p>
                  )}
                </div>

                {/* Récapitulatif */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-indigo-200 text-xs">CA Total</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedYearStats.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Profit Total</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedYearStats.totalProfit)}</p>
                    </div>
                    <div>
                      <p className="text-indigo-200 text-xs">Marge Moyenne</p>
                      <p className="text-lg font-bold">
                        {selectedYearStats.totalRevenue > 0 
                          ? ((selectedYearStats.totalProfit / selectedYearStats.totalRevenue) * 100).toFixed(1)
                          : '0.0'}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* En-tête avec année en cours */}
      <div className="text-center p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Statistiques {currentYear}
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Données réinitialisées au 01/01/{currentYear} - Comparaison avec {currentYear - 1}
        </p>
      </div>

      {/* KPI Année en cours vs Année précédente - Cartes Interactives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Carte CA - Interactive */}
        <div 
          onClick={() => setActiveModal('ca')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`CA ${currentYear}`}
            icon={BarChart3}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/20 group-hover:scale-[1.02] group-hover:border-blue-400/50"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              {formatCurrency(yearComparison.current.totalRevenue)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                vs {currentYear - 1}: {formatCurrency(yearComparison.previous.totalRevenue)}
              </span>
              {formatChange(yearComparison.revenueChange)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        {/* Carte Profit - Interactive */}
        <div 
          onClick={() => setActiveModal('profit')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`Profit ${currentYear}`}
            icon={TrendingUp}
            className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-emerald-500/20 group-hover:scale-[1.02] group-hover:border-emerald-400/50"
          >
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              {formatCurrency(yearComparison.current.totalProfit)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                vs {currentYear - 1}: {formatCurrency(yearComparison.previous.totalProfit)}
              </span>
              {formatChange(yearComparison.profitChange)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        {/* Carte Ventes - Interactive */}
        <div 
          onClick={() => setActiveModal('ventes')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`Ventes ${currentYear}`}
            icon={BarChart3}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/20 group-hover:scale-[1.02] group-hover:border-purple-400/50"
          >
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              {yearComparison.current.salesCount}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                vs {currentYear - 1}: {yearComparison.previous.salesCount}
              </span>
              {formatChange(yearComparison.salesCountChange)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Graphique de comparaison annuelle */}
      {allYearsStats.length > 0 && (
        <ModernCard
          title="Évolution Annuelle"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    name === 'Ventes' ? value : formatCurrency(value as number),
                    name
                  ]}
                />
                <Legend />
                <Bar dataKey="Chiffre d'Affaires" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>
      )}

      {/* Meilleure et pire année - Cliquables */}
      {allYearsStats.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setActiveModal('bestYear')}
            className="cursor-pointer group"
          >
            <ModernCard
              title="Meilleure Année (CA)"
              icon={Award}
              className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-yellow-500/20 group-hover:scale-[1.02] group-hover:border-yellow-400/50"
            >
              {bestAndWorstYears.bestRevenue && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-500 text-white text-lg px-3 py-1">
                      {bestAndWorstYears.bestRevenue.year}
                    </Badge>
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400 group-hover:scale-105 transition-transform">
                    {formatCurrency(bestAndWorstYears.bestRevenue.totalRevenue)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {bestAndWorstYears.bestRevenue.salesCount} ventes • 
                    Profit: {formatCurrency(bestAndWorstYears.bestRevenue.totalProfit)}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-3 w-3" />
                    <span>Voir les détails mensuels</span>
                  </div>
                </div>
              )}
            </ModernCard>
          </div>

          <div 
            onClick={() => setActiveModal('worstYear')}
            className="cursor-pointer group"
          >
            <ModernCard
              title="Année à Améliorer (CA)"
              icon={AlertTriangle}
              className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-500/20 group-hover:scale-[1.02] group-hover:border-orange-400/50"
            >
              {bestAndWorstYears.worstRevenue && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-orange-500 text-white text-lg px-3 py-1">
                      {bestAndWorstYears.worstRevenue.year}
                    </Badge>
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-xl font-bold text-orange-700 dark:text-orange-400 group-hover:scale-105 transition-transform">
                    {formatCurrency(bestAndWorstYears.worstRevenue.totalRevenue)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {bestAndWorstYears.worstRevenue.salesCount} ventes • 
                    Profit: {formatCurrency(bestAndWorstYears.worstRevenue.totalProfit)}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-xs text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-3 w-3" />
                    <span>Voir les détails mensuels</span>
                  </div>
                </div>
              )}
            </ModernCard>
          </div>
        </div>
      )}

      {/* Tableau récapitulatif par année - Cliquable */}
      {allYearsStats.length > 0 && (
        <ModernCard
          title="Récapitulatif par Année"
          icon={Calendar}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold">Année</th>
                  <th className="text-right py-3 px-4 font-semibold">CA Total</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit</th>
                  <th className="text-right py-3 px-4 font-semibold">Coûts</th>
                  <th className="text-right py-3 px-4 font-semibold">Ventes</th>
                  <th className="text-right py-3 px-4 font-semibold">Marge</th>
                  <th className="text-center py-3 px-4 font-semibold">Détails</th>
                </tr>
              </thead>
              <tbody>
                {allYearsStats.map((stat, index) => {
                  const margin = stat.totalRevenue > 0 
                    ? ((stat.totalProfit / stat.totalRevenue) * 100).toFixed(1) 
                    : '0.0';
                  const isCurrentYear = stat.year === currentYear;
                  
                  return (
                    <tr 
                      key={stat.year}
                      onClick={() => openYearDetailModal(stat.year)}
                      className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 hover:scale-[1.01] ${
                        isCurrentYear ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stat.year}</span>
                          {isCurrentYear && (
                            <Badge className="bg-indigo-500 text-white text-xs">
                              En cours
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(stat.totalRevenue)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(stat.totalProfit)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600 dark:text-red-400">
                        {formatCurrency(stat.totalCost)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {stat.salesCount}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge className={
                          Number(margin) > 30 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                          Number(margin) > 15 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }>
                          {margin}%
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center">
                          <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transition-shadow">
                            <Eye className="h-4 w-4" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ModernCard>
      )}

      {/* Message si aucune donnée */}
      {allYearsStats.length === 0 && (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Les statistiques annuelles s'afficheront ici une fois que des ventes seront enregistrées.
          </p>
        </div>
      )}
    </div>
  );
};

export default YearlyComparison;
