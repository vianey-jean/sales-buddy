/**
 * SecondaryStatsCards - Cartes secondaires (Achats, Dépenses, Solde Net)
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Receipt, PiggyBank } from 'lucide-react';
import { ComptabiliteData } from '@/types/comptabilite';

export interface SecondaryStatsCardsProps {
  comptabiliteData: ComptabiliteData;
  formatEuro: (value: number) => string;
  onAchatsProduitsClick: () => void;
  onAutresDepensesClick: () => void;
  onSoldeNetClick: () => void;
}

const SecondaryStatsCards: React.FC<SecondaryStatsCardsProps> = ({
  comptabiliteData,
  formatEuro,
  onAchatsProduitsClick,
  onAutresDepensesClick,
  onSoldeNetClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card 
        className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
        onClick={onAchatsProduitsClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Achats Produits</p>
              <p className="text-xl font-bold text-indigo-500">{formatEuro(comptabiliteData.achatsTotal)}</p>
            </div>
            <Package className="h-8 w-8 text-indigo-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 border-orange-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
        onClick={onAutresDepensesClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Autres Dépenses</p>
              <p className="text-xl font-bold text-orange-500">{formatEuro(comptabiliteData.depensesTotal)}</p>
            </div>
            <Receipt className="h-8 w-8 text-orange-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
        onClick={onSoldeNetClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-400 font-medium">Solde Net</p>
              <p className={`text-xl font-bold ${comptabiliteData.soldeNet >= 0 ? 'text-cyan-600' : 'text-red-300'}`}>
                {formatEuro(comptabiliteData.soldeNet)}
              </p>
            </div>
            <PiggyBank className="h-8 w-8 text-cyan-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecondaryStatsCards;
