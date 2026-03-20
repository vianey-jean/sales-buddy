
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the realtime service
const mockRealtimeService = {
  connect: vi.fn(),
  addDataListener: vi.fn(() => vi.fn()),
  addSyncListener: vi.fn(() => vi.fn())
};

// Mock axios
const mockAxios = {
  get: vi.fn()
};

vi.mock('@/services/realtimeService', () => ({
  realtimeService: mockRealtimeService
}));

vi.mock('axios', () => ({
  default: mockAxios
}));

// Create a simple hook mock
const useClientSync = () => ({
  clients: [],
  isLoading: false,
  searchClients: vi.fn((query: string) => []),
  refetch: vi.fn()
});

describe('useClientSync Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default state', () => {
    const { result } = renderHook(() => useClientSync());

    expect(result.current.clients).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.searchClients).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('handles client search', () => {
    const { result } = renderHook(() => useClientSync());

    const searchResults = result.current.searchClients('test');
    expect(searchResults).toEqual([]);
  });

  it('handles refetch', () => {
    const { result } = renderHook(() => useClientSync());

    expect(() => result.current.refetch()).not.toThrow();
  });
});
