// Résumé :
// Ce composant React affiche un tableau de bord avec indicateurs et graphiques
// (CA, ventes, quantités, évolution mensuelle, top produits, performance).
// Correction : Affiche UNIQUEMENT les données de l'année en cours.
// Les données se réinitialisent automatiquement au 01/01 de chaque nouvelle année.

import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Calendar, ArrowUpRight, ShoppingBag, Users, X } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { useYearlyData, getSaleValues } from '@/hooks/useYearlyData';

type ModalType = 'revenue' | 'sales' | 'quantity' | null;

const SalesReport: React.FC = () => {
  const { allSales } = useApp();
  const { formatCurrency } = useCurrencyFormatter();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // Utiliser le hook pour obtenir les données de l'année en cours
  const { currentYear, currentYearSales, currentYearMonthlyStats, currentYearTotals } = useYearlyData(allSales);

  // Données des produits pour l'année en cours uniquement
  const productData = useMemo(() => {
    const productMap = new Map();

    currentYearSales.forEach((sale) => {
      // Format multi-produits
      if (sale.products && Array.isArray(sale.products)) {
        sale.products.forEach((product) => {
          if (!productMap.has(product.productId)) {
            productMap.set(product.productId, {
              name: product.description,
              revenue: 0,
              quantity: 0,
              sales: 0,
            });
          }

          const prodData = productMap.get(product.productId);
          prodData.revenue += product.sellingPrice * product.quantitySold;
          prodData.quantity += product.quantitySold;
          prodData.sales += 1;
        });
      }
      // Format single-produit
      else if (sale.productId) {
        const saleValues = getSaleValues(sale);
        
        if (!productMap.has(sale.productId)) {
          productMap.set(sale.productId, {
            name: sale.description || 'Produit inconnu',
            revenue: 0,
            quantity: 0,
            sales: 0,
          });
        }

        const prodData = productMap.get(sale.productId);
        prodData.revenue += saleValues.revenue;
        prodData.quantity += saleValues.quantity;
        prodData.sales += 1;
      }
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [currentYearSales]);

  // Formater les données mensuelles pour les graphiques
  const monthlyChartData = currentYearMonthlyStats.map(m => ({
    month: m.month,
    revenue: m.revenue,
    quantity: m.quantity,
    profit: m.profit,
    sales: m.salesCount
  }));

  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  // Détails mensuels pour chaque modal
  const monthlyDetails = currentYearMonthlyStats.map(m => ({
    month: m.month,
    monthNum: m.monthNum,
    revenue: m.revenue,
    profit: m.profit,
    quantity: m.quantity,
    salesCount: m.salesCount
  }));

  return (
    <div className="space-y-6">
      {/* Indicateur d'année en cours */}
      <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Statistiques de l'année {currentYear} (réinitialisées au 01/01/{currentYear})
        </span>
      </div>

      {/* Modales de détails */}
      {/* Modal Chiffre d'Affaires */}
      <Dialog open={activeModal === 'revenue'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Chiffre d'Affaires {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyDetails.map((data) => (
                <div 
                  key={data.monthNum}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg">
                      {data.monthNum}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{data.month}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {data.salesCount} vente{data.salesCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {formatCurrency(data.revenue)}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Profit: {formatCurrency(data.profit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Année {currentYear}</span>
              <span className="text-2xl font-bold">{formatCurrency(currentYearTotals.revenue)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ventes */}
      <Dialog open={activeModal === 'sales'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Transactions {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyDetails.map((data) => (
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
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {data.salesCount} vente{data.salesCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {data.quantity} unités
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Transactions {currentYear}</span>
              <span className="text-2xl font-bold">{currentYearTotals.salesCount}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Quantité */}
      <Dialog open={activeModal === 'quantity'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Unités Vendues {currentYear}
              </span>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {monthlyDetails.map((data) => (
                <div 
                  key={data.monthNum}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/50 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm shadow-lg">
                      {data.monthNum}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{data.month}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {data.salesCount} transaction{data.salesCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {data.quantity} unités
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      CA: {formatCurrency(data.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Unités {currentYear}</span>
              <span className="text-2xl font-bold">{currentYearTotals.quantity}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* KPI Cards - Premium et Cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveModal('revenue')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`Chiffre d'Affaires ${currentYear}`}
            icon={DollarSign}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/20 group-hover:scale-[1.02] group-hover:border-emerald-400/50 border-2 border-transparent"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {formatCurrency(currentYearTotals.revenue)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Revenue total de l'année
            </p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        <div 
          onClick={() => setActiveModal('sales')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`Ventes ${currentYear}`}
            icon={BarChart3}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/20 group-hover:scale-[1.02] group-hover:border-blue-400/50 border-2 border-transparent"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {currentYearTotals.salesCount}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Transactions de l'année
            </p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>

        <div 
          onClick={() => setActiveModal('quantity')}
          className="cursor-pointer group"
        >
          <ModernCard
            title={`Quantité ${currentYear}`}
            icon={Package}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/20 group-hover:scale-[1.02] group-hover:border-purple-400/50 border-2 border-transparent"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              {currentYearTotals.quantity}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Unités vendues cette année
            </p>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Voir détails mensuels</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courbe mensuelle corrigée */}
        <ModernCard
          title={`Évolution Mensuelle ${currentYear}`}
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value, name) => [
                    name === 'revenue'
                      ? formatCurrency(value as number)
                      : value,
                    name === 'revenue'
                      ? 'Revenus'
                      : name === 'quantity'
                      ? 'Quantité'
                      : 'Ventes',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, fill: '#10B981' }}
                />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>

        {/* Top produits */}
        <ModernCard title={`Top Produits ${currentYear}`} icon={Package}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {productData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {productData.slice(0, 3).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="text-sm font-medium truncate">
                    {product.name.substring(0, 20)}...
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(product.revenue)}
                </Badge>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Performance mensuelle */}
        <ModernCard title={`Performance Mensuelle ${currentYear}`} icon={BarChart3}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [formatCurrency(value as number), 'Profit']}
                />
                <Bar
                  dataKey="profit"
                  fill="url(#profitGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>
      </div>
    </div>
  );
};

export default SalesReport;
