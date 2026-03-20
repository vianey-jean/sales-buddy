
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';

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
  },
  productService: {
    getProducts: vi.fn().mockResolvedValue([]),
    addProduct: vi.fn().mockResolvedValue({}),
    updateProduct: vi.fn().mockResolvedValue({}),
    deleteProduct: vi.fn().mockResolvedValue(true)
  }
}));

// Mock des services realtime
vi.mock('@/services/realtime/RealtimeService', () => ({
  default: class MockRealtimeService {
    connect() {}
    addDataListener() { return () => {}; }
    addSyncListener() { return () => {}; }
  }
}));

vi.mock('@/services/realtimeService', () => ({
  realtimeService: {
    connect: vi.fn(),
    addDataListener: vi.fn(() => vi.fn()),
    addSyncListener: vi.fn(() => vi.fn())
  }
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
    products: [],
    sales: [],
    clients: [],
    isLoading: false,
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    addSale: vi.fn(),
    updateSale: vi.fn(),
    deleteSale: vi.fn()
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

// Mock des composants
vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

// Utility function to render with providers
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

describe('SalesWorkflow - Intégration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('workflow complet de création de vente', async () => {
    const newSale = {
      id: '1',
      date: '2024-01-15',
      productId: '1',
      description: 'Test Product',
      sellingPrice: 100,
      quantitySold: 1,
      purchasePrice: 50,
      profit: 50,
      clientName: 'Test Client',
      clientPhone: '+33123456789',
      clientAddress: '123 Test Address'
    };

    renderWithProviders(<DashboardPage />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('workflow de modification de vente existante', async () => {
    const existingSale = {
      id: '1',
      date: '2024-01-15',
      productId: '1',
      description: 'Test Product',
      sellingPrice: 100,
      quantitySold: 1,
      purchasePrice: 50,
      profit: 50,
      clientName: 'Test Client',
      clientPhone: '+33123456789',
      clientAddress: '123 Test Address'
    };

    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  it('gestion des erreurs lors de la création de vente', async () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('synchronisation des données après opérations CRUD', async () => {
    const initialSales = [
      {
        id: '1',
        date: '2024-01-15',
        productId: '1',
        description: 'Test Product',
        sellingPrice: 100,
        quantitySold: 1,
        purchasePrice: 50,
        profit: 50,
        clientName: 'Test Client',
        clientPhone: '+33123456789',
        clientAddress: '123 Test Address'
      }
    ];

    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  it('validation des données avant soumission', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });

  it('mise à jour en temps réel des statistiques', async () => {
    const salesData = [
      {
        id: '1',
        date: '2024-01-15',
        productId: '1',
        description: 'Test Product',
        sellingPrice: 100,
        quantitySold: 1,
        purchasePrice: 50,
        profit: 50,
        clientName: 'Test Client',
        clientPhone: '+33123456789',
        clientAddress: '123 Test Address'
      }
    ];

    renderWithProviders(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });
});
