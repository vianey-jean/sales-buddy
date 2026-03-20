/**
 * =============================================================================
 * useTendancesData - Hook de données pour la page Tendances
 * =============================================================================
 * 
 * Centralise toute la logique de calcul des données de tendances :
 * - Filtrage des ventes (exclusion des avances)
 * - Calcul des totaux (revenus, bénéfices, quantités)
 * - Analyse par produit, catégorie, mois, client
 * - Recommandations d'achat (ROI)
 * - Analyse du stock critique
 * - Ventes quotidiennes du mois en cours
 * 
 * @module useTendancesData
 */

import { useMemo } from 'react';

// ============================================================================
// Fonctions utilitaires
// ============================================================================

/** Détermine la catégorie d'un produit. Avances exclues (null). */
export const getProductCategory = (description: string | undefined | null): string | null => {
  if (!description || typeof description !== 'string') return null;
  const desc = description.toLowerCase();
  if (desc.includes('avance')) return null;
  if (desc.includes('tissage')) return 'Tissages';
  if (desc.includes('perruque')) return 'Perruques';
  if (desc.includes('colle') || desc.includes('disolvant')) return 'Accessoires';
  return 'Autres';
};

/** Calcule les valeurs financières d'une vente (multi-produit ou single). */
export const getSaleValues = (sale: any) => {
  if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
    let revenue = 0, quantity = 0, profit = 0;
    sale.products.filter((p: any) => getProductCategory(p.description) !== null).forEach((product: any) => {
      revenue += product.sellingPrice;
      quantity += product.quantitySold;
      profit += product.profit || 0;
    });
    return { revenue, quantity, profit };
  }
  if (sale.sellingPrice !== undefined && sale.quantitySold !== undefined) {
    return { revenue: sale.sellingPrice, quantity: sale.quantitySold, profit: sale.profit || 0 };
  }
  return { revenue: 0, quantity: 0, profit: 0 };
};

// ============================================================================
// Hook principal
// ============================================================================

