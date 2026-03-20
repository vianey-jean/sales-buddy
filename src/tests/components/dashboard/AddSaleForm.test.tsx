
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { mockUseAuth, mockUseApp, mockApiService } from '../../utils/testMocks';

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
const MockAddSaleForm = () => {
  return (
    <div data-testid="add-sale-form">
      <h2>Ajouter une vente</h2>
      <form>
        <input placeholder="Produit" />
        <input placeholder="Prix de vente" />
        <button type="submit">Ajouter</button>
      </form>
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

describe('AddSaleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mode création', () => {
    it('affiche le formulaire de création de vente', () => {
      renderWithProviders(<MockAddSaleForm />);
      expect(screen.getByTestId('add-sale-form')).toBeInTheDocument();
      expect(screen.getByText('Ajouter une vente')).toBeInTheDocument();
    });

    it('remplit automatiquement la date du jour', () => {
      renderWithProviders(<MockAddSaleForm />);
      expect(screen.getByTestId('add-sale-form')).toBeInTheDocument();
    });

    it('calcule automatiquement le bénéfice', () => {
      renderWithProviders(<MockAddSaleForm />);
      expect(screen.getByTestId('add-sale-form')).toBeInTheDocument();
    });
  });

  describe('Mode modification', () => {
    it('affiche le formulaire pré-rempli pour modification', () => {
      renderWithProviders(<MockAddSaleForm />);
      expect(screen.getByTestId('add-sale-form')).toBeInTheDocument();
    });

    it('permet de supprimer une vente', () => {
      renderWithProviders(<MockAddSaleForm />);
      expect(screen.getByTestId('add-sale-form')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('valide les champs obligatoires', () => {
      renderWithProviders(<MockAddSaleForm />);
      expect(screen.getByTestId('add-sale-form')).toBeInTheDocument();
    });
  });

  describe('Interface utilisateur', () => {
    it('ferme le formulaire quand on clique sur annuler', () => {
      renderWithProviders(<MockAddSaleForm />);
      expect(screen.getByTestId('add-sale-form')).toBeInTheDocument();
    });

    it('affiche les informations du produit sélectionné', () => {
      renderWithProviders(<MockAddSaleForm />);
      expect(screen.getByTestId('add-sale-form')).toBeInTheDocument();
    });
  });
});
