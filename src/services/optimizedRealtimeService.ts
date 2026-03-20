import { api } from '@/service/api';
import { dataOptimizationService } from './dataOptimizationService';

export interface SyncData {
  products: any[];
  sales: any[];
  pretFamilles: any[];
  pretProduits: any[];
  depenses: any[];
}

interface SyncEvent {
  type: 'data-changed' | 'force-sync' | 'connected' | 'heartbeat';
  data?: any;
  timestamp: number;
}

interface PerformanceMetrics {
  connectionTime: number;
  lastSyncDuration: number;
  reconnectAttempts: number;
  dataTransferSize: number;
}

class OptimizedRealtimeService {
  private eventSource: EventSource | null = null;
  private listeners: Set<(data: Partial<SyncData>) => void> = new Set();
  private syncListeners: Set<(event: SyncEvent) => void> = new Set();
  private lastSyncTime: Date = new Date();
  private isConnected: boolean = false;
  private reconnectInterval: number = 3000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private performanceMetrics: PerformanceMetrics;
  private retryDelays = [1000, 2000, 4000, 8000, 16000];

  constructor() {
    this.performanceMetrics = {
      connectionTime: 0,
      lastSyncDuration: 0,
      reconnectAttempts: 0,
      dataTransferSize: 0
    };
    
    this.setupEventListeners();
    this.startPerformanceMonitoring();
  }

  private setupEventListeners() {
    // Gestion réseau optimisée
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    window.addEventListener('beforeunload', this.disconnect.bind(this));
    window.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Nettoyage périodique du cache
    setInterval(() => {
      dataOptimizationService.cleanExpiredCache();
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  private handleOnline() {
    console.log('🌐 Connexion Internet rétablie');
    this.connect();
  }

  private handleOffline() {
    console.log('🌐 Connexion Internet perdue');
    this.disconnect();
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      // Réduire la fréquence des mises à jour quand l'onglet n'est pas visible
      this.pauseRealtime();
    } else {
      // Reprendre les mises à jour normales
      this.resumeRealtime();
    }
  }

  private pauseRealtime() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  private resumeRealtime() {
    this.startHeartbeat();
    // Forcer une synchronisation pour récupérer les données manquées
    this.syncCurrentMonthData();
  }

  private startPerformanceMonitoring() {
    // Monitor des performances toutes les minutes
    setInterval(() => {
      this.logPerformanceMetrics();
    }, 60000);
  }

  private logPerformanceMetrics() {
    console.log('📊 Métriques de performance:', {
      ...this.performanceMetrics,
      isConnected: this.isConnected,
      cacheSize: dataOptimizationService['cache'].size
    });
  }

  connect(token?: string) {
    const startTime = performance.now();
    
    if (this.eventSource) {
      this.eventSource.close();
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }

    console.log('🔌 Connexion SSE optimisée...');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
      const url = `${baseUrl}/api/sync/events`;
      
      this.eventSource = new EventSource(url, {
        withCredentials: false
      });

      this.connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.log('⏱️ Timeout de connexion SSE');
          this.handleConnectionError();
        }
      }, 10000);

      this.eventSource.onopen = () => {
        const connectionTime = performance.now() - startTime;
        this.performanceMetrics.connectionTime = connectionTime;
        
        console.log(`✅ Connexion SSE établie en ${connectionTime.toFixed(2)}ms`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }
        
        this.startHeartbeat();
        this.notifySyncListeners({
          type: 'connected',
          timestamp: Date.now()
        });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.performanceMetrics.dataTransferSize += event.data.length;
          this.handleSyncEvent('data-changed', data);
        } catch (error) {
          console.error('❌ Erreur parsing SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Erreur SSE:', error);
        this.handleConnectionError();
      };

