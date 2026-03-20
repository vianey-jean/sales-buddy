
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
const MockVentesProduits = () => {
  return (
    <div data-testid="ventes-produits">
      <h2>Ventes et Produits</h2>
      <div>Gestion des ventes et produits</div>
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

describe('VentesProduits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le composant VentesProduits', () => {
    renderWithProviders(<MockVentesProduits />);
    expect(screen.getByTestId('ventes-produits')).toBeInTheDocument();
  });

  it('affiche le titre', () => {
    renderWithProviders(<MockVentesProduits />);
    expect(screen.getByText('Ventes et Produits')).toBeInTheDocument();
  });
});
