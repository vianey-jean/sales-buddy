
# Guide d'Optimisation des Performances

## Optimisations Frontend

### Lazy Loading et Code Splitting
```typescript
// Code splitting par route
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const VentesProduits = React.lazy(() => import('./components/dashboard/VentesProduits'));
const Inventaire = React.lazy(() => import('./components/dashboard/Inventaire'));

// Utilisation avec Suspense
<React.Suspense fallback={<ProfessionalLoading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/ventes" element={<VentesProduits />} />
    <Route path="/inventaire" element={<Inventaire />} />
  </Routes>
</React.Suspense>
```

### Mémoïsation des composants
```typescript
// Mémoïsation avec React.memo
const StatCard = React.memo<StatCardProps>(({ title, value, description }) => {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>{value}</CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée si nécessaire
  return prevProps.value === nextProps.value &&
         prevProps.title === nextProps.title;
});

// Mémoïsation des calculs coûteux
const useBusinessCalculations = (sales: readonly Sale[]) => {
  return useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => 
      sum + (sale.sellingPrice * sale.quantitySold), 0
    );
    
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    
    return {
      totalRevenue,
      totalProfit,
      averageMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    };
  }, [sales]);
};

// Mémoïsation des callbacks
const ProductList = ({ products, onUpdate }) => {
  const handleProductUpdate = useCallback((id: string, updates: Partial<Product>) => {
    onUpdate(id, updates);
  }, [onUpdate]);

  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onUpdate={handleProductUpdate}
        />
      ))}
    </div>
  );
};
```

### Optimisation des listes virtualisées
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedSalesList = ({ sales }: { sales: Sale[] }) => {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <SaleItem sale={sales[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={sales.length}
      itemSize={80}
      overscanCount={5}
    >
      {Row}
    </List>
  );
};
```

### Debouncing et throttling
```typescript
// Hook de debouncing
const useDebounce = <T>(value: T, delay: number): T => {
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
};

// Utilisation pour la recherche
const SearchInput = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Rechercher..."
    />
  );
};
```

## Optimisations Backend

### Middleware de compression
```javascript
const compression = require('compression');

// Configuration de compression
app.use(compression({
  level: 6, // Niveau de compression (1-9)
  threshold: 1024, // Taille minimum pour compression
  filter: (req, res) => {
    // Ne pas compresser les images
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### Cache en mémoire
```javascript
const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600, // 10 minutes par défaut
      checkperiod: 120, // Vérification toutes les 2 minutes
      useClones: false // Performance améliorée
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl) {
    return this.cache.set(key, value, ttl);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  // Méthode pour cache avec fonction de récupération
  async getOrSet(key, fetchFunction, ttl = 600) {
    let value = this.get(key);
    
    if (value === undefined) {
      value = await fetchFunction();
      this.set(key, value, ttl);
    }
    
    return value;
  }
}

const cacheService = new CacheService();

// Utilisation dans les routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await cacheService.getOrSet(
      'products_list',
      () => readData('products.json'),
      300 // 5 minutes
    );
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
```

### Optimisation des requêtes
```javascript
// Service optimisé pour les données
class DataService {
  constructor() {
    this.cache = new CacheService();
  }

  // Pagination
  async getProducts(page = 1, limit = 50) {
    const cacheKey = `products_${page}_${limit}`;
    
    return await this.cache.getOrSet(cacheKey, async () => {
      const products = await this.readData('products.json');
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return {
        data: products.slice(start, end),
        total: products.length,
        page,
        totalPages: Math.ceil(products.length / limit)
      };
    });
  }

  // Filtrage optimisé
  async searchProducts(query, filters = {}) {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}`;
    
    return await this.cache.getOrSet(cacheKey, async () => {
      const products = await this.readData('products.json');
      
      return products.filter(product => {
        const matchesQuery = !query || 
          product.description.toLowerCase().includes(query.toLowerCase());
        
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return product[key] === value;
        });
        
        return matchesQuery && matchesFilters;
      });
    });
  }

  // Agrégations optimisées
  async getSalesStats(startDate, endDate) {
    const cacheKey = `sales_stats_${startDate}_${endDate}`;
    
    return await this.cache.getOrSet(cacheKey, async () => {
      const sales = await this.readData('sales.json');
      
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
      });
      
      return {
        totalRevenue: filteredSales.reduce((sum, sale) => 
          sum + (sale.sellingPrice * sale.quantitySold), 0
        ),
        totalProfit: filteredSales.reduce((sum, sale) => sum + sale.profit, 0),
        totalSales: filteredSales.length,
        averageOrderValue: filteredSales.length > 0 ? 
          filteredSales.reduce((sum, sale) => sum + sale.sellingPrice, 0) / filteredSales.length : 0
      };
    }, 180); // Cache 3 minutes pour les stats
  }
}
```

### Pool de connexions et optimisations I/O
```javascript
const fs = require('fs').promises;
const path = require('path');

class OptimizedFileService {
  constructor() {
    this.readQueue = [];
    this.writeQueue = [];
    this.processing = false;
  }

  // Lecture optimisée avec mise en file
  async readData(filename) {
    return new Promise((resolve, reject) => {
      this.readQueue.push({ filename, resolve, reject });
      this.processQueue();
    });
  }

