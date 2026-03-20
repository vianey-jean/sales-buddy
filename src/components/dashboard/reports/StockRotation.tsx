
import React, { useMemo } from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle, RotateCcw, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ModernCard from '../forms/ModernCard';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

const StockRotation: React.FC = () => {
  const { products, allSales } = useApp();
  const { formatCurrency } = useCurrencyFormatter();

  const rotationData = useMemo(() => {
    const productAnalysis = new Map();
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

    // Initialiser l'analyse pour tous les produits
    products.forEach(product => {
      productAnalysis.set(product.id, {
        id: product.id,
        name: product.description,
        currentStock: product.quantity,
        purchasePrice: product.purchasePrice,
        totalSold: 0,
        recentSales: 0,
        revenue: 0,
        lastSaleDate: null,
        rotationRate: 0,
        stockValue: product.quantity * product.purchasePrice,
        category: 'Lent',
        daysWithoutSale: 0
      });
    });

    // Analyser les ventes
    allSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const analysis = productAnalysis.get(sale.productId);
      
      if (analysis) {
        analysis.totalSold += sale.quantitySold;
        analysis.revenue += sale.sellingPrice * sale.quantitySold;
        
        if (saleDate >= threeMonthsAgo) {
          analysis.recentSales += sale.quantitySold;
        }
        
        if (!analysis.lastSaleDate || saleDate > analysis.lastSaleDate) {
          analysis.lastSaleDate = saleDate;
        }
      }
    });

    // Calculer les métriques de rotation
    Array.from(productAnalysis.values()).forEach(analysis => {
      const avgStock = (analysis.currentStock + analysis.totalSold) / 2;
      analysis.rotationRate = avgStock > 0 ? (analysis.recentSales / avgStock) * 4 : 0; // Annualisé
      
      if (analysis.lastSaleDate) {
        analysis.daysWithoutSale = Math.floor((now.getTime() - analysis.lastSaleDate.getTime()) / (24 * 60 * 60 * 1000));
      } else {
        analysis.daysWithoutSale = 365; // Produit jamais vendu
      }
      
      // Catégoriser les produits
      if (analysis.rotationRate > 8) {
        analysis.category = 'Très Rapide';
      } else if (analysis.rotationRate > 4) {
        analysis.category = 'Rapide';
      } else if (analysis.rotationRate > 2) {
        analysis.category = 'Moyen';
      } else if (analysis.rotationRate > 0.5) {
        analysis.category = 'Lent';
      } else {
        analysis.category = 'Immobile';
      }
    });

    const sortedProducts = Array.from(productAnalysis.values()).sort((a, b) => b.rotationRate - a.rotationRate);
    
    // Statistiques globales
    const totalStockValue = sortedProducts.reduce((acc, p) => acc + p.stockValue, 0);
    const fastMoving = sortedProducts.filter(p => p.rotationRate > 4).length;
    const slowMoving = sortedProducts.filter(p => p.rotationRate < 1).length;
    const deadStock = sortedProducts.filter(p => p.daysWithoutSale > 180).length;

    // Données pour les graphiques
    const categoryData = [
      { name: 'Très Rapide', value: sortedProducts.filter(p => p.category === 'Très Rapide').length, color: '#10B981' },
      { name: 'Rapide', value: sortedProducts.filter(p => p.category === 'Rapide').length, color: '#06B6D4' },
      { name: 'Moyen', value: sortedProducts.filter(p => p.category === 'Moyen').length, color: '#F59E0B' },
      { name: 'Lent', value: sortedProducts.filter(p => p.category === 'Lent').length, color: '#EF4444' },
      { name: 'Immobile', value: sortedProducts.filter(p => p.category === 'Immobile').length, color: '#6B7280' }
    ];

    return {
      products: sortedProducts,
      stats: {
        totalProducts: sortedProducts.length,
        totalStockValue,
        fastMoving,
        slowMoving,
        deadStock,
        avgRotationRate: sortedProducts.reduce((acc, p) => acc + p.rotationRate, 0) / sortedProducts.length
      },
      categoryData: categoryData.filter(cat => cat.value > 0)
    };
  }, [products, allSales]);

  const getPerformanceColor = (category: string) => {
    switch (category) {
      case 'Très Rapide': return 'text-emerald-600 dark:text-emerald-400';
      case 'Rapide': return 'text-blue-600 dark:text-blue-400';
      case 'Moyen': return 'text-yellow-600 dark:text-yellow-400';
      case 'Lent': return 'text-orange-600 dark:text-orange-400';
      case 'Immobile': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPerformanceIcon = (category: string) => {
    switch (category) {
      case 'Très Rapide': return Zap;
      case 'Rapide': return TrendingUp;
      case 'Moyen': return RotateCcw;
      case 'Lent': return AlertTriangle;
      case 'Immobile': return Package;
      default: return Package;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard
          title="Valeur Stock"
          icon={Package}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(rotationData.stats.totalStockValue)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {rotationData.stats.totalProducts} produits
          </p>
        </ModernCard>

        <ModernCard
          title="Rotation Rapide"
          icon={Zap}
          className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20"
        >
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {rotationData.stats.fastMoving}
          </div>
          <div className="flex items-center mt-1">
            <Progress 
              value={(rotationData.stats.fastMoving / rotationData.stats.totalProducts) * 100} 
              className="flex-1 h-2 mr-2"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {Math.round((rotationData.stats.fastMoving / rotationData.stats.totalProducts) * 100)}%
            </span>
          </div>
        </ModernCard>

        <ModernCard
          title="Rotation Lente"
          icon={AlertTriangle}
          className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
        >
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {rotationData.stats.slowMoving}
          </div>
          <div className="flex items-center mt-1">
            <Progress 
              value={(rotationData.stats.slowMoving / rotationData.stats.totalProducts) * 100} 
              className="flex-1 h-2 mr-2"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {Math.round((rotationData.stats.slowMoving / rotationData.stats.totalProducts) * 100)}%
            </span>
          </div>
        </ModernCard>

        <ModernCard
          title="Stock Mort"
          icon={Package}
          className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20"
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {rotationData.stats.deadStock}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            +180j sans vente
          </p>
        </ModernCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard
          title="Distribution par Performance"
          icon={RotateCcw}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rotationData.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rotationData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} produits`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {rotationData.categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.value}
                </Badge>
              </div>
            ))}
          </div>
        </ModernCard>

        <ModernCard
          title="Top Performers"
          icon={TrendingUp}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rotationData.products.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${(value as number).toFixed(2)}x/an`, 'Rotation']}
                  labelFormatter={(label) => `${(label as string).substring(0, 20)}...`}
                />
                <Bar 
                  dataKey="rotationRate" 
                  fill="url(#rotationGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="rotationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ModernCard>
      </div>

      {/* Product Details */}
      <ModernCard
        title="Analyse Détaillée des Produits"
        icon={Package}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {rotationData.products.slice(0, 15).map((product, index) => {
            const Icon = getPerformanceIcon(product.category);
            return (
              <div 
                key={product.id} 
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {product.name.substring(0, 40)}...
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Stock: {product.currentStock}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Valeur: {formatCurrency(product.stockValue)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Dernière vente: {product.daysWithoutSale}j
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {product.rotationRate.toFixed(1)}x/an
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getPerformanceColor(product.category)}`}
                    >
                      {product.category}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ModernCard>
    </div>
  );
};

export default StockRotation;