export const useTendancesData = (allSales: any[], products: any[]) => {
  /** Ventes filtrées (sans avances) */
  const filteredSales = useMemo(() => {
    return allSales.filter(sale => {
      if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
        return sale.products.some((product: any) => getProductCategory(product.description) !== null);
      }
      return getProductCategory(sale.description) !== null;
    });
  }, [allSales]);

  /** Analyse du stock critique */
  const stockAnalysis = useMemo(() => {
    const lowStockProducts = products.filter(product => product.quantity <= 10);
    const recommendations = lowStockProducts.map(product => {
      const productSales = filteredSales.filter(sale => {
        if (sale.products && Array.isArray(sale.products)) {
          return sale.products.some((p: any) => p.productId === product.id);
        }
        return sale.productId === product.id;
      });
      let totalSold = 0, totalProfit = 0;
      productSales.forEach(sale => {
        if (sale.products && Array.isArray(sale.products)) {
          sale.products.filter((p: any) => p.productId === product.id).forEach((p: any) => {
            totalSold += p.quantitySold;
            totalProfit += p.profit || 0;
          });
        } else if (sale.productId === product.id) {
          totalSold += sale.quantitySold;
          totalProfit += sale.profit || 0;
        }
      });
      const averageProfit = productSales.length > 0 ? totalProfit / productSales.length : 0;
      return { ...product, currentStock: product.quantity, totalSold, averageProfit, priority: product.quantity <= 2 ? 'URGENT' : product.quantity <= 5 ? 'ÉLEVÉE' : 'MOYENNE' };
    }).sort((a, b) => b.averageProfit - a.averageProfit);
    return { recommendations };
  }, [products, filteredSales]);

  /** Ventes quotidiennes du mois en cours */
  const dailySalesAnalysis = useMemo(() => {
    const dailySales: Record<number, any> = {};
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    filteredSales.forEach(sale => {
      const date = new Date(sale.date);
      const day = date.getDate();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthKey === currentMonthKey) {
        if (!dailySales[day]) dailySales[day] = { jour: day, ventes: 0, benefice: 0, quantite: 0 };
        const v = getSaleValues(sale);
        dailySales[day].ventes += v.revenue;
        dailySales[day].benefice += v.profit;
        dailySales[day].quantite += v.quantity;
      }
    });
    return Object.values(dailySales).sort((a, b) => a.jour - b.jour);
  }, [filteredSales]);

  /** Ventes par produit (top 15) */
  const salesByProduct = useMemo(() => {
    const productSales: Record<string, any> = {};
    filteredSales.forEach(sale => {
      const processSale = (description: string, sellingPrice: number, quantitySold: number, profit: number, purchasePrice: number) => {
        const category = getProductCategory(description);
        if (!category) return;
        const productName = description.length > 50 ? description.substring(0, 47) + '...' : description;
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, fullName: description, ventes: 0, benefice: 0, quantite: 0, prixAchat: 0, category, count: 0 };
        }
        productSales[productName].ventes += sellingPrice * quantitySold;
        productSales[productName].benefice += profit;
        productSales[productName].quantite += quantitySold;
        productSales[productName].prixAchat += purchasePrice * quantitySold;
        productSales[productName].count += 1;
      };
      if (sale.products && Array.isArray(sale.products)) {
        sale.products.forEach((p: any) => processSale(p.description, p.sellingPrice, p.quantitySold, p.profit || 0, p.purchasePrice || 0));
      } else {
        processSale(sale.description, sale.sellingPrice, sale.quantitySold, sale.profit || 0, sale.purchasePrice);
      }
    });
    return Object.values(productSales).sort((a: any, b: any) => b.benefice - a.benefice).slice(0, 15);
  }, [filteredSales]);

  /** Ventes par catégorie */
  const salesByCategory = useMemo(() => {
    const categorySales: Record<string, any> = {};
    filteredSales.forEach(sale => {
      const processProduct = (description: string, sellingPrice: number, quantitySold: number, profit: number) => {
        const category = getProductCategory(description);
        if (!category) return;
        if (!categorySales[category]) categorySales[category] = { category, ventes: 0, benefice: 0, quantite: 0, count: 0 };
        categorySales[category].ventes += sellingPrice * quantitySold;
        categorySales[category].benefice += profit;
        categorySales[category].quantite += quantitySold;
        categorySales[category].count += 1;
      };
      if (sale.products && Array.isArray(sale.products)) {
        sale.products.forEach((p: any) => processProduct(p.description, p.sellingPrice, p.quantitySold, p.profit || 0));
      } else {
        processProduct(sale.description, sale.sellingPrice, sale.quantitySold, sale.profit || 0);
      }
    });
    return Object.values(categorySales);
  }, [filteredSales]);

  /** Données temporelles par mois */
  const salesOverTime = useMemo(() => {
    const monthlySales: Record<string, any> = {};
    filteredSales.forEach(sale => {
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
      if (!monthlySales[monthKey]) monthlySales[monthKey] = { mois: monthKey, monthName, ventes: 0, benefice: 0, quantite: 0 };
      const v = getSaleValues(sale);
      monthlySales[monthKey].ventes += v.revenue;
      monthlySales[monthKey].benefice += v.profit;
      monthlySales[monthKey].quantite += v.quantity;
    });
    return Object.values(monthlySales).sort((a: any, b: any) => a.mois.localeCompare(b.mois));
  }, [filteredSales]);

  /** Totaux globaux */
  const salesData = useMemo(() => {
    let totalRevenue = 0, totalQuantity = 0, totalProfit = 0;
    filteredSales.forEach(sale => {
      const v = getSaleValues(sale);
      totalRevenue += v.revenue;
      totalQuantity += v.quantity;
      totalProfit += v.profit;
    });
    return { totals: { revenue: totalRevenue, quantity: totalQuantity, sales: filteredSales.length, profit: totalProfit } };
  }, [filteredSales]);

  /** Top 10 produits les plus rentables */
  const topProfitableProducts = useMemo(() => {
    return salesByProduct.filter((p: any) => p.benefice > 0).sort((a: any, b: any) => b.benefice - a.benefice).slice(0, 10);
  }, [salesByProduct]);

  /** Recommandations d'achat par ROI (top 12) */
  const buyingRecommendations = useMemo(() => {
    return salesByProduct
      .filter((p: any) => p.benefice > 30 && p.prixAchat > 0)
      .sort((a: any, b: any) => (b.benefice / b.prixAchat) - (a.benefice / a.prixAchat))
      .slice(0, 12)
      .map((product: any) => ({
        ...product,
        roi: ((product.benefice / product.prixAchat) * 100).toFixed(1),
        avgProfit: (product.benefice / product.count).toFixed(2),
      }));
  }, [salesByProduct]);

  /** Analyse des clients - classement par CA */
  const clientsData = useMemo(() => {
    const clients: Record<string, { name: string; totalSpent: number; totalProfit: number; purchaseCount: number; lastPurchase: string; sales: any[] }> = {};
    filteredSales.forEach(sale => {
      const name = sale.clientName?.trim();
      if (!name) return;
      const values = getSaleValues(sale);
      if (!clients[name]) {
        clients[name] = { name, totalSpent: 0, totalProfit: 0, purchaseCount: 0, lastPurchase: '', sales: [] };
      }
      clients[name].totalSpent += values.revenue;
      clients[name].totalProfit += values.profit;
      clients[name].purchaseCount += 1;
      clients[name].sales.push(sale);
      const saleDate = new Date(sale.date).toISOString().split('T')[0];
      if (!clients[name].lastPurchase || saleDate > clients[name].lastPurchase) {
        clients[name].lastPurchase = saleDate;
      }
    });
    return Object.values(clients)
      .map(c => ({
        ...c,
        avgBasket: c.purchaseCount > 0 ? c.totalSpent / c.purchaseCount : 0,
        lastPurchase: c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString('fr-FR') : 'N/A',
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [filteredSales]);

  return {
    filteredSales,
    stockAnalysis,
    dailySalesAnalysis,
    salesByProduct,
    salesByCategory,
    salesOverTime,
    salesData,
    topProfitableProducts,
    buyingRecommendations,
    clientsData,
  };
};
