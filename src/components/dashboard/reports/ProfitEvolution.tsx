import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calculator, Target, Award, ArrowUpRight, BarChart3, Percent } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Sale } from '@/types';

type ModalType = 'profit' | 'expenses' | 'netProfit' | 'bestMonth' | null;

const ProfitEvolution: React.FC = () => {
  const { allSales } = useApp();
  const { formatCurrency } = useCurrencyFormatter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Fonction utilitaire pour calculer les valeurs d'une vente
  const getSaleValues = (sale: Sale) => {
    if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
      const revenue = sale.totalSellingPrice || sale.products.reduce((sum, p) => sum + (p.sellingPrice * p.quantitySold), 0);
      const quantity = sale.products.reduce((sum, p) => sum + p.quantitySold, 0);
      const profit = sale.totalProfit || sale.products.reduce((sum, p) => sum + p.profit, 0);
      return { revenue, quantity, profit };
    } else if (sale.sellingPrice !== undefined && sale.quantitySold !== undefined) {
      const revenue = sale.sellingPrice * sale.quantitySold;
      const quantity = sale.quantitySold;
      const profit = sale.profit || 0;
      return { revenue, quantity, profit };
    }
    return { revenue: 0, quantity: 0, profit: 0 };
  };

  // Année en cours
  const currentYear = new Date().getFullYear();

  const profitData = useMemo(() => {
    const monthlyData = new Map<string, {
      key: string;
      month: string;
      monthNum: number;
      revenue: number;
      profit: number;
      expenses: number;
      netProfit: number;
      margin: number;
      sales: number;
    }>();
    
    let totalProfit = 0;
    let totalExpenses = 0;
    let bestMonth = { month: '', monthNum: 0, profit: -Infinity };
    let worstMonth = { month: '', monthNum: 0, profit: Infinity };

    // Filtrer uniquement les ventes de l'année en cours
    const currentYearSales = allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getFullYear() === currentYear;
    });

    // Analyser les ventes et profits de l'année en cours uniquement
    currentYearSales.forEach(sale => {
      const date = new Date(sale.date);
      const month = date.getMonth() + 1;
      const monthKey = `${currentYear}-${String(month).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });

      // Calcul des valeurs de la vente
      const saleValues = getSaleValues(sale);
      
      // Calcul des dépenses réelles : coût d'achat des produits vendus
      let saleExpenses = 0;
      if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
        saleExpenses = sale.totalPurchasePrice || sale.products.reduce((sum, p) => sum + (p.purchasePrice * p.quantitySold), 0);
      } else if (sale.purchasePrice !== undefined && sale.quantitySold !== undefined) {
        saleExpenses = sale.purchasePrice * sale.quantitySold;
      }

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          key: monthKey,
          month: monthName,
          monthNum: month,
          revenue: 0,
          profit: 0,
          expenses: 0,
          netProfit: 0,
          margin: 0,
          sales: 0
        });
      }

      const data = monthlyData.get(monthKey)!;
      data.revenue += saleValues.revenue;
      data.profit += saleValues.profit;
      data.expenses += saleExpenses;
      data.sales += 1;
      
      totalProfit += saleValues.profit;
      totalExpenses += saleExpenses;
    });

    // Calculer profit net et marges pour chaque mois
    Array.from(monthlyData.values()).forEach(data => {
      data.netProfit = data.profit;
      data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;

      // Déterminer le meilleur et pire mois
      if (data.netProfit > bestMonth.profit) {
        bestMonth = { month: data.month, monthNum: data.monthNum, profit: data.netProfit };
      }
      if (data.netProfit < worstMonth.profit) {
        worstMonth = { month: data.month, monthNum: data.monthNum, profit: data.netProfit };
      }
    });

    // Trier par ordre chronologique
    const sortedData = Array.from(monthlyData.values()).sort((a, b) => a.key.localeCompare(b.key));

    // Si aucune donnée, réinitialiser bestMonth et worstMonth
    if (sortedData.length === 0) {
      bestMonth = { month: '-', monthNum: 0, profit: 0 };
      worstMonth = { month: '-', monthNum: 0, profit: 0 };
    } else if (worstMonth.profit === Infinity) {
      worstMonth = bestMonth;
    }

    // Calcul de la croissance mensuelle (mois actuel vs mois précédent)
    const currentMonthData = sortedData[sortedData.length - 1];
    const previousMonthData = sortedData[sortedData.length - 2];

    let growthRate = 0;
    if (currentMonthData && previousMonthData) {
      const previousProfit = previousMonthData.netProfit;
      if (previousProfit !== 0) {
        growthRate = ((currentMonthData.netProfit - previousProfit) / Math.abs(previousProfit)) * 100;
      } else if (currentMonthData.netProfit > 0) {
        growthRate = 100;
      }
    }

    // Marge moyenne annuelle
    const averageMargin = sortedData.length > 0
      ? sortedData.reduce((acc, data) => acc + data.margin, 0) / sortedData.length
      : 0;

    return {
      monthly: sortedData,
      totals: {
        profit: totalProfit,
        expenses: totalExpenses,
        netProfit: totalProfit
      },
      insights: {
        bestMonth,
        worstMonth,
        growthRate,
        averageMargin
      },
      year: currentYear
    };
  }, [allSales, currentYear]);

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (rate < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getGrowthIcon = (rate: number) => {
    return rate >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Modal Profit Brut */}
      <Dialog open={activeModal === 'profit'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Profit Brut Mensuel {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {profitData.monthly.map((data) => (
                <div 
                  key={data.monthNum}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-100 dark:border-emerald-800/50 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg">
                      {data.monthNum}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{data.month}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Marge: {data.margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {formatCurrency(data.profit)}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {data.sales} vente{data.sales > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Total Profit Brut</span>
                <p className="text-xs opacity-80">Marge moyenne: {profitData.insights.averageMargin.toFixed(1)}%</p>
              </div>
              <span className="text-2xl font-bold">{formatCurrency(profitData.totals.profit)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dépenses */}
      <Dialog open={activeModal === 'expenses'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-red-50/50 dark:from-gray-900 dark:to-red-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg">
                <Calculator className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Dépenses Mensuelles {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {profitData.monthly.map((data) => (
                <div 
                  key={data.monthNum}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-900/20 dark:to-orange-900/20 border border-red-100 dark:border-red-800/50 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-sm shadow-lg">
                      {data.monthNum}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{data.month}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {data.revenue > 0 ? ((data.expenses / data.revenue) * 100).toFixed(1) : 0}% du CA
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                      {formatCurrency(data.expenses)}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Coûts d'achat
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Dépenses</span>
              <span className="text-2xl font-bold">{formatCurrency(profitData.totals.expenses)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Profit Net */}
      <Dialog open={activeModal === 'netProfit'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Profit Net Mensuel {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {profitData.monthly.map((data, idx) => {
                const prevData = profitData.monthly[idx - 1];
                const change = prevData && prevData.netProfit !== 0 
                  ? ((data.netProfit - prevData.netProfit) / Math.abs(prevData.netProfit)) * 100 
                  : null;
                
                return (
                  <div 
                    key={data.monthNum}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg">
                        {data.monthNum}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">{data.month}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          CA: {formatCurrency(data.revenue)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {formatCurrency(data.netProfit)}
                        </p>
                      </div>
                      {change !== null && (
                        <Badge className={`${change >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Total Profit Net</span>
                <p className="text-xs opacity-80 flex items-center gap-1">
                  {React.createElement(getGrowthIcon(profitData.insights.growthRate), { className: 'h-3 w-3' })}
                  Croissance: {profitData.insights.growthRate.toFixed(1)}%
                </p>
              </div>
              <span className="text-2xl font-bold">{formatCurrency(profitData.totals.netProfit)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Meilleur Mois */}
      <Dialog open={activeModal === 'bestMonth'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Classement Mensuel {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {[...profitData.monthly].sort((a, b) => b.netProfit - a.netProfit).map((data, idx) => (
                <div 
                  key={data.monthNum}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.01] ${
                    idx === 0 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-400 dark:border-yellow-600' 
                      : idx === 1 
                        ? 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-300 dark:border-gray-600' 
                        : idx === 2 
                          ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-300 dark:border-orange-600' 
                          : 'bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      idx === 0 
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500' 
                        : idx === 1 
                          ? 'bg-gradient-to-r from-gray-400 to-slate-500' 
                          : idx === 2 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{data.month}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {data.sales} vente{data.sales > 1 ? 's' : ''} • Marge: {data.margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      idx === 0 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : idx === 1 
                          ? 'text-gray-600 dark:text-gray-300' 
                          : idx === 2 
                            ? 'text-orange-600 dark:text-orange-400' 
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
                    }`}>
                      {formatCurrency(data.netProfit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Titre avec année en cours */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">
          Évolution des Profits - {profitData.year}
        </h2>
        <Badge variant="outline" className="text-sm">
          Année {profitData.year}
        </Badge>
      </div>

      {/* KPI Cards - Premium et Cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveModal('profit')}
          className="cursor-pointer group"
        >
          <ModernCard
            title="Profit Brut"
            icon={DollarSign}
            className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/20 group-hover:scale-[1.02] group-hover:border-emerald-400/50 border-2 border-transparent"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatCurrency(profitData.totals.profit)}
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                +{profitData.insights.averageMargin.toFixed(1)}% marge
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        <div 
          onClick={() => setActiveModal('expenses')}
          className="cursor-pointer group"
        >
          <ModernCard
            title="Dépenses"
            icon={Calculator}
            className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-red-500/20 group-hover:scale-[1.02] group-hover:border-red-400/50 border-2 border-transparent"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatCurrency(profitData.totals.expenses)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Coûts opérationnels
            </p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        <div 
          onClick={() => setActiveModal('netProfit')}
          className="cursor-pointer group"
        >
          <ModernCard
            title="Profit Net"
            icon={Target}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/20 group-hover:scale-[1.02] group-hover:border-blue-400/50 border-2 border-transparent"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatCurrency(profitData.totals.netProfit)}
            </div>
            <div className="flex items-center mt-2">
              {React.createElement(getGrowthIcon(profitData.insights.growthRate), {
                className: `h-4 w-4 ${getGrowthColor(profitData.insights.growthRate)} mr-1`
              })}
              <span className={`text-xs font-medium ${getGrowthColor(profitData.insights.growthRate)}`}>
                {profitData.insights.growthRate.toFixed(1)}%
              </span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        <div 
          onClick={() => setActiveModal('bestMonth')}
          className="cursor-pointer group"
        >
          <ModernCard
            title="Meilleur Mois"
            icon={Award}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/20 group-hover:scale-[1.02] group-hover:border-purple-400/50 border-2 border-transparent"
          >
            <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform capitalize">
              {profitData.insights.bestMonth.month}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              {formatCurrency(profitData.insights.bestMonth.profit)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir classement</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard
          title="Évolution du Profit Net"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={profitData.monthly}>
                <defs>
                  <linearGradient id="profitGradientEvo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expenseGradientEvo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    name === 'profit' ? 'Profit Brut' : 
                    name === 'expenses' ? 'Dépenses' : 'Profit Net'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981"
                  fill="url(#profitGradientEvo)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444"
                  fill="url(#expenseGradientEvo)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 6 }}
                  activeDot={{ r: 8, fill: '#8B5CF6' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>

        <ModernCard
          title="Marge de Profit"
          icon={Calculator}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData.monthly}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Marge']}
                />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', r: 4 }}
                  activeDot={{ r: 6, fill: '#F59E0B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>

        <ModernCard
          title="Analyse des Tendances"
          icon={Target}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Croissance Mensuelle
                </span>
                <div className="flex items-center">
                  {React.createElement(getGrowthIcon(profitData.insights.growthRate), {
                    className: `h-4 w-4 ${getGrowthColor(profitData.insights.growthRate)} mr-1`
                  })}
                  <span className={`text-sm font-bold ${getGrowthColor(profitData.insights.growthRate)}`}>
                    {profitData.insights.growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Marge Moyenne
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {profitData.insights.averageMargin.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                  Performance
                </span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                  {profitData.insights.growthRate > 0 ? 'Croissante' : 'À surveiller'}
                </Badge>
              </div>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default ProfitEvolution;
