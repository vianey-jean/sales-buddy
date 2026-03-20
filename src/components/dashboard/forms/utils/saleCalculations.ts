
export const calculateSaleProfit = (priceUnit: string, quantity: string, purchasePriceUnit: string): string => {
  if (purchasePriceUnit && priceUnit && quantity) {
    const A = Number(purchasePriceUnit) * Number(quantity);
    const V = Number(priceUnit) * Number(quantity);
    const B = V - A;
    return B.toFixed(2);
  }
  return '0.00';
};

export const calculateTotalPurchasePrice = (purchasePriceUnit: number, quantity: number): number => {
  return purchasePriceUnit * quantity;
};

export const calculateTotalSellingPrice = (sellingPriceUnit: number, quantity: number): number => {
  return sellingPriceUnit * quantity;
};

export const calculateProfit = (totalSellingPrice: number, totalPurchasePrice: number): number => {
  return totalSellingPrice - totalPurchasePrice;
};
