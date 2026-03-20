import { useCallback, useRef, useEffect, useMemo, useState } from 'react';

/**
 * Hook de debounce pour optimiser les requêtes
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour créer une fonction debounced
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook pour créer une fonction throttled
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottleRef = useRef(false);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callback(...args);
        inThrottleRef.current = true;
        
        setTimeout(() => {
          inThrottleRef.current = false;
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
            lastArgsRef.current = null;
          }
        }, limit);
      } else {
        lastArgsRef.current = args;
      }
    },
    [callback, limit]
  );

  return throttledCallback;
}

/**
 * Hook de mémoisation profonde
 */
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const prevDepsRef = useRef<React.DependencyList | undefined>(undefined);
  const valueRef = useRef<T | undefined>(undefined);

  const depsChanged = !prevDepsRef.current || 
    deps.some((dep, i) => !Object.is(dep, prevDepsRef.current![i]));

  if (depsChanged) {
    valueRef.current = factory();
    prevDepsRef.current = deps;
  }

  return valueRef.current as T;
}

/**
 * Hook pour la pagination avec mémoisation
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number,
  currentPage: number
): {
  paginatedItems: T[];
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
} {
  return useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      paginatedItems,
      totalPages,
      totalItems,
      startIndex,
      endIndex
    };
  }, [items, itemsPerPage, currentPage]);
}

/**
 * Hook pour le filtrage optimisé
 */
export function useFilteredData<T>(
  items: T[],
  searchQuery: string,
  searchFields: (keyof T)[],
  minChars: number = 3
): T[] {
  return useMemo(() => {
    if (!searchQuery || searchQuery.length < minChars) {
      return items;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      })
    );
  }, [items, searchQuery, searchFields, minChars]);
}

/**
 * Hook pour le tri optimisé
 */
export function useSortedData<T>(
  items: T[],
  sortKey: keyof T | null,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  return useMemo(() => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      let comparison = 0;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [items, sortKey, sortOrder]);
}

/**
 * Hook pour la mise en cache locale
 */
export function useLocalCache<T>(
  key: string,
  initialValue: T,
  expirationMs?: number
): [T, (value: T) => void, () => void] {
  const [cachedValue, setCachedValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (expirationMs && parsed.timestamp) {
          if (Date.now() - parsed.timestamp > expirationMs) {
            localStorage.removeItem(key);
            return initialValue;
          }
        }
        return parsed.value ?? initialValue;
      }
    } catch (error) {
      console.warn('Error reading from cache:', error);
    }
    return initialValue;
  });

  const setValue = useCallback((value: T) => {
    try {
      const item = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
      setCachedValue(value);
    } catch (error) {
      console.warn('Error writing to cache:', error);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setCachedValue(initialValue);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }, [key, initialValue]);

  return [cachedValue, setValue, clearCache];
}

/**
 * Hook pour l'intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
}