  // Écriture optimisée avec batch
  async writeData(filename, data) {
    return new Promise((resolve, reject) => {
      this.writeQueue.push({ filename, data, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    // Traitement des lectures
    while (this.readQueue.length > 0) {
      const batch = this.readQueue.splice(0, 5); // Traiter par batch de 5
      
      await Promise.all(batch.map(async ({ filename, resolve, reject }) => {
        try {
          const data = await fs.readFile(
            path.join(__dirname, '../data', filename),
            'utf8'
          );
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      }));
    }

    // Traitement des écritures
    while (this.writeQueue.length > 0) {
      const { filename, data, resolve, reject } = this.writeQueue.shift();
      
      try {
        await fs.writeFile(
          path.join(__dirname, '../data', filename),
          JSON.stringify(data, null, 2),
          'utf8'
        );
        resolve(true);
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }
}
```

## Optimisations réseau

### Server-Sent Events optimisés
```javascript
class OptimizedSSEService {
  constructor() {
    this.clients = new Map();
    this.messageQueue = new Map();
    this.flushInterval = 1000; // Flush toutes les secondes
    
    setInterval(() => this.flushMessages(), this.flushInterval);
  }

  addClient(req, res, userId) {
    const clientId = `${userId}_${Date.now()}`;
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Nginx
    });

    this.clients.set(clientId, { res, userId, lastSeen: Date.now() });
    
    // Heartbeat pour détecter les déconnexions
    const heartbeat = setInterval(() => {
      if (this.clients.has(clientId)) {
        try {
          res.write('data: {"type":"heartbeat"}\n\n');
          this.clients.get(clientId).lastSeen = Date.now();
        } catch (error) {
          this.removeClient(clientId);
          clearInterval(heartbeat);
        }
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);

    res.on('close', () => {
      this.removeClient(clientId);
      clearInterval(heartbeat);
    });

    return clientId;
  }

  // Messages en batch pour réduire la charge
  queueMessage(userId, message) {
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }
    this.messageQueue.get(userId).push(message);
  }

  flushMessages() {
    for (const [userId, messages] = this.messageQueue) {
      if (messages.length === 0) continue;

      const clientsForUser = Array.from(this.clients.values())
        .filter(client => client.userId === userId);

      if (clientsForUser.length > 0) {
        const batchMessage = JSON.stringify({
          type: 'batch',
          messages,
          timestamp: Date.now()
        });

        clientsForUser.forEach(client => {
          try {
            client.res.write(`data: ${batchMessage}\n\n`);
          } catch (error) {
            // Client déconnecté
          }
        });
      }

      this.messageQueue.set(userId, []);
    }
  }
}
```

### Optimisation des uploads
```javascript
const multer = require('multer');
const sharp = require('sharp');

// Configuration multer optimisée
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'));
    }
  }
});

// Optimisation d'images
const optimizeImage = async (buffer, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp'
  } = options;

  return await sharp(buffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFormat(format, { quality })
    .toBuffer();
};

// Route d'upload optimisée
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Optimisation de l'image
    const optimizedBuffer = await optimizeImage(req.file.buffer);
    
    // Génération du nom de fichier
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
    const filepath = path.join(__dirname, '../uploads', filename);
    
    // Sauvegarde asynchrone
    await fs.writeFile(filepath, optimizedBuffer);
    
    res.json({
      filename,
      originalSize: req.file.size,
      optimizedSize: optimizedBuffer.length,
      url: `/uploads/${filename}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});
```

## Monitoring des performances

### Métriques de performance
```javascript
const prometheus = require('prom-client');

// Métriques personnalisées
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware de métriques
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
};

// Endpoint des métriques
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});
```

### Health checks avancés
```javascript
class HealthService {
  constructor() {
    this.checks = new Map();
  }

  addCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  async runHealthCheck() {
    const results = {};
    const startTime = Date.now();

    for (const [name, checkFunction] of this.checks) {
      try {
        const checkStart = Date.now();
        const result = await Promise.race([
          checkFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        results[name] = {
          status: 'healthy',
          responseTime: Date.now() - checkStart,
          details: result
        };
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }

    return {
      status: Object.values(results).every(r => r.status === 'healthy') 
        ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      checks: results
    };
  }
}

// Configuration des checks
const healthService = new HealthService();

healthService.addCheck('memory', () => {
  const usage = process.memoryUsage();
  return {
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`
  };
});

healthService.addCheck('database', async () => {
  // Vérification de la connectivité
  const testData = await readData('products.json');
  return { recordCount: testData.length };
});

app.get('/health', async (req, res) => {
  const health = await healthService.runHealthCheck();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

## Configuration de production

### PM2 optimisé
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gestion-commerciale-api',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Optimisations
    kill_timeout: 5000,
    listen_timeout: 8000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Monitoring
    monitoring: false,
    pmx: true
  }]
};
```

### Configuration Nginx optimisée
```nginx
# nginx.conf pour performance
upstream backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    # Cache statique agressif
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        
        # Compression
        gzip_static on;
        brotli_static on;
    }

    # API avec cache court
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Cache pour GET
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_bypass $http_cache_control;
        
        # Timeouts optimisés
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }

    # Buffers optimisés
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}
```
