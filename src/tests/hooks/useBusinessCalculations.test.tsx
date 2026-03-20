
// Importation de renderHook pour tester les hooks React
import { renderHook } from '@testing-library/react';
// Importation des fonctions de test Vitest
import { describe, it, expect } from 'vitest';
// Importation du hook à tester
import { useBusinessCalculations } from '@/hooks/useBusinessCalculations';
// Importation du type Sale pour typer les données de test
import { Sale } from '@/types';

// Suite de tests pour le hook useBusinessCalculations
describe('useBusinessCalculations', () => {
  // Données de ventes mock pour les tests - tableau immutable
  const mockSales: readonly Sale[] = Object.freeze([
    // Première vente figée - Produit 1
    Object.freeze({
      id: '1', // Identifiant unique de la vente
      date: '2024-01-15', // Date de la vente
      productId: 'p1', // Identifiant du produit vendu
      description: 'Produit 1', // Description du produit
      sellingPrice: 100, // Prix de vente unitaire
      quantitySold: 2, // Quantité vendue
      purchasePrice: 60, // Prix d'achat unitaire
      profit: 80 // Bénéfice total calculé
    }),
    // Seconde vente figée - Produit 2
    Object.freeze({
      id: '2', // Identifiant unique de la vente
      date: '2024-01-16', // Date de la vente (jour suivant)
      productId: 'p2', // Identifiant du produit vendu
      description: 'Produit 2', // Description du produit
      sellingPrice: 200, // Prix de vente unitaire plus élevé
      quantitySold: 1, // Quantité vendue (une seule unité)
      purchasePrice: 120, // Prix d'achat unitaire
      profit: 80 // Bénéfice total calculé
    })
  ] as const); // Assertion de constante pour l'immutabilité

  // Test des calculs de statistiques de vente
  it('calcule les statistiques de vente correctement', () => {
    // Rendu du hook avec les données de ventes mock
    const { result } = renderHook(() => useBusinessCalculations(mockSales));

    // Vérification du chiffre d'affaires total : (100*2) + (200*1) = 400
    expect(result.current.totalRevenue).toBe(400);
    // Vérification du bénéfice total : 80 + 80 = 160
    expect(result.current.totalProfit).toBe(160);
    // Vérification de la quantité totale : 2 + 1 = 3
    expect(result.current.totalQuantity).toBe(3);
    // Vérification du bénéfice moyen : 160 / 2 = 80
    expect(result.current.averageProfit).toBe(80);
  });

  // Test du calcul de la marge moyenne
  it('calcule la marge moyenne correctement', () => {
    // Rendu du hook avec les données de test
    const { result } = renderHook(() => useBusinessCalculations(mockSales));

    // Vérification de la marge : (profit / revenue) * 100 = (160 / 400) * 100 = 40%
    expect(result.current.averageMargin).toBe(40);
  });

  // Test de la mémoïsation pour optimiser les performances
  it('recalcule uniquement quand les données changent (mémoïsation)', () => {
    // Rendu initial du hook avec les props passées
    const { result, rerender } = renderHook(
      ({ sales }) => useBusinessCalculations(sales),
      { initialProps: { sales: mockSales } }
    );

    // Capture du premier résultat de calcul
    const firstCalculation = result.current;
    // Re-rendu avec la même référence de données
    rerender({ sales: mockSales });
    
    // Vérification que l'objet retourné est exactement le même (mémoïsation)
    expect(result.current).toBe(firstCalculation);
  });

  // Test de recalcul lors de changements de données réels
  it('recalcule quand les données changent réellement', () => {
    // Rendu initial avec les données de base
    const { result, rerender } = renderHook(
      ({ sales }) => useBusinessCalculations(sales),
      { initialProps: { sales: mockSales } }
    );

    // Capture du calcul initial
    const firstCalculation = result.current;
    
    // Création d'un nouveau tableau avec une vente supplémentaire
    const newSales = [...mockSales, Object.freeze({
      id: '3', // Nouveau identifiant
      date: '2024-01-17', // Date ultérieure
      productId: 'p3', // Nouveau produit
      description: 'Produit 3', // Description du nouveau produit
      sellingPrice: 150, // Prix de vente
      quantitySold: 1, // Quantité vendue
      purchasePrice: 100, // Prix d'achat
      profit: 50 // Bénéfice calculé
    } as const)];
    
    // Re-rendu avec les nouvelles données
    rerender({ sales: newSales });
    
    // Vérification que l'objet a changé (nouveau calcul)
    expect(result.current).not.toBe(firstCalculation);
    // Vérification du nouveau chiffre d'affaires : 400 + 150 = 550
    expect(result.current.totalRevenue).toBe(550);
  });

  // Test de gestion des tableaux vides
  it('gère les tableaux vides', () => {
    // Rendu du hook avec un tableau vide
    const { result } = renderHook(() => useBusinessCalculations([]));

    // Vérification que tous les totaux sont à zéro
    expect(result.current.totalRevenue).toBe(0);
    expect(result.current.totalProfit).toBe(0);
    expect(result.current.totalQuantity).toBe(0);
    expect(result.current.averageProfit).toBe(0);
    expect(result.current.averageMargin).toBe(0);
  });

  // Test de gestion d'un seul élément
  it('gère les cas avec un seul élément', () => {
    // Utilisation uniquement de la première vente
    const singleSale = [mockSales[0]];
    // Rendu du hook avec une seule vente
    const { result } = renderHook(() => useBusinessCalculations(singleSale));

    // Vérification du chiffre d'affaires : 100 * 2 = 200
    expect(result.current.totalRevenue).toBe(200);
    // Vérification du bénéfice total
    expect(result.current.totalProfit).toBe(80);
    // Vérification du bénéfice moyen (égal au total avec un seul élément)
    expect(result.current.averageProfit).toBe(80);
    // Vérification de la marge : (80 / 200) * 100 = 40%
    expect(result.current.averageMargin).toBe(40);
  });

  // Test d'immutabilité des résultats
  it('produit des résultats immuables', () => {
    // Rendu du hook avec les données de test
    const { result } = renderHook(() => useBusinessCalculations(mockSales));

    // Tentative de modification du résultat (doit lever une erreur)
    expect(() => {
      // Tentative de modification d'une propriété
      (result.current as any).totalRevenue = 999;
    }).toThrow(); // L'objet doit être figé et lever une erreur
  });
});
