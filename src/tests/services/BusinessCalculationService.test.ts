
// Importation des fonctions de test Vitest
import { describe, it, expect } from 'vitest';
// Importation du service de calculs métier à tester
import { BusinessCalculationService } from '@/services/BusinessCalculationService';

// Suite de tests pour le service de calculs métier
describe('BusinessCalculationService', () => {
  // Groupe de tests pour le calcul de bénéfice
  describe('calculateProfit', () => {
    // Test de calcul de bénéfice simple
    it('calcule le bénéfice simple correctement', () => {
      // Appel de la méthode avec des paramètres de test
      const result = BusinessCalculationService.calculateProfit({
        sellingPrice: 150, // Prix de vente
        purchasePrice: 100, // Prix d'achat
        quantity: 1 // Quantité unitaire
      });

      // Vérification du résultat : (150 - 100) * 1 = 50
      expect(result).toBe(50);
    });

    // Test de calcul avec quantité multiple
    it('calcule le bénéfice avec quantité multiple', () => {
      // Appel avec une quantité supérieure à 1
      const result = BusinessCalculationService.calculateProfit({
        sellingPrice: 150, // Prix unitaire de vente
        purchasePrice: 100, // Prix unitaire d'achat
        quantity: 3 // Quantité multiple
      });

      // Vérification : (150 - 100) * 3 = 150
      expect(result).toBe(150);
    });

    // Test de gestion des pertes (bénéfice négatif)
    it('gère les pertes (bénéfice négatif)', () => {
      // Appel avec un prix de vente inférieur au prix d'achat
      const result = BusinessCalculationService.calculateProfit({
        sellingPrice: 80, // Prix de vente bas
        purchasePrice: 100, // Prix d'achat plus élevé
        quantity: 1 // Quantité unitaire
      });

      // Vérification de la perte : (80 - 100) * 1 = -20
      expect(result).toBe(-20);
    });

    // Test avec des prix à zéro
    it('gère les prix à zéro', () => {
      // Appel avec des prix nuls
      const result = BusinessCalculationService.calculateProfit({
        sellingPrice: 0, // Pas de prix de vente
        purchasePrice: 0, // Pas de prix d'achat
        quantity: 5 // Quantité quelconque
      });

      // Vérification : (0 - 0) * 5 = 0
      expect(result).toBe(0);
    });
  });

  // Groupe de tests pour le calcul de marge
  describe('calculateMargin', () => {
    // Test de calcul de marge correct
    it('calcule la marge correctement', () => {
      // Appel de la méthode de calcul de marge
      const result = BusinessCalculationService.calculateMargin({
        profit: 50, // Bénéfice réalisé
        cost: 100 // Coût de base
      });

      // Vérification : (50 / 100) * 100 = 50%
      expect(result).toBe(50);
    });

    // Test de gestion de la division par zéro
    it('gère la division par zéro', () => {
      // Appel avec un coût nul
      const result = BusinessCalculationService.calculateMargin({
        profit: 50, // Bénéfice existant
        cost: 0 // Coût nul (division par zéro)
      });

      // Vérification que le résultat est 0 (gestion de l'erreur)
      expect(result).toBe(0);
    });

    // Test de gestion des marges négatives
    it('gère les marges négatives', () => {
      // Appel avec un bénéfice négatif (perte)
      const result = BusinessCalculationService.calculateMargin({
        profit: -25, // Perte
        cost: 100 // Coût de base
      });

      // Vérification : (-25 / 100) * 100 = -25%
      expect(result).toBe(-25);
    });
  });

  // Groupe de tests pour le calcul du coût total
  describe('calculateTotalCost', () => {
    // Test de calcul avec tous les frais
    it('calcule le coût total avec tous les frais', () => {
      // Appel avec tous les types de frais
      const result = BusinessCalculationService.calculateTotalCost({
        purchasePrice: 100, // Prix d'achat de base
        customsTax: 10, // Droits de douane
        vat: 20, // TVA en pourcentage (20%)
        otherFees: 5 // Autres frais fixes
      });

      // Vérification : 100 + 10 + (100*0.2) + 5 = 135
      expect(result).toBe(135);
    });

    // Test avec des taxes à zéro
    it('gère les taxes à zéro', () => {
      // Appel sans aucune taxe ni frais
      const result = BusinessCalculationService.calculateTotalCost({
        purchasePrice: 100, // Prix de base seulement
        customsTax: 0, // Pas de droits de douane
        vat: 0, // Pas de TVA
        otherFees: 0 // Pas d'autres frais
      });

      // Vérification que seul le prix de base est retourné
      expect(result).toBe(100);
    });
  });

  // Groupe de tests pour le calcul du prix recommandé
  describe('calculateRecommendedPrice', () => {
    // Test de calcul avec marge
    it('calcule le prix recommandé avec marge', () => {
      // Appel avec un coût et une marge souhaitée
      const result = BusinessCalculationService.calculateRecommendedPrice(100, 50);

      // Vérification : 100 * (1 + 50/100) = 150
      expect(result).toBe(150);
    });

    // Test avec marge de 0%
    it('gère une marge de 0%', () => {
      // Appel avec une marge nulle
      const result = BusinessCalculationService.calculateRecommendedPrice(100, 0);

      // Vérification que le prix reste inchangé
      expect(result).toBe(100);
    });
  });

  // Groupe de tests pour les statistiques de ventes
  describe('calculateSalesStatistics', () => {
    // Données de ventes mock pour les tests
    const mockSales = [
      { sellingPrice: 100, purchasePrice: 60, quantity: 2 }, // Première vente
      { sellingPrice: 200, purchasePrice: 120, quantity: 1 } // Seconde vente
    ];

    // Test de calcul des statistiques globales
    it('calcule les statistiques globales', () => {
      // Appel de la méthode avec les ventes mock
      const result = BusinessCalculationService.calculateSalesStatistics(mockSales);

      // Vérification du bénéfice total : (100-60)*2 + (200-120)*1 = 160
      expect(result.totalProfit).toBe(160);
      // Vérification du bénéfice moyen : 160 / 2 = 80
      expect(result.averageProfit).toBe(80);
      // Vérification du chiffre d'affaires total : 100*2 + 200*1 = 400
      expect(result.totalRevenue).toBe(400);
      // Vérification du chiffre d'affaires moyen : 400 / 2 = 200
      expect(result.averageRevenue).toBe(200);
    });

    // Test avec des tableaux vides
    it('gère les tableaux vides', () => {
      // Appel avec un tableau vide
      const result = BusinessCalculationService.calculateSalesStatistics([]);

      // Vérification que tous les totaux sont à zéro
      expect(result.totalProfit).toBe(0);
      expect(result.averageProfit).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.averageRevenue).toBe(0);
    });

    // Test d'immutabilité des résultats
    it('retourne des résultats immuables', () => {
      // Appel de la méthode
      const result = BusinessCalculationService.calculateSalesStatistics(mockSales);

      // Vérification que l'objet retourné est figé
      expect(Object.isFrozen(result)).toBe(true);
    });
  });

  // Groupe de tests pour la validation des données d'entrée
  describe('validateCalculationInput', () => {
    // Test de validation avec des données correctes
    it('valide des données correctes', () => {
      // Appel avec des données valides
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: 100, // Prix de vente positif
        purchasePrice: 60, // Prix d'achat positif
        quantity: 1 // Quantité positive
      });

      // Vérification que la validation réussit
      expect(result).toBe(true);
    });

    // Test de rejet des prix négatifs
    it('rejette les prix négatifs', () => {
      // Appel avec un prix de vente négatif
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: -100, // Prix négatif (invalide)
        purchasePrice: 60, // Prix valide
        quantity: 1 // Quantité valide
      });

      // Vérification que la validation échoue
      expect(result).toBe(false);
    });

    // Test de rejet des quantités nulles ou négatives
    it('rejette les quantités nulles ou négatives', () => {
      // Appel avec une quantité nulle
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: 100, // Prix valide
        purchasePrice: 60, // Prix valide
        quantity: 0 // Quantité nulle (invalide)
      });

      // Vérification que la validation échoue
      expect(result).toBe(false);
    });

    // Test de rejet des valeurs non numériques
    it('rejette les valeurs non numériques', () => {
      // Appel avec une valeur NaN
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: NaN, // Valeur non numérique
        purchasePrice: 60, // Prix valide
        quantity: 1 // Quantité valide
      });

      // Vérification que la validation échoue
      expect(result).toBe(false);
    });

    // Test de rejet des valeurs infinies
    it('rejette les valeurs infinies', () => {
      // Appel avec une valeur infinie
      const result = BusinessCalculationService.validateCalculationInput({
        sellingPrice: Infinity, // Valeur infinie (invalide)
        purchasePrice: 60, // Prix valide
        quantity: 1 // Quantité valide
      });

      // Vérification que la validation échoue
      expect(result).toBe(false);
    });
  });

  // Groupe de tests pour l'immutabilité du service
  describe('immutabilité du service', () => {
    // Test que le service est immuable
    it('le service est immuable', () => {
      // Vérification que l'objet service est figé
      expect(Object.isFrozen(BusinessCalculationService)).toBe(true);
    });

    // Test qu'on ne peut pas modifier le service
    it('ne peut pas être modifié', () => {
      // Tentative d'ajout d'une nouvelle méthode (doit échouer)
      expect(() => {
        (BusinessCalculationService as any).newMethod = () => {};
      }).toThrow(); // Doit lever une erreur car l'objet est figé
    });
  });
});
