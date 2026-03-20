import { useMemo } from 'react';
import { Sale } from '@/types';

export interface YearlyStats {
  year: number;
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  salesCount: number;
  quantitySold: number;
}

export interface MonthlyStats {
  key: string;
  month: string;
  monthNum: number;
  revenue: number;
  profit: number;
  cost: number;
  salesCount: number;
  quantity: number;
}

// Calcul des valeurs d'une vente (supporte les deux formats)
export const getSaleValues = (sale: Sale) => {
  // Format multi-produits
  if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
    const revenue = sale.totalSellingPrice || sale.products.reduce((sum, p) => sum + (p.sellingPrice * p.quantitySold), 0);
    const cost = sale.totalPurchasePrice || sale.products.reduce((sum, p) => sum + (p.purchasePrice * p.quantitySold), 0);
    const profit = sale.totalProfit || sale.products.reduce((sum, p) => sum + p.profit, 0);
    const quantity = sale.products.reduce((sum, p) => sum + p.quantitySold, 0);
    return { revenue, cost, profit, quantity };
  }
  // Format single-produit
  else if (sale.sellingPrice !== undefined) {
    const revenue = sale.sellingPrice || 0;
    const cost = sale.purchasePrice || 0;
    const profit = sale.profit || 0;
    const quantity = sale.quantitySold || 0;
    return { revenue, cost, profit, quantity };
  }
  return { revenue: 0, cost: 0, profit: 0, quantity: 0 };
};

// Filtrer les ventes par année
export const filterSalesByYear = (sales: Sale[], year: number): Sale[] => {
  return sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getFullYear() === year;
  });
};

// Filtrer les ventes par mois et année
export const filterSalesByMonthYear = (sales: Sale[], month: number, year: number): Sale[] => {
  return sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() + 1 === month && saleDate.getFullYear() === year;
  });
};

// Hook principal pour les données annuelles
export const useYearlyData = (allSales: Sale[]) => {
  const currentYear = new Date().getFullYear();

  // Ventes de l'année en cours uniquement
  const currentYearSales = useMemo(() => {
    return filterSalesByYear(allSales, currentYear);
  }, [allSales, currentYear]);

  // Statistiques mensuelles de l'année en cours
  const currentYearMonthlyStats = useMemo(() => {
    const monthlyData = new Map<string, MonthlyStats>();

    currentYearSales.forEach(sale => {
      const date = new Date(sale.date);
      const monthNum = date.getMonth() + 1;
      const monthKey = `${currentYear}-${String(monthNum).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          key: monthKey,
          month: monthName,
          monthNum,
          revenue: 0,
          profit: 0,
          cost: 0,
          salesCount: 0,
          quantity: 0
        });
      }

      const data = monthlyData.get(monthKey)!;
      const saleValues = getSaleValues(sale);

      data.revenue += saleValues.revenue;
      data.profit += saleValues.profit;
      data.cost += saleValues.cost;
      data.quantity += saleValues.quantity;
      data.salesCount += 1;
    });

    // Trier par mois
    return Array.from(monthlyData.values()).sort((a, b) => a.monthNum - b.monthNum);
  }, [currentYearSales, currentYear]);

  // Statistiques totales de l'année en cours
  const currentYearTotals = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalCost = 0;
    let totalQuantity = 0;

    currentYearSales.forEach(sale => {
      const values = getSaleValues(sale);
      totalRevenue += values.revenue;
      totalProfit += values.profit;
      totalCost += values.cost;
      totalQuantity += values.quantity;
    });

    return {
      revenue: totalRevenue,
      profit: totalProfit,
      cost: totalCost,
      quantity: totalQuantity,
      salesCount: currentYearSales.length
    };
  }, [currentYearSales]);

  // Statistiques par année (toutes les années)
  const allYearsStats = useMemo(() => {
    const yearlyData = new Map<number, YearlyStats>();

    allSales.forEach(sale => {
      const date = new Date(sale.date);
      const year = date.getFullYear();

      if (!yearlyData.has(year)) {
        yearlyData.set(year, {
          year,
          totalRevenue: 0,
          totalProfit: 0,
          totalCost: 0,
          salesCount: 0,
          quantitySold: 0
        });
      }

      const data = yearlyData.get(year)!;
      const saleValues = getSaleValues(sale);

      data.totalRevenue += saleValues.revenue;
      data.totalProfit += saleValues.profit;
      data.totalCost += saleValues.cost;
      data.quantitySold += saleValues.quantity;
      data.salesCount += 1;
    });

    return Array.from(yearlyData.values()).sort((a, b) => a.year - b.year);
  }, [allSales]);

  // Comparaison avec l'année précédente
  const yearComparison = useMemo(() => {
    const prevYear = currentYear - 1;
    const currentStats = allYearsStats.find(s => s.year === currentYear);
    const prevStats = allYearsStats.find(s => s.year === prevYear);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current: currentStats || { year: currentYear, totalRevenue: 0, totalProfit: 0, totalCost: 0, salesCount: 0, quantitySold: 0 },
      previous: prevStats || { year: prevYear, totalRevenue: 0, totalProfit: 0, totalCost: 0, salesCount: 0, quantitySold: 0 },
      revenueChange: calculateChange(currentStats?.totalRevenue || 0, prevStats?.totalRevenue || 0),
      profitChange: calculateChange(currentStats?.totalProfit || 0, prevStats?.totalProfit || 0),
      salesCountChange: calculateChange(currentStats?.salesCount || 0, prevStats?.salesCount || 0)
    };
  }, [allYearsStats, currentYear]);

  // Identifier la meilleure et pire année
  const bestAndWorstYears = useMemo(() => {
    if (allYearsStats.length === 0) {
      return { bestRevenue: null, worstRevenue: null, bestProfit: null, worstProfit: null };
    }

    const sortedByRevenue = [...allYearsStats].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const sortedByProfit = [...allYearsStats].sort((a, b) => b.totalProfit - a.totalProfit);

    return {
      bestRevenue: sortedByRevenue[0],
      worstRevenue: sortedByRevenue[sortedByRevenue.length - 1],
      bestProfit: sortedByProfit[0],
      worstProfit: sortedByProfit[sortedByProfit.length - 1]
    };
  }, [allYearsStats]);

  return {
    currentYear,
    currentYearSales,
    currentYearMonthlyStats,
    currentYearTotals,
    allYearsStats,
    yearComparison,
    bestAndWorstYears
  };
};

export default useYearlyData;
