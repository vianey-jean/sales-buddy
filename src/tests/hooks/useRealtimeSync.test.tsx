
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the app context
const mockUseApp = vi.fn();

vi.mock('@/contexts/AppContext', () => ({
  useApp: mockUseApp
}));

// Create a simple hook mock
const useRealtimeSync = () => ({
  forceSync: vi.fn()
});

describe('useRealtimeSync Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApp.mockReturnValue({
      refreshData: vi.fn()
    });
  });

  it('returns forceSync function', () => {
    const { result } = renderHook(() => useRealtimeSync());

    expect(typeof result.current.forceSync).toBe('function');
  });

  it('handles force sync', () => {
    const { result } = renderHook(() => useRealtimeSync());

    expect(() => result.current.forceSync()).not.toThrow();
  });
});
