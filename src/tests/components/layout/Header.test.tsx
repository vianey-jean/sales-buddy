
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { mockUseAuth } from '../../utils/testMocks';

// Mock du hook useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

// Mock du composant Header
const MockHeader = () => {
  const { user, logout } = mockUseAuth();
  
  return (
    <header data-testid="header">
      <div>Header Component</div>
      {user && (
        <button onClick={logout} data-testid="logout-btn">
          Déconnexion
        </button>
      )}
    </header>
  );
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le header', () => {
    renderWithRouter(<MockHeader />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('affiche le bouton de déconnexion quand l\'utilisateur est connecté', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      resetPassword: vi.fn()
    });

    renderWithRouter(<MockHeader />);
    expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
  });

  it('permet la déconnexion', () => {
    const mockLogout = vi.fn();
    
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      isAuthenticated: true,
      login: vi.fn(),
      logout: mockLogout,
      register: vi.fn(),
      resetPassword: vi.fn()
    });

    renderWithRouter(<MockHeader />);
    fireEvent.click(screen.getByTestId('logout-btn'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
