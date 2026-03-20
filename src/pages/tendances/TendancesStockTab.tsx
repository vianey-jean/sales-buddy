/**
 * =============================================================================
 * TendancesStockTab - Onglet Prévention Stock (Intelligence)
 * =============================================================================
 * 
 * Alertes de stock critique et recommandations IA pour optimiser les ventes.
 * 
 * @module TendancesStockTab
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Sparkles, Package } from 'lucide-react';

interface TendancesStockTabProps {
  stockAnalysis: { recommendations: any[] };
  dailySalesAnalysis: any[];
  salesData: { totals: { revenue: number; profit: number } };
}

const TendancesStockTab: React.FC<TendancesStockTabProps> = ({ stockAnalysis, dailySalesAnalysis, salesData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Alertes Stock Critique */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
            Alertes Stock Critique
          </CardTitle>
          <CardDescription>Produits nécessitant un réapprovisionnement urgent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockAnalysis.recommendations.length > 0 ? (
              stockAnalysis.recommendations.map((item, index) => (
                <div key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-red-700 dark:text-red-300">{item.description}</h3>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs font-bold">
                        Stock: {item.currentStock}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Vendus:</span>
                      <span className="font-semibold ml-1 text-blue-600">{item.totalSold}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Bénéfice moy:</span>
                      <span className="font-semibold ml-1 text-emerald-600">{item.averageProfit.toFixed(2)} €</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Priorité:</span>
                      <span className="font-semibold ml-1 text-orange-600">
                        {item.currentStock <= 2 ? 'URGENT' : item.currentStock <= 5 ? 'ÉLEVÉE' : 'MOYENNE'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune alerte stock critique</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations IA */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
            Recommandations IA
          </CardTitle>
          <CardDescription>Suggestions intelligentes pour optimiser vos ventes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-emerald-200">
              <h3 className="font-semibold text-emerald-700 mb-2">📈 Tendances Identifiées</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Les ventes sont {dailySalesAnalysis.length > 15 ? 'plus élevées' : 'plus faibles'} en milieu de mois</li>
                <li>• Catégorie la plus rentable: Perruques</li>
                <li>• Marge bénéficiaire moyenne: {salesData.totals.revenue > 0 ? ((salesData.totals.profit / salesData.totals.revenue) * 100).toFixed(1) : 0}%</li>
              </ul>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">🎯 Actions Recommandées</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Réapprovisionner {stockAnalysis.recommendations.length} produits critiques</li>
                <li>• Focus sur les perruques (meilleure marge)</li>
                <li>• Optimiser les ventes en début de mois</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TendancesStockTab;
