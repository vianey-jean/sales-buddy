import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Calculator, FileText, Eye, EyeOff, DollarSign, ShoppingCart, Target, ArrowUpRight, Receipt, Percent, BarChart3, ShoppingBag, Gem, Crown, Sparkles, Zap, Trophy, Star, ChartPie, Wallet, PiggyBank, TrendingUp as TrendUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Button } from '@/components/ui/button';
import { Sale } from '@/types';

interface PeriodData {
  revenue: number;
  cost: number;
  profit: number;
  salesCount: number;
  totalProductsSold: number;
  avgOrderValue: number;
}

type ModalType = 'revenue' | 'cost' | 'profit' | 'avgOrder' | 'margin' | 'salesCount' | 'profitPerSale' | null;

const ProfitLossStatement: React.FC = () => {
  const { allSales } = useApp();
  const { formatEuro } = useCurrencyFormatter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  const [showDetails, setShowDetails] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Fonction utilitaire pour calculer les valeurs d'une vente
  const getSaleValues = (sale: Sale) => {
    // Nouveau format multi-produits
    if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
      // Pour les ventes multi-produits, utiliser les totaux pré-calculés ou calculer
      const revenue = sale.totalSellingPrice || sale.products.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
      const cost = sale.totalPurchasePrice || sale.products.reduce((sum, p) => sum + ((p.purchasePrice || 0)), 0);
      const profit = sale.totalProfit || sale.products.reduce((sum, p) => sum + (p.profit || 0), 0);
      const totalProductsSold = sale.products.reduce((sum, p) => sum + (p.quantitySold || 0), 0);

      return { revenue, cost, profit, totalProductsSold };
    }
    // Ancien format single-produit
    else if (sale.sellingPrice !== undefined && sale.quantitySold !== undefined && sale.purchasePrice !== undefined) {
      const revenue = (sale.sellingPrice || 0);
      const cost = (sale.purchasePrice || 0);
      const profit = sale.profit || (revenue - cost);
      const totalProductsSold = sale.quantitySold || 0;

      return { revenue, cost, profit, totalProductsSold };
    }
    // Fallback
    return { revenue: 0, cost: 0, profit: 0, totalProductsSold: 0 };
  };

  const calculatePeriodData = (period: string): PeriodData => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodSales = allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalProductsSold = 0;

    periodSales.forEach(sale => {
      const saleValues = getSaleValues(sale);
      totalRevenue += saleValues.revenue;
      totalCost += saleValues.cost;
      totalProfit += saleValues.profit;
      totalProductsSold += saleValues.totalProductsSold;
    });

    const salesCount = periodSales.length;
    const avgOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0;

    return {
      revenue: totalRevenue,
      cost: totalCost,
      profit: totalProfit,
      salesCount,
      totalProductsSold,
      avgOrderValue
    };
  };

  // Obtenir les ventes de la période pour les modales
  const getPeriodSales = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const currentData = calculatePeriodData(selectedPeriod);
  const previousPeriodData = selectedPeriod === 'current-month'
    ? calculatePeriodData('last-month')
    : calculatePeriodData('current-month');
  const periodSales = getPeriodSales(selectedPeriod);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const profitMargin = currentData.revenue > 0 ? (currentData.profit / currentData.revenue) * 100 : 0;
  const revenueChange = calculateChange(currentData.revenue, previousPeriodData.revenue);
  const profitChange = calculateChange(currentData.profit, previousPeriodData.profit);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'current-month': return 'Mois en cours';
      case 'last-month': return 'Mois dernier';
      case 'current-quarter': return 'Trimestre en cours';
      case 'current-year': return 'Année en cours';
      default: return 'Période sélectionnée';
    }
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      {/* Modal Chiffre d'Affaires */}
      <Dialog open={activeModal === 'revenue'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Détails Chiffre d'Affaires - {getPeriodLabel(selectedPeriod)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {periodSales.slice(0, 20).map((sale, idx) => {
                const values = getSaleValues(sale);
                const saleDate = new Date(sale.date);
                return (
                  <div
                    key={sale.id || idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs shadow-lg">
                        {saleDate.getDate()}/{saleDate.getMonth() + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {sale.clientName || 'Client anonyme'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {values.totalProductsSold} produit{values.totalProductsSold > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatEuro(values.revenue)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Total CA</span>
                <p className="text-xs opacity-80">{currentData.salesCount} transactions</p>
              </div>
              <span className="text-2xl font-bold">{formatEuro(currentData.revenue)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Coûts d'Achat */}
      <Dialog open={activeModal === 'cost'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-red-50/50 dark:from-gray-900 dark:to-red-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg">
                <Receipt className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Détails Coûts d'Achat - {getPeriodLabel(selectedPeriod)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {periodSales.slice(0, 20).map((sale, idx) => {
                const values = getSaleValues(sale);
                const saleDate = new Date(sale.date);
                const costPercent = values.revenue > 0 ? (values.cost / values.revenue) * 100 : 0;
                return (
                  <div
                    key={sale.id || idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-900/20 dark:to-orange-900/20 border border-red-100 dark:border-red-800/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-xs shadow-lg">
                        {saleDate.getDate()}/{saleDate.getMonth() + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {sale.clientName || 'Client anonyme'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {costPercent.toFixed(1)}% du CA
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        {formatEuro(values.cost)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Total Coûts</span>
                <p className="text-xs opacity-80">
                  {currentData.revenue > 0 ? ((currentData.cost / currentData.revenue) * 100).toFixed(1) : 0}% du CA
                </p>
              </div>
              <span className="text-2xl font-bold">{formatEuro(currentData.cost)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Bénéfice Net */}
      <Dialog open={activeModal === 'profit'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Détails Bénéfice Net - {getPeriodLabel(selectedPeriod)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {periodSales.slice(0, 20).map((sale, idx) => {
                const values = getSaleValues(sale);
                const saleDate = new Date(sale.date);
                const margin = values.revenue > 0 ? (values.profit / values.revenue) * 100 : 0;
                return (
                  <div
                    key={sale.id || idx}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-100 dark:border-emerald-800/50 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-xs shadow-lg">
                        {saleDate.getDate()}/{saleDate.getMonth() + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {sale.clientName || 'Client anonyme'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Marge: {margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        {formatEuro(values.profit)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Total Bénéfice</span>
                <p className="text-xs opacity-80">Marge: {profitMargin.toFixed(1)}%</p>
              </div>
              <span className="text-2xl font-bold">{formatEuro(currentData.profit)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Panier Moyen */}
      <Dialog open={activeModal === 'avgOrder'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white via-purple-50/30 to-fuchsia-50/50 dark:from-gray-900 dark:via-purple-950/30 dark:to-fuchsia-950/20 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-xl shadow-purple-500/30">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  Panier Moyen
                </span>
                <p className="text-xs text-purple-500/70 font-medium">{getPeriodLabel(selectedPeriod)}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-900/40 dark:to-fuchsia-900/30 border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Gem className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-600 uppercase">Panier Actuel</span>
                </div>
                <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {formatEuro(currentData.avgOrderValue)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/30 border border-indigo-200/50 dark:border-indigo-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-600 uppercase">CA Total</span>
                </div>
                <p className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatEuro(currentData.revenue)}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  <div>
                    <span className="font-bold">Nombre de transactions</span>
                    <p className="text-xs opacity-80">Sur cette période</p>
                  </div>
                </div>
                <span className="text-3xl font-black">{currentData.salesCount}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Marge Brute */}
      <Dialog open={activeModal === 'margin'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white via-amber-50/30 to-yellow-50/50 dark:from-gray-900 dark:via-amber-950/30 dark:to-yellow-950/20 backdrop-blur-xl border-amber-200/50 dark:border-amber-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white shadow-xl shadow-amber-500/30">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Marge Brute
                </span>
                <p className="text-xs text-amber-500/70 font-medium">{getPeriodLabel(selectedPeriod)}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] font-semibold text-blue-600 uppercase">CA</span>
                </div>
                <p className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {formatEuro(currentData.revenue)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/30 border border-red-200/50 dark:border-red-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="h-4 w-4 text-red-500" />
                  <span className="text-[10px] font-semibold text-red-600 uppercase">Coûts</span>
                </div>
                <p className="text-lg font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {formatEuro(currentData.cost)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase">Profit</span>
                </div>
                <p className="text-lg font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {formatEuro(currentData.profit)}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gem className="h-5 w-5" />
                  <div>
                    <span className="font-bold">Marge de profit</span>
                    <p className="text-xs opacity-80">Pourcentage du CA</p>
                  </div>
                </div>
                <span className="text-3xl font-black">{profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Nombre de Ventes */}
      <Dialog open={activeModal === 'salesCount'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white via-cyan-50/30 to-teal-50/50 dark:from-gray-900 dark:via-cyan-950/30 dark:to-teal-950/20 backdrop-blur-xl border-cyan-200/50 dark:border-cyan-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500 text-white shadow-xl shadow-cyan-500/30">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-600 bg-clip-text text-transparent">
                  Nombre de Ventes
                </span>
                <p className="text-xs text-cyan-500/70 font-medium">{getPeriodLabel(selectedPeriod)}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-100 dark:from-cyan-900/40 dark:to-sky-900/30 border border-cyan-200/50 dark:border-cyan-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-cyan-500" />
                  <span className="text-xs font-semibold text-cyan-600 uppercase">Transactions</span>
                </div>
                <p className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                  {currentData.salesCount}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/30 border border-teal-200/50 dark:border-teal-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-4 w-4 text-teal-500" />
                  <span className="text-xs font-semibold text-teal-600 uppercase">Produits vendus</span>
                </div>
                <p className="text-3xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  {currentData.totalProductsSold}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5" />
                  <div>
                    <span className="font-bold">Produits/Transaction</span>
                    <p className="text-xs opacity-80">Moyenne</p>
                  </div>
                </div>
                <span className="text-3xl font-black">
                  {currentData.salesCount > 0 ? (currentData.totalProductsSold / currentData.salesCount).toFixed(1) : '0'}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Profit par Vente */}
      <Dialog
        open={activeModal === 'profitPerSale'}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-gradient-to-br from-white via-rose-50/30 to-pink-50/50 dark:from-gray-900 dark:via-rose-950/30 dark:to-pink-950/20 backdrop-blur-xl border-rose-200/50 dark:border-rose-800/50">

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white shadow-xl shadow-rose-500/30">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Profit par Vente
                </span>
                <p className="text-xs text-rose-500/70 font-medium">
                  {getPeriodLabel(selectedPeriod)}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* BODY SCROLLABLE */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">

            <ScrollArea className="h-[40vh] pr-4">
              <div className="space-y-2">
                {periodSales.slice(0, 10).map((sale, idx) => {
                  const values = getSaleValues(sale);
                  const saleDate = new Date(sale.date);

                  return (
                    <div
                      key={sale.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-100 dark:border-rose-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs">
                          {saleDate.getDate()}/{saleDate.getMonth() + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {sale.clientName || 'Client'}
                        </span>
                      </div>

                      <span className="font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                        {formatEuro(values.profit)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-5 w-5" />
                  <div>
                    <span className="font-bold">Profit moyen/vente</span>
                    <p className="text-xs opacity-80">
                      Sur {currentData.salesCount} ventes
                    </p>
                  </div>
                </div>

                <span className="text-2xl font-black">
                  {formatEuro(
                    currentData.salesCount > 0
                      ? currentData.profit / currentData.salesCount
                      : 0
                  )}
                </span>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      <CardHeader className="border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
            <Calculator className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Compte de Résultat
          </span>
        </CardTitle>
        <CardDescription>
          Analyse détaillée des revenus, coûts et bénéfices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48 border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500">
              <SelectValue placeholder="Sélectionner une période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mois en cours</SelectItem>
              <SelectItem value="last-month">Mois dernier</SelectItem>
              <SelectItem value="current-quarter">Trimestre en cours</SelectItem>
              <SelectItem value="current-year">Année en cours</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Masquer détails' : 'Voir détails'}
          </Button>
        </div>

        <div className="text-center mb-4">
          <Badge variant="outline" className="text-sm px-4 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
            {getPeriodLabel(selectedPeriod)}
          </Badge>
        </div>

        {/* Métriques principales - Premium et Cliquables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveModal('revenue')}
            className="cursor-pointer group p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] hover:border-blue-400/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                  <DollarSign className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Chiffre d'Affaires</h4>
              </div>
              {formatChange(revenueChange)}
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatEuro(currentData.revenue)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{currentData.totalProductsSold} produits vendus</p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>

          <div
            onClick={() => setActiveModal('cost')}
            className="cursor-pointer group p-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:scale-[1.02] hover:border-red-400/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg">
                  <Receipt className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-300">Coûts d'Achat</h4>
              </div>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatEuro(currentData.cost)}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {currentData.revenue > 0 ? ((currentData.cost / currentData.revenue) * 100).toFixed(1) : 0}% du CA
            </p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>

          <div
            onClick={() => setActiveModal('profit')}
            className="cursor-pointer group p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-[1.02] hover:border-emerald-400/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                  <Target className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Bénéfice Net</h4>
              </div>
              {formatChange(profitChange)}
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatEuro(currentData.profit)}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Marge: {profitMargin.toFixed(1)}%</p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Métriques détaillées - Premium & Cliquables */}
        {showDetails && (
          <div className="space-y-4">
            <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                Métriques Détaillées
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Panier Moyen - Cliquable */}
                <div
                  onClick={() => setActiveModal('avgOrder')}
                  className="cursor-pointer group text-center p-4 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-900/30 dark:via-fuchsia-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.03] hover:border-purple-400/70 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wide">Panier Moyen</p>
                    <p className="text-xl font-black bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      {formatEuro(currentData.avgOrderValue)}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="h-3 w-3" />
                      <span>Voir détails</span>
                    </div>
                  </div>
                </div>

                {/* Marge Brute - Cliquable */}
                <div
                  onClick={() => setActiveModal('margin')}
                  className="cursor-pointer group text-center p-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200/50 dark:border-amber-700/50 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 hover:scale-[1.03] hover:border-amber-400/70 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                        <Crown className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">Marge Brute</p>
                    <p className="text-xl font-black bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      {profitMargin.toFixed(1)}%
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Gem className="h-3 w-3" />
                      <span>Voir détails</span>
                    </div>
                  </div>
                </div>

                {/* Nombre de Ventes - Cliquable */}
                <div
                  onClick={() => setActiveModal('salesCount')}
                  className="cursor-pointer group text-center p-4 bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 dark:from-cyan-900/30 dark:via-sky-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-cyan-200/50 dark:border-cyan-700/50 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-[1.03] hover:border-cyan-400/70 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30">
                        <Zap className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wide">Nombre de Ventes</p>
                    <p className="text-xl font-black bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      {currentData.salesCount}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trophy className="h-3 w-3" />
                      <span>Voir détails</span>
                    </div>
                  </div>
                </div>

                {/* Profit/Vente - Cliquable */}
                <div
                  onClick={() => setActiveModal('profitPerSale')}
                  className="cursor-pointer group text-center p-4 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-rose-900/30 dark:via-pink-900/20 dark:to-red-900/20 rounded-2xl border-2 border-rose-200/50 dark:border-rose-700/50 shadow-lg hover:shadow-2xl hover:shadow-rose-500/20 hover:scale-[1.03] hover:border-rose-400/70 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30">
                        <Star className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wide">Profit/Vente</p>
                    <p className="text-xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      {formatEuro(currentData.salesCount > 0 ? currentData.profit / currentData.salesCount : 0)}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PiggyBank className="h-3 w-3" />
                      <span>Voir détails</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analyse de performance */}
            <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Analyse de Performance
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl">
                  <span className="text-sm font-medium">Rentabilité</span>
                  <Badge className={`${profitMargin > 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                    profitMargin > 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {profitMargin > 20 ? 'Excellente' : profitMargin > 10 ? 'Bonne' : 'À améliorer'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl">
                  <span className="text-sm font-medium">Évolution du CA</span>
                  <Badge className={`${revenueChange > 10 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                    revenueChange > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {revenueChange > 10 ? 'Forte croissance' :
                      revenueChange > 0 ? 'Croissance modérée' : 'En baisse'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl">
                  <span className="text-sm font-medium">Volume de ventes</span>
                  <Badge className={`${currentData.salesCount > 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                    currentData.salesCount > 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {currentData.salesCount > 20 ? 'Élevé' :
                      currentData.salesCount > 10 ? 'Modéré' : 'Faible'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitLossStatement;
