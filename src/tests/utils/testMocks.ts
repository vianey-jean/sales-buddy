
import { vi } from 'vitest';

// Mock services créés directement ici pour éviter les problèmes de hoisting
export const mockSalesService = {
  getSales: vi.fn().mockResolvedValue([]),
  addSale: vi.fn().mockResolvedValue({}),
  updateSale: vi.fn().mockResolvedValue({}),
  deleteSale: vi.fn().mockResolvedValue(true)
};

export const mockProductService = {
  getProducts: vi.fn().mockResolvedValue([]),
  addProduct: vi.fn().mockResolvedValue({}),
  updateProduct: vi.fn().mockResolvedValue({}),
  deleteProduct: vi.fn().mockResolvedValue(true)
};

export const mockClientService = {
  getClients: vi.fn().mockResolvedValue([]),
  addClient: vi.fn().mockResolvedValue({}),
  updateClient: vi.fn().mockResolvedValue({}),
  deleteClient: vi.fn().mockResolvedValue(true)
};

export const mockAuthService = {
  login: vi.fn().mockResolvedValue({ token: 'test-token', user: { id: '1', email: 'test@example.com' } }),
  logout: vi.fn(),
  getCurrentUser: vi.fn().mockReturnValue(null),
  register: vi.fn().mockResolvedValue({}),
  resetPassword: vi.fn().mockResolvedValue({}),
  verifyToken: vi.fn().mockReturnValue(true)
};

export const mockUseAuth = vi.fn(() => ({
  user: null,
  isAuthenticated: false,
  login: vi.fn().mockResolvedValue(true),
  logout: vi.fn(),
  register: vi.fn().mockResolvedValue(true),
  resetPassword: vi.fn().mockResolvedValue(true)
}));

export const mockUseApp = vi.fn(() => ({
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
}));

export const mockApiService = {
  salesService: mockSalesService,
  productService: mockProductService,
  clientService: mockClientService,
  authService: mockAuthService
};
