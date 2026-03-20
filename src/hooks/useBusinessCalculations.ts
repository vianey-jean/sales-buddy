
import { useMemo } from 'react';
import { Sale } from '@/types';

/**
 * Interface pour les statistiques de ventes (immuable)
 */
export interface BusinessCalculations {
  readonly totalRevenue: number;
  readonly totalProfit: number;
  readonly totalQuantity: number;
  readonly averageProfit: number;
  readonly averageMargin: number;
  readonly salesCount: number;
}

/**
 * Hook pour les calculs commerciaux (fonction pure avec mémoïsation)
 * @param sales - Liste des ventes (immuable)
 * @returns Statistiques calculées (immuables)
 */
export const useBusinessCalculations = (sales: readonly Sale[]): BusinessCalculations => {
  return useMemo(() => {
    if (sales.length === 0) {
      return Object.freeze({
        totalRevenue: 0,
        totalProfit: 0,
        totalQuantity: 0,
        averageProfit: 0,
        averageMargin: 0,
        salesCount: 0
      });
    }

    // Calculs purs sans effets de bord
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.sellingPrice * sale.quantitySold), 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
    const averageProfit = totalProfit / sales.length;
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Retour d'un objet immuable
    return Object.freeze({
      totalRevenue,
      totalProfit,
      totalQuantity,
      averageProfit,
      averageMargin,
      salesCount: sales.length
    });
  }, [sales]);
};
