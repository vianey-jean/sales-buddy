
import { useMemo } from 'react';
import { Product, Sale } from '@/types';

/**
 * Interface pour les calculs de ventes optimisés (immuable)
 */
interface OptimizedSalesCalculations {
  readonly totalProfit: number;
  readonly totalRevenue: number;
  readonly totalQuantity: number;
  readonly averageProfit: number;
  readonly topProducts: readonly TopProduct[];
  readonly salesByDate: Readonly<Record<string, SalesDateData>>;
}

/**
 * Interface pour les produits les plus vendus (immuable)
 */
interface TopProduct {
  readonly id: string;
  readonly description: string;
  readonly quantity: number;
  readonly revenue: number;
  readonly profit: number;
}

/**
 * Interface pour les données de vente par date (immuable)
 */
interface SalesDateData {
  readonly revenue: number;
  readonly profit: number;
  readonly quantity: number;
  readonly count: number;
}

/**
 * Interface pour les données de produits optimisées (immuable)
 */
interface OptimizedProductData {
  readonly totalValue: number;
  readonly availableProducts: readonly Product[];
  readonly lowStockProducts: readonly Product[];
  readonly outOfStockProducts: readonly Product[];
  readonly totalItems: number;
  readonly categories: Readonly<Record<string, readonly Product[]>>;
}

/**
 * Service d'optimisation des données (fonctions pures avec cache)
 * Implémente la mise en cache, la déduplication et l'optimisation des calculs
 */
class DataOptimizationService {
  private readonly cache = new Map<string, {
    readonly data: unknown;
    readonly timestamp: number;
    readonly ttl: number;
  }>();
  
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Met en cache les données avec TTL (fonction pure)
   */
  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Congeler les données pour garantir l'immutabilité
    const frozenData = this.deepFreeze(data);
    
