
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ClientsPage from '@/pages/ClientsPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';

// Mock des services directement dans vi.mock pour éviter les problèmes de hoisting
vi.mock('@/service/api', () => ({
  default: {
    salesService: {
      getSales: vi.fn().mockResolvedValue([]),
      addSale: vi.fn().mockResolvedValue({}),
      updateSale: vi.fn().mockResolvedValue({}),
      deleteSale: vi.fn().mockResolvedValue(true)
    },
    productService: {
      getProducts: vi.fn().mockResolvedValue([]),
      addProduct: vi.fn().mockResolvedValue({}),
      updateProduct: vi.fn().mockResolvedValue({}),
      deleteProduct: vi.fn().mockResolvedValue(true)
    },
    clientService: {
      getClients: vi.fn().mockResolvedValue([]),
      addClient: vi.fn().mockResolvedValue({}),
      updateClient: vi.fn().mockResolvedValue({}),
      deleteClient: vi.fn().mockResolvedValue(true)
    },
    authService: {
      login: vi.fn().mockResolvedValue({ token: 'test-token', user: { id: '1', email: 'test@example.com' } }),
      logout: vi.fn(),
      getCurrentUser: vi.fn().mockReturnValue(null),
      register: vi.fn().mockResolvedValue({}),
      resetPassword: vi.fn().mockResolvedValue({}),
      verifyToken: vi.fn().mockReturnValue(true)
    }
  }
}));

// Mock du hook useClientSync
vi.mock('@/hooks/useClientSync', () => ({
  useClientSync: vi.fn(() => ({
    clients: [],
    isLoading: false,
    searchClients: vi.fn((query: string) => []),
    refetch: vi.fn()
  }))
}));

// Mock des hooks de messages
vi.mock('@/hooks/use-messages', () => ({
  useMessages: vi.fn(() => ({
    messages: [],
    isLoading: false,
    sendMessage: vi.fn(),
    markAsRead: vi.fn()
  }))
}));

// Mock des services realtime
vi.mock('@/services/realtimeService', () => ({
  realtimeService: {
    connect: vi.fn(),
    addDataListener: vi.fn(() => vi.fn()),
    addSyncListener: vi.fn(() => vi.fn())
  }
}));

// Mock des hooks
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn(),
    register: vi.fn().mockResolvedValue(true),
    resetPassword: vi.fn().mockResolvedValue(true)
  }))
}));

vi.mock('@/contexts/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useApp: vi.fn(() => ({
    clients: [],
    isLoading: false,
    addClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn()
  }))
}));

vi.mock('@/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn()
  }))
}));

vi.mock('@/components/accessibility/AccessibilityProvider', () => ({
  AccessibilityProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAccessibility: vi.fn(() => ({
    announceText: vi.fn(),
    setFocusManagement: vi.fn(),
    isHighContrast: false,
    isReducedMotion: false
  }))
}));

// Mock des composants complexes
vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          {component}
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la page des clients', () => {
    renderWithProviders(<ClientsPage />);
    // Test if the page renders without errors - check for main content
    expect(screen.getByText('Votre Empire Clientèle vous attend')).toBeInTheDocument();
  });

  it('affiche le message quand il n\'y a pas de clients', () => {
    renderWithProviders(<ClientsPage />);
    // Test if empty state message is displayed
    expect(screen.getByText('Votre Empire Clientèle vous attend')).toBeInTheDocument();
    expect(screen.getByText('Créer votre Premier Client Élite')).toBeInTheDocument();
  });
});
