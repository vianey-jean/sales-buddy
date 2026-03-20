# Guide d'Optimisation des Performances

## Cache et Debouncing

```typescript
import { dataCache, debounce, throttle } from '@/lib/performance';

// Cache des données (5 min TTL)
dataCache.set('products', data, 300000);
const cached = dataCache.get('products');

// Debounce pour recherche
const search = debounce((q) => fetchResults(q), 300);

// Throttle pour scroll
const onScroll = throttle(() => updatePos(), 100);
```

## Lazy Loading

Toutes les pages utilisent `React.lazy()` pour le code splitting automatique.

## Monitoring

```typescript
import { performanceMonitor } from '@/lib/performance';

await performanceMonitor.measureAsync('api-call', () => api.get('/data'));
console.log(performanceMonitor.getAverageTime('api-call'));
```

Voir `docs/PERFORMANCE_OLD.md` pour la documentation détaillée originale.

*Mise à jour: 22 décembre 2025*