      // Écouter les événements personnalisés
      ['data-changed', 'force-sync', 'connected', 'heartbeat'].forEach(eventType => {
        this.eventSource?.addEventListener(eventType, (event: any) => {
          try {
            const data = JSON.parse(event.data);
            this.handleSyncEvent(eventType as any, data);
          } catch (error) {
            console.error(`❌ Erreur parsing ${eventType}:`, error);
          }
        });
      });

    } catch (error) {
      console.error('❌ Erreur création EventSource:', error);
      this.handleConnectionError();
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        // Envoyer un ping pour maintenir la connexion
        this.ping();
      }
    }, 30000); // Toutes les 30 secondes
  }

  private ping() {
    // Simple ping pour maintenir la connexion active
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sync/ping`, {
      method: 'HEAD'
    }).catch(() => {
      // Ignorer les erreurs de ping, c'est juste pour maintenir la connexion
    });
  }

  private handleConnectionError() {
    this.isConnected = false;
    this.performanceMetrics.reconnectAttempts++;
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Reconnexion avec backoff exponentiel
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.retryDelays[Math.min(this.reconnectAttempts, this.retryDelays.length - 1)];
      
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect();
      }, delay);
    } else {
      console.log('❌ Nombre maximum de tentatives de reconnexion atteint');
      this.startFallbackSync();
    }
  }

  private startFallbackSync() {
    console.log('🔄 Mode de secours activé');
    const fallbackInterval = setInterval(async () => {
      if (!this.isConnected) {
        await this.syncCurrentMonthData();
      } else {
        clearInterval(fallbackInterval);
      }
    }, 60000); // Toutes les minutes en mode de secours
  }

  disconnect() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.isConnected = false;
    console.log('🔌 Connexion SSE fermée proprement');
  }

  private handleSyncEvent(type: SyncEvent['type'], data: any) {
    const startTime = performance.now();
    
    const event: SyncEvent = {
      type,
      data,
      timestamp: Date.now()
    };

    switch (type) {
      case 'data-changed':
        if (data && data.type && data.data) {
          this.processSyncData(data.type, data.data);
        }
        break;
      
      case 'force-sync':
        this.syncCurrentMonthData();
        break;
        
      case 'heartbeat':
        // Répondre au heartbeat pour maintenir la connexion
        break;
    }

    this.performanceMetrics.lastSyncDuration = performance.now() - startTime;
    this.notifySyncListeners(event);
  }

  private processSyncData(dataType: string, receivedData: any) {
    const syncData: Partial<SyncData> = {};

    switch (dataType) {
      case 'products':
        syncData.products = receivedData;
        break;
      
      case 'sales':
        const currentMonthSales = this.filterCurrentMonthSales(receivedData);
        syncData.sales = currentMonthSales;
        break;
      
      case 'pretfamilles':
        syncData.pretFamilles = receivedData;
        break;
      
      case 'pretproduits':
        syncData.pretProduits = receivedData;
        break;
        
      case 'depensedumois':
        syncData.depenses = receivedData;
        break;
    }

    if (Object.keys(syncData).length > 0) {
      this.notifyListeners(syncData);
    }
  }

  private filterCurrentMonthSales(sales: any[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
  }

  async syncCurrentMonthData(): Promise<SyncData | null> {
    const startTime = performance.now();
    
    try {
      console.log('🔄 Synchronisation optimisée des données...');
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Requêtes parallèles avec gestion d'erreur individuelle - Correction des URLs avec préfixe /api/
      const [products, sales, pretFamilles, pretProduits, depenses] = await Promise.allSettled([
        api.get('/api/products'),
        api.get(`/api/sales/by-month?month=${currentMonth}&year=${currentYear}`),
        api.get('/api/pretfamilles'),
        api.get('/api/pretproduits'),
        api.get('/api/depenses/mouvements')
      ]);

      const syncData: SyncData = {
        products: products.status === 'fulfilled' ? products.value.data : [],
        sales: sales.status === 'fulfilled' ? sales.value.data : [],
        pretFamilles: pretFamilles.status === 'fulfilled' ? pretFamilles.value.data : [],
        pretProduits: pretProduits.status === 'fulfilled' ? pretProduits.value.data : [],
        depenses: depenses.status === 'fulfilled' ? depenses.value.data : []
      };

      this.lastSyncTime = new Date();
      this.performanceMetrics.lastSyncDuration = performance.now() - startTime;
      
      this.notifyListeners(syncData);
      
      console.log(`✅ Synchronisation terminée en ${this.performanceMetrics.lastSyncDuration.toFixed(2)}ms`);
      return syncData;
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
      return null;
    }
  }

  addDataListener(callback: (data: Partial<SyncData>) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  addSyncListener(callback: (event: SyncEvent) => void) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  private notifyListeners(data: Partial<SyncData>) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans listener de données:', error);
      }
    });
  }

  private notifySyncListeners(event: SyncEvent) {
    this.syncListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ Erreur dans listener d\'événement:', error);
      }
    });
  }

  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  async forceSync(): Promise<void> {
    try {
      console.log('🚀 Force sync optimisée');
      await api.post('/api/sync/force-sync');
    } catch (error) {
      console.error('❌ Erreur force sync:', error);
      await this.syncCurrentMonthData();
    }
  }
}

export const optimizedRealtimeService = new OptimizedRealtimeService();
