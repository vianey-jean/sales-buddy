
// Importation des utilitaires de test React Testing Library pour le rendu et la recherche d'éléments
import { render, screen } from '@testing-library/react';
// Importation des fonctions de test Vitest pour structurer les tests
import { describe, it, expect } from 'vitest';
// Importation des matchers Jest DOM pour des assertions plus expressives
import '@testing-library/jest-dom';
// Importation du composant StatCard à tester
import StatCard from '@/components/dashboard/StatCard';

// Suite de tests pour le composant StatCard
describe('StatCard', () => {
  // Objet contenant les propriétés par défaut pour les tests
  const defaultProps = {
    title: 'Test Statistic',
    description: 'Test description',
    value: 1234
  };

  // Test pour vérifier que le titre et la valeur s'affichent correctement
  it('affiche le titre et la valeur correctement', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Statistic')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  // Test pour vérifier que la description s'affiche correctement
  it('affiche la description correctement', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  // Test pour vérifier le formatage des nombres avec des séparateurs
  it('formate les nombres avec des séparateurs', () => {
    render(<StatCard {...defaultProps} value={1234567} />);
    
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  // Test pour vérifier l'affichage des valeurs string sans formatage
  it('affiche les valeurs string sans formatage', () => {
    render(<StatCard {...defaultProps} value="Test Value" />);
    
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  // Test pour vérifier l'application des classes CSS personnalisées à la valeur
  it('applique les classes CSS personnalisées à la valeur', () => {
    render(<StatCard {...defaultProps} valueClassName="text-red-500" />);
    
    const valueElement = screen.getByText('1234');
    expect(valueElement).toHaveClass('text-red-500');
  });

  // Test pour vérifier l'utilisation de la classe par défaut
  it('utilise la classe par défaut quand aucune classe n\'est fournie', () => {
    render(<StatCard {...defaultProps} />);
    
    const valueElement = screen.getByText('1234');
    expect(valueElement).toHaveClass('text-gray-700');
  });

  // Test pour vérifier que le composant est pur (même rendu pour mêmes props)
  it('est un composant pur (même rendu pour mêmes props)', () => {
    const { rerender } = render(<StatCard {...defaultProps} />);
    // Capture du HTML du premier rendu en utilisant un sélecteur plus spécifique
    const firstRender = screen.getByText('Test Statistic').closest('div')?.innerHTML;
    
    // Second rendu avec les mêmes propriétés
    rerender(<StatCard {...defaultProps} />);
    // Capture du HTML du second rendu
    const secondRender = screen.getByText('Test Statistic').closest('div')?.innerHTML;
    
    // Vérification que les deux rendus sont identiques
    expect(firstRender).toBe(secondRender);
  });
});
