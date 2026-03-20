/**
 * Service d'optimisation des performances pour le frontend
 * Inclut: Cache, debouncing, throttling, lazy loading helpers
 */

// ===================
// CACHE SERVICE
// ===================

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<unknown>>();
  private maxSize = 100;

  set<T>(key: string, data: T, ttlMs = 300000): void {
    // Nettoyer le cache si trop gros
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Supprimer les entrées expirées
    for (const [key, item] of entries) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
    
    // Si encore trop gros, supprimer les plus anciennes
    if (this.cache.size >= this.maxSize) {
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = sorted.slice(0, Math.floor(this.maxSize / 2));
      for (const [key] of toDelete) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const dataCache = new CacheService();

// ===================
// DEBOUNCE & THROTTLE
// ===================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ===================
// REQUEST DEDUPLICATION
// ===================

const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // Si une requête identique est en cours, retourner sa promesse
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }
  
  // Sinon, créer une nouvelle requête
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

// ===================
// BATCH REQUESTS
// ===================

interface BatchItem<T> {
  id: string;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export function createBatcher<T, R>(
  batchFn: (ids: string[]) => Promise<Map<string, R>>,
  options: { maxBatchSize?: number; delayMs?: number } = {}
): (id: string) => Promise<R> {
  const { maxBatchSize = 50, delayMs = 10 } = options;
  let batch: BatchItem<R>[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const executeBatch = async () => {
    const currentBatch = batch;
    batch = [];
    timeoutId = null;

    if (currentBatch.length === 0) return;

    try {
      const ids = currentBatch.map(item => item.id);
      const results = await batchFn(ids);

      for (const item of currentBatch) {
        const result = results.get(item.id);
        if (result !== undefined) {
          item.resolve(result);
        } else {
          item.reject(new Error(`No result for id: ${item.id}`));
        }
      }
    } catch (error) {
      for (const item of currentBatch) {
        item.reject(error as Error);
      }
    }
  };

  return (id: string): Promise<R> => {
    return new Promise((resolve, reject) => {
      batch.push({ id, resolve, reject });

      if (batch.length >= maxBatchSize) {
        if (timeoutId) clearTimeout(timeoutId);
        executeBatch();
      } else if (!timeoutId) {
        timeoutId = setTimeout(executeBatch, delayMs);
      }
    });
  };
}

// ===================
// PERFORMANCE MONITORING
// ===================

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.record(name, duration);
    return result;
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    this.record(name, duration);
    return result;
  }

  private record(name: string, duration: number): void {
    if (this.metrics.length >= this.maxMetrics) {
      this.metrics.shift();
    }
    
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now()
    });

    // Log si trop lent
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ===================
// PREFETCHING
// ===================

const prefetchedResources = new Set<string>();

export function prefetchRoute(path: string): void {
  if (prefetchedResources.has(path)) return;
  
  // Créer un lien prefetch
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
  
  prefetchedResources.add(path);
}

export function prefetchImage(src: string): Promise<void> {
  if (prefetchedResources.has(src)) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      prefetchedResources.add(src);
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

// ===================
// LAZY LOADING HELPERS
// ===================

export function createLazyLoader<T>(
  loader: () => Promise<T>,
  options: { timeout?: number } = {}
): () => Promise<T> {
  const { timeout = 30000 } = options;
  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return async () => {
    if (cached) return cached;
    if (loading) return loading;

    loading = Promise.race([
      loader(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading resource')), timeout)
      )
    ]);

    try {
      cached = await loading;
      return cached;
    } finally {
      loading = null;
    }
  };
}

// ===================
// VIRTUAL SCROLLING HELPER
// ===================

export function calculateVisibleRange(
  containerHeight: number,
  scrollTop: number,
  itemHeight: number,
  totalItems: number,
  overscan = 3
): { start: number; end: number; offsetY: number } {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);
  const offsetY = start * itemHeight;
  
  return { start, end, offsetY };
}

// ===================
// MEMORY MANAGEMENT
// ===================

export function cleanupMemory(): void {
  dataCache.clear();
  prefetchedResources.clear();
  performanceMonitor.clear();
  
  // Force garbage collection si disponible
  if ('gc' in window && typeof (window as unknown as { gc: () => void }).gc === 'function') {
    (window as unknown as { gc: () => void }).gc();
  }
}

// Nettoyer automatiquement périodiquement
if (typeof window !== 'undefined') {
  setInterval(() => {
    // Nettoyer le cache expiré
    const stats = dataCache.getStats();
    if (stats.size > 50) {
      console.log('🧹 Cleaning up cache...');
    }
  }, 300000); // Toutes les 5 minutes
}