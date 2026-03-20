/**
 * SoldeNetDetails - Affichage détaillé du calcul du solde net
 * 
 * @description
 * Composant pour afficher le détail du calcul du solde net :
 * - Récapitulatif Crédit vs Débit
 * - Indicateur visuel de balance
 * - Détails des composantes
 * 
 * @example
 * ```tsx
 * <SoldeNetDetails 
 *   totalCredit={5000}
 *   totalDebit={2000}
 *   achatsTotal={1500}
 *   depensesTotal={500}
 *   soldeNet={3000}
 *   formatEuro={formatEuro} 
 * />
 * ```
 * 
 * @props
 * - totalCredit: Total des crédits (ventes)
 * - totalDebit: Total des débits (achats + dépenses)
 * - achatsTotal: Total des achats produits
 * - depensesTotal: Total des autres dépenses
 * - soldeNet: Solde net calculé
 * - formatEuro: Fonction de formatage monétaire
 */

import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, Package, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface SoldeNetDetailsProps {
  totalCredit: number;
  totalDebit: number;
  achatsTotal: number;
  depensesTotal: number;
  soldeNet: number;
  formatEuro: (value: number) => string;
}

const SoldeNetDetails: React.FC<SoldeNetDetailsProps> = ({
  totalCredit,
  totalDebit,
  achatsTotal,
  depensesTotal,
  soldeNet,
  formatEuro
}) => {
  const isPositive = soldeNet >= 0;
  const percentageCredit = totalCredit + totalDebit > 0 
    ? (totalCredit / (totalCredit + totalDebit)) * 100 
    : 50;

  return (
    <div className="space-y-4">
      {/* Comparaison visuelle Crédit vs Débit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <ArrowUpCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Total Crédit</p>
                <p className="text-2xl font-bold text-green-700">{formatEuro(totalCredit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <ArrowDownCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Total Débit</p>
                <p className="text-2xl font-bold text-red-700">{formatEuro(totalDebit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de progression visuelle */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Balance Crédit/Débit</p>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${percentageCredit}%` }}
          />
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-500"
            style={{ width: `${100 - percentageCredit}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Crédit: {percentageCredit.toFixed(1)}%</span>
          <span>Débit: {(100 - percentageCredit).toFixed(1)}%</span>
        </div>
      </div>

      {/* Détail des dépenses */}
      <div className="border-t pt-4">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Composition du Débit</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-500" />
              <span className="text-indigo-700 dark:text-indigo-300">Achats Produits</span>
            </div>
            <span className="font-bold text-indigo-800 dark:text-indigo-200">{formatEuro(achatsTotal)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-500" />
              <span className="text-orange-700 dark:text-orange-300">Autres Dépenses</span>
            </div>
            <span className="font-bold text-orange-800 dark:text-orange-200">{formatEuro(depensesTotal)}</span>
          </div>
        </div>
      </div>

      {/* Résultat Solde Net */}
      <Card className={`${isPositive ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50' : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPositive ? (
                <TrendingUp className="h-8 w-8 text-cyan-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className={`text-sm font-medium ${isPositive ? 'text-cyan-600' : 'text-red-600'}`}>
                  Solde Net
                </p>
                <p className="text-xs text-gray-500">
                  Crédit - Débit = Solde
                </p>
              </div>
            </div>
            <p className={`text-3xl font-black ${isPositive ? 'text-cyan-700' : 'text-red-700'}`}>
              {formatEuro(soldeNet)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formule de calcul */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-sm text-gray-600 dark:text-gray-400">
        <strong>Formule:</strong> {formatEuro(totalCredit)} (Crédit) - {formatEuro(totalDebit)} (Débit) = <span className={isPositive ? 'text-cyan-600 font-bold' : 'text-red-600 font-bold'}>{formatEuro(soldeNet)}</span>
      </div>
    </div>
  );
};

export default SoldeNetDetails;
