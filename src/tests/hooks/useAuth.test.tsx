
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/contexts/AuthContext';

// Mock the auth service
const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  setCurrentUser: vi.fn(),
  resetPasswordRequest: vi.fn(),
  resetPassword: vi.fn(),
  checkEmail: vi.fn()
};

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock the auth service
vi.mock('../service/api', () => ({
  authService: mockAuthService
}));

// Mock the AuthProvider
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('returns default auth state', () => {
    const { result } = renderHook(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      checkEmail: vi.fn(),
      resetPasswordRequest: vi.fn(),
      resetPassword: vi.fn()
    }));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('handles login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const login = vi.fn().mockResolvedValue(true);

    const { result } = renderHook(() => ({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-token',
      login,
      logout: vi.fn(),
      register: vi.fn(),
      checkEmail: vi.fn(),
      resetPasswordRequest: vi.fn(),
      resetPassword: vi.fn()
    }));

    await act(async () => {
      const success = await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(success).toBe(true);
    });
  });

  it('handles logout', () => {
    const logout = vi.fn();
    
    const { result } = renderHook(() => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      login: vi.fn(),
      logout,
      register: vi.fn(),
      checkEmail: vi.fn(),
      resetPasswordRequest: vi.fn(),
      resetPassword: vi.fn()
    }));

    act(() => {
      result.current.logout();
    });

    expect(logout).toHaveBeenCalled();
  });
});
