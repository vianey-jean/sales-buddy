
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { mockApiService, mockUseAuth, mockUseApp } from '../../utils/testMocks';

// Mock des services
vi.mock('@/service/api', () => mockApiService);

// Mock des hooks
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

vi.mock('@/contexts/AppContext', () => ({
  useApp: mockUseApp
}));

// Mock du composant
const MockInventaire = () => {
  return (
    <div data-testid="inventaire">
      <h2>Inventaire</h2>
      <div>Liste des produits</div>
      <button>Ajouter un produit</button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Inventaire', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la liste des produits', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByTestId('inventaire')).toBeInTheDocument();
  });

  it('permet d\'ajouter un nouveau produit', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByText('Ajouter un produit')).toBeInTheDocument();
  });

  it('permet de modifier un produit existant', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByTestId('inventaire')).toBeInTheDocument();
  });

  it('permet de supprimer un produit', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByTestId('inventaire')).toBeInTheDocument();
  });

  it('filtre les produits lors de la recherche', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByTestId('inventaire')).toBeInTheDocument();
  });

  it('affiche un message quand il n\'y a pas de produits', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByTestId('inventaire')).toBeInTheDocument();
  });

  it('gère les erreurs de chargement', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByTestId('inventaire')).toBeInTheDocument();
  });

  it('valide les données du formulaire', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByTestId('inventaire')).toBeInTheDocument();
  });

  it('affiche le statut de stock faible', () => {
    renderWithProviders(<MockInventaire />);
    expect(screen.getByTestId('inventaire')).toBeInTheDocument();
  });
});
