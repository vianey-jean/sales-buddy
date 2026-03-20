/**
 * =============================================================================
 * TendancesRecommendationsTab - Onglet Recommandations d'achat
 * =============================================================================
 * 
 * Affiche les 12 produits les plus rentables par ROI sous forme de grille
 * de cartes avec détails financiers.
 * 
 * @module TendancesRecommendationsTab
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TendancesRecommendationsTabProps {
  buyingRecommendations: any[];
}

const TendancesRecommendationsTab: React.FC<TendancesRecommendationsTabProps> = ({ buyingRecommendations }) => {
  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
          Recommandations d'Achat Intelligentes (Top 12)
        </CardTitle>
        <CardDescription>Produits à privilégier pour maximiser vos bénéfices (basé sur le ROI historique)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {buyingRecommendations.map((product, index) => (
            <div key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-400" : "bg-emerald-400"
                  )}></div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">#{index + 1}</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">+{product.roi}%</div>
                  <div className="text-xs text-gray-500">ROI</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2" title={product.fullName}>
                {product.name}
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bénéfice total:</span>
                  <span className="font-semibold text-emerald-600">{product.benefice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bénéfice moyen:</span>
                  <span className="font-semibold text-emerald-500">{product.avgProfit} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Prix d'achat:</span>
                  <span className="font-semibold">{(product.prixAchat / product.count).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendus:</span>
                  <span className="font-semibold text-blue-600">{product.count}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Catégorie:</span>
                  <span className="font-semibold text-purple-600">{product.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {buyingRecommendations.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Pas encore assez de données pour générer des recommandations.
              <br />
              Continuez à enregistrer vos ventes !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TendancesRecommendationsTab;
