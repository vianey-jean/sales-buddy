
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

interface InventoryMetrics {
  totalProducts: number;
  totalValue: number;
  outOfStock: number;
  lowStock: number;
  overStock: number;
  fastMoving: string[];
  slowMoving: string[];
  topValueProducts: Array<{id: string; description: string; value: number}>;
}

const InventoryAnalyzer: React.FC = () => {
  const { products, allSales } = useApp();
  const { formatEuro } = useCurrencyFormatter();
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeInventory = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Calculer les métriques d'inventaire
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, product) => sum + (product.purchasePrice * product.quantity), 0);
      
      // Analyser les ventes des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentSales = allSales.filter(sale => new Date(sale.date) >= thirtyDaysAgo);
      
      // Calculer la vélocité de rotation pour chaque produit
      const productVelocity = products.map(product => {
        const productSales = recentSales.filter(sale => sale.productId === product.id);
        const totalSold = productSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
        const velocity = product.quantity > 0 ? totalSold / 30 : 0; // ventes par jour
        
        return {
          ...product,
          velocity,
          totalSold,
          daysOfStock: velocity > 0 ? product.quantity / velocity : Infinity
        };
      });
      
      // Catégoriser les produits
      const outOfStock = productVelocity.filter(p => p.quantity === 0).length;
      const lowStock = productVelocity.filter(p => p.quantity > 0 && p.daysOfStock < 14).length;
      const overStock = productVelocity.filter(p => p.daysOfStock > 90 && p.totalSold === 0).length;
      
      // Produits à rotation rapide (vendus au moins 3 fois en 30 jours)
      const fastMoving = productVelocity
        .filter(p => p.totalSold >= 3)
        .sort((a, b) => b.velocity - a.velocity)
        .slice(0, 5)
        .map(p => p.description);
      
      // Produits à rotation lente (pas de ventes en 30 jours)
      const slowMoving = productVelocity
        .filter(p => p.totalSold === 0 && p.quantity > 0)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(p => p.description);
      
      // Produits avec la plus grande valeur de stock
      const topValueProducts = productVelocity
        .map(p => ({
          id: p.id,
          description: p.description,
          value: p.purchasePrice * p.quantity
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      const newMetrics: InventoryMetrics = {
        totalProducts,
        totalValue,
        outOfStock,
        lowStock,
        overStock,
        fastMoving,
        slowMoving,
        topValueProducts
      };
      
      setMetrics(newMetrics);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-600" />
          Analyseur d'Inventaire
        </CardTitle>
        <CardDescription>
          Analyse complète de votre stock et optimisation de l'inventaire
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={analyzeInventory} 
          disabled={isAnalyzing}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isAnalyzing ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-pulse" />
              Analyse en cours...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyser l'inventaire
            </>
          )}
        </Button>

        {metrics && (
          <Tabs defaultValue="overview" className="w-full">
           <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2 h-auto p-2 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow">
  
  <TabsTrigger
    value="overview"
    className="w-full h-12 flex items-center justify-center rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
  >
    Vue d'ensemble
  </TabsTrigger>

  <TabsTrigger
    value="performance"
    className="w-full h-12 flex items-center justify-center rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
  >
    Performance
  </TabsTrigger>

  <TabsTrigger
    value="alerts"
    className="w-full h-12 flex items-center justify-center rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
  >
    Alertes
  </TabsTrigger>

</TabsList>

            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-blue-600">Total Produits</p>
                  <p className="text-xl font-bold text-blue-800">{metrics.totalProducts}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-green-600">Valeur Stock</p>
                  <p className="text-xl font-bold text-green-800">{formatEuro(metrics.totalValue)}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="text-sm text-red-600">Stock Épuisé</p>
                  <p className="text-xl font-bold text-red-800">{metrics.outOfStock}</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <Package className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-sm text-yellow-600">Stock Faible</p>
                  <p className="text-xl font-bold text-yellow-800">{metrics.lowStock}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Produits à Plus Grande Valeur</h4>
                {metrics.topValueProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{index + 1}. {product.description}</span>
                    <span className="font-bold text-green-600">{formatEuro(product.value)}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Rotation Rapide
                  </h4>
                  {metrics.fastMoving.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.fastMoving.map((product, index) => (
                        <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                          <p className="text-sm font-medium text-green-800">{product}</p>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Haute demande
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucun produit à rotation rapide détecté</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    Rotation Lente
                  </h4>
                  {metrics.slowMoving.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.slowMoving.map((product, index) => (
                        <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-500">
                          <p className="text-sm font-medium text-red-800">{product}</p>
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            Faible demande
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Tous les produits ont une rotation acceptable</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-4">
              <div className="space-y-4">
                {metrics.outOfStock > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-800">Stock Épuisé</h4>
                    </div>
                    <p className="text-sm text-red-700">
                      {metrics.outOfStock} produit(s) en rupture de stock. Commande urgente recommandée.
                    </p>
                  </div>
                )}
                
                {metrics.lowStock > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800">Stock Faible</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      {metrics.lowStock} produit(s) avec moins de 14 jours de stock restant.
                    </p>
                  </div>
                )}
                
                {metrics.overStock > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Surstock</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      {metrics.overStock} produit(s) sans ventes récentes. Considérer une promotion.
                    </p>
                  </div>
                )}
                
                {metrics.outOfStock === 0 && metrics.lowStock === 0 && metrics.overStock === 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold text-green-800">Inventaire Optimal</h4>
                    <p className="text-sm text-green-700">
                      Aucune alerte détectée. Votre gestion des stocks est excellente !
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryAnalyzer;