    this.cache.set(key, Object.freeze({
      data: frozenData,
      timestamp: Date.now(),
      ttl
    }));
  }

  /**
   * Récupère les données du cache si valides (fonction pure)
   */
  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Congèle récursivement un objet pour garantir l'immutabilité
   */
  private deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Object.isFrozen(obj)) {
      return obj;
    }

    // Congeler les propriétés d'abord
    Object.getOwnPropertyNames(obj).forEach(name => {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    });

    return Object.freeze(obj);
  }

  /**
   * Nettoie le cache expiré (fonction pure)
   */
  public cleanExpiredCache(): void {
    const now = Date.now();
    
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Optimise les calculs de ventes avec mémoisation (fonction pure)
   */
  public optimizeSalesCalculations(sales: readonly Sale[]): OptimizedSalesCalculations {
    // Créer une clé de cache basée sur les IDs des ventes
    const cacheKey = `sales-calc-${sales.length}-${this.createSalesCacheKey(sales)}`;
    const cached = this.getCache<OptimizedSalesCalculations>(cacheKey);
    
    if (cached) return cached;

    // Calculs purs sans effets de bord
    const calculations: OptimizedSalesCalculations = Object.freeze({
      totalProfit: sales.reduce((sum, sale) => sum + sale.profit, 0),
      totalRevenue: sales.reduce((sum, sale) => sum + (sale.sellingPrice ), 0),
      totalQuantity: sales.reduce((sum, sale) => sum + sale.quantitySold, 0),
      averageProfit: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.profit, 0) / sales.length : 0,
      topProducts: this.getTopProducts(sales),
      salesByDate: this.groupSalesByDate(sales)
    });

    this.setCache(cacheKey, calculations);
    return calculations;
  }

  /**
   * Crée une clé de cache pour les ventes
   */
  private createSalesCacheKey(sales: readonly Sale[]): string {
    // Utiliser un hash simple basé sur les IDs et profits pour détecter les changements
    return sales
      .map(s => `${s.id}-${s.profit}`)
      .sort()
      .join(',')
      .slice(0, 100); // Limiter la longueur pour éviter les clés trop longues
  }

  /**
   * Groupe les ventes par date pour les graphiques (fonction pure)
   */
  private groupSalesByDate(sales: readonly Sale[]): Readonly<Record<string, SalesDateData>> {
    const grouped = sales.reduce((acc, sale) => {
      const date = new Date(sale.date).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          revenue: 0,
          profit: 0,
          quantity: 0,
          count: 0
        };
      }
      
      acc[date] = {
        revenue: acc[date].revenue + (sale.sellingPrice * sale.quantitySold),
        profit: acc[date].profit + sale.profit,
        quantity: acc[date].quantity + sale.quantitySold,
        count: acc[date].count + 1
      };
      
      return acc;
    }, {} as Record<string, SalesDateData>);

    // Congeler chaque objet de date
    Object.keys(grouped).forEach(date => {
      grouped[date] = Object.freeze(grouped[date]);
    });

    return Object.freeze(grouped);
  }

  /**
   * Obtient les produits les plus vendus (fonction pure)
   */
  private getTopProducts(sales: readonly Sale[]): readonly TopProduct[] {
    const productSales = sales.reduce((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = { 
          quantity: 0, 
          revenue: 0, 
          profit: 0, 
          description: sale.description
        };
      }
      
      acc[sale.productId] = {
        quantity: acc[sale.productId].quantity + sale.quantitySold,
        revenue: acc[sale.productId].revenue + (sale.sellingPrice * sale.quantitySold),
        profit: acc[sale.productId].profit + sale.profit,
        description: acc[sale.productId].description
      };
      
      return acc;
    }, {} as Record<string, { quantity: number; revenue: number; profit: number; description: string }>);

    const topProducts = Object.entries(productSales)
      .map(([id, data]): TopProduct => Object.freeze({
        id,
        description: data.description,
        quantity: data.quantity,
        revenue: data.revenue,
        profit: data.profit
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return Object.freeze(topProducts);
  }

  /**
   * Optimise les données de produits (fonction pure)
   */
  public optimizeProductData(products: readonly Product[]): OptimizedProductData {
    const cacheKey = `products-opt-${products.length}-${this.createProductsCacheKey(products)}`;
    const cached = this.getCache<OptimizedProductData>(cacheKey);
    
    if (cached) return cached;

    const optimized: OptimizedProductData = Object.freeze({
      totalValue: products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0),
      availableProducts: Object.freeze([...products.filter(p => p.quantity > 0)]),
      lowStockProducts: Object.freeze([...products.filter(p => p.quantity > 0 && p.quantity <= 5)]),
      outOfStockProducts: Object.freeze([...products.filter(p => p.quantity === 0)]),
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
      categories: this.categorizeProducts(products)
    });

    this.setCache(cacheKey, optimized);
    return optimized;
  }

  /**
   * Crée une clé de cache pour les produits
   */
  private createProductsCacheKey(products: readonly Product[]): string {
    return products
      .map(p => `${p.id}-${p.quantity}`)
      .sort()
      .join(',')
      .slice(0, 100);
  }

  /**
   * Catégorise les produits par type (fonction pure)
   */
  private categorizeProducts(products: readonly Product[]): Readonly<Record<string, readonly Product[]>> {
    const categories = products.reduce((acc, product) => {
      // Catégorisation simple basée sur les mots-clés de description
      const desc = product.description.toLowerCase();
      let category = 'Autres';
      
      if (desc.includes('perruque')) category = 'Perruques';
      else if (desc.includes('tissage')) category = 'Tissages';
      else if (desc.includes('extension')) category = 'Extensions';
      else if (desc.includes('accessoire')) category = 'Accessoires';
      
      if (!acc[category]) acc[category] = [];
      acc[category] = [...acc[category], product];
      
      return acc;
    }, {} as Record<string, Product[]>);

    // Congeler chaque catégorie et les convertir en readonly
    const readonlyCategories: Record<string, readonly Product[]> = {};
    Object.keys(categories).forEach(category => {
      readonlyCategories[category] = Object.freeze([...categories[category]]);
    });

    return Object.freeze(readonlyCategories);
  }
}

// Instance singleton du service
export const dataOptimizationService = new DataOptimizationService();

/**
 * Hook personnalisé pour les calculs optimisés des ventes (fonction pure)
 */
export const useOptimizedSalesData = (sales: readonly Sale[]): OptimizedSalesCalculations => {
  return useMemo(() => {
    return dataOptimizationService.optimizeSalesCalculations(sales);
  }, [sales]);
};

/**
 * Hook personnalisé pour les données optimisées des produits (fonction pure)
 */
export const useOptimizedProductData = (products: readonly Product[]): OptimizedProductData => {
  return useMemo(() => {
    return dataOptimizationService.optimizeProductData(products);
  }, [products]);
};

// Nettoyage périodique du cache (toutes les 10 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    dataOptimizationService.cleanExpiredCache();
  }, 10 * 60 * 1000);
}
