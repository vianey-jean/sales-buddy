
/**
 * Service de calculs commerciaux (fonctions pures)
 * Toutes les fonctions sont pures : même entrée = même sortie, aucun effet de bord
 */

export interface ProfitCalculationInput {
  readonly sellingPrice: number;
  readonly purchasePrice: number;
  readonly quantity: number;
}

export interface MarginCalculationInput {
  readonly profit: number;
  readonly cost: number;
}

export interface TotalCostCalculationInput {
  readonly purchasePrice: number;
  readonly customsTax: number;
  readonly vat: number;
  readonly otherFees: number;
}

/**
 * Service de calculs commerciaux
 */
export const BusinessCalculationService = Object.freeze({
  /**
   * Calcule le bénéfice d'une vente
   * @param input - Données de la vente
   * @returns Bénéfice calculé
   */
  calculateProfit(input: ProfitCalculationInput): number {
    const { sellingPrice, purchasePrice, quantity } = input;
    return (sellingPrice - purchasePrice) * quantity;
  },

  /**
   * Calcule la marge bénéficiaire en pourcentage
   * @param input - Données pour le calcul de marge
   * @returns Marge en pourcentage (0-100)
   */
  calculateMargin(input: MarginCalculationInput): number {
    const { profit, cost } = input;
    return cost > 0 ? (profit / cost) * 100 : 0;
  },

  /**
   * Calcule le coût total avec taxes et frais
   * @param input - Données pour le calcul du coût total
   * @returns Coût total calculé
   */
  calculateTotalCost(input: TotalCostCalculationInput): number {
    const { purchasePrice, customsTax, vat, otherFees } = input;
    const vatAmount = (purchasePrice * vat) / 100;
    return purchasePrice + customsTax + vatAmount + otherFees;
  },

  /**
   * Calcule le prix de vente recommandé basé sur la marge désirée
   * @param totalCost - Coût total
   * @param desiredMargin - Marge désirée en pourcentage
   * @returns Prix de vente recommandé
   */
  calculateRecommendedPrice(totalCost: number, desiredMargin: number): number {
    return totalCost * (1 + desiredMargin / 100);
  },

  /**
   * Calcule les statistiques d'un ensemble de ventes
   * @param sales - Liste des ventes
   * @returns Statistiques globales
   */
  calculateSalesStatistics(sales: readonly ProfitCalculationInput[]): {
    readonly totalProfit: number;
    readonly averageProfit: number;
    readonly totalRevenue: number;
    readonly averageRevenue: number;
  } {
    if (sales.length === 0) {
      return Object.freeze({
        totalProfit: 0,
        averageProfit: 0,
        totalRevenue: 0,
        averageRevenue: 0
      });
    }

    const totalProfit = sales.reduce((sum, sale) => 
      sum + this.calculateProfit(sale), 0
    );
    
    const totalRevenue = sales.reduce((sum, sale) => 
      sum + (sale.sellingPrice * sale.quantity), 0
    );

    return Object.freeze({
      totalProfit,
      averageProfit: totalProfit / sales.length,
      totalRevenue,
      averageRevenue: totalRevenue / sales.length
    });
  },

  /**
   * Valide les données d'entrée pour les calculs
   * @param input - Données à valider
   * @returns true si valide, false sinon
   */
  validateCalculationInput(input: ProfitCalculationInput): boolean {
    const { sellingPrice, purchasePrice, quantity } = input;
    
    return (
      typeof sellingPrice === 'number' && sellingPrice >= 0 &&
      typeof purchasePrice === 'number' && purchasePrice >= 0 &&
      typeof quantity === 'number' && quantity > 0 &&
      Number.isFinite(sellingPrice) &&
      Number.isFinite(purchasePrice) &&
      Number.isFinite(quantity)
    );
  }
});
