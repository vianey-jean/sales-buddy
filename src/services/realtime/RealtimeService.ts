
import { api } from '@/service/api';
import { SyncData, SyncEvent, ConnectionConfig } from './types';
import { EventSourceManager } from './EventSourceManager';
import { DataCacheManager } from './DataCacheManager';

class RealtimeService {
  private eventSourceManager: EventSourceManager;
  private dataCacheManager: DataCacheManager;
  private listeners: Set<(data: Partial<SyncData>) => void> = new Set();
  private syncListeners: Set<(event: SyncEvent) => void> = new Set();
  private lastSyncTime: Date = new Date();
  private isConnected: boolean = false;
  private syncInProgress: boolean = false;

  // OPTIMIZED: Faster sync intervals for real-time performance
  private config: ConnectionConfig = {
    reconnectInterval: 2000,
    maxReconnectAttempts: 10,
    connectionTimeout: 5000,
    fallbackSyncInterval: 10000 // Reduced from 30s to 10s for faster sync
  };

  constructor() {
    this.dataCacheManager = new DataCacheManager();
    this.eventSourceManager = new EventSourceManager(
      this.config,
      this.handleSyncEvent.bind(this),
      this.handleConnectionChange.bind(this)
    );
  }

  private fallbackInterval: ReturnType<typeof setInterval> | null = null;

  private handleConnectionChange(connected: boolean) {
    this.isConnected = connected;
    
    // Démarrer le polling si non connecté
    if (!connected && !this.fallbackInterval) {
      this.startFallbackSync();
    }
  }

  private startFallbackSync() {
    // Éviter les intervalles multiples
    if (this.fallbackInterval) {
      return;
    }
    
    // FAST: Sync initial immédiat
    this.syncCurrentMonthData();
    
    // Polling périodique optimisé
    this.fallbackInterval = setInterval(async () => {
      if (!this.syncInProgress) {
        await this.syncCurrentMonthData();
      }
    }, this.config.fallbackSyncInterval);
  }

  private handleSyncEvent(event: SyncEvent) {
    switch (event.type) {
      case 'data-changed':
        if (event.data && event.data.type && event.data.data) {
          if (this.dataCacheManager.hasDataChanged(event.data.type, event.data.data)) {
            this.lastSyncTime = new Date();
            this.processSyncData(event.data.type, event.data.data);
          }
        }
        break;
      
      case 'force-sync':
        this.lastSyncTime = new Date();
        this.syncCurrentMonthData();
        break;
    }

    this.notifySyncListeners(event);
  }

  private processSyncData(dataType: string, receivedData: any) {
    let syncData: Partial<SyncData> = {};

    switch (dataType) {
      case 'products':
        syncData = { products: receivedData };
        break;
      
      case 'sales':
        const currentMonthSales = this.filterCurrentMonthSales(receivedData);
        syncData = { sales: currentMonthSales };
        break;
      
      case 'pretfamilles':
        syncData = { pretFamilles: receivedData };
        break;
      
      case 'pretproduits':
        syncData = { pretProduits: receivedData };
        break;
        
      case 'depensedumois':
        syncData = { depenses: receivedData };
        break;

      case 'clients':
        syncData = { clients: receivedData };
        break;

      case 'messages':
        syncData = { messages: receivedData };
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

  // Public API methods
  connect(token?: string) {
    this.eventSourceManager.connect(token);
  }

  disconnect() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    this.eventSourceManager.disconnect();
  }

  // OPTIMIZED: Parallel data fetching for ultra-fast loading
  async syncCurrentMonthData(): Promise<SyncData | null> {
    if (this.syncInProgress) {
      return null;
    }

    this.syncInProgress = true;
    const startTime = performance.now();

    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // PARALLEL: Fetch all data simultaneously for fastest loading
      const results = await Promise.allSettled([
        api.get('/api/products'),
        api.get(`/api/sales/by-month?month=${currentMonth}&year=${currentYear}`),
        api.get('/api/pretfamilles'),
        api.get('/api/pretproduits'),
        api.get('/api/depenses/mouvements'),
        api.get('/api/clients'),
        api.get('/api/messages')
      ]);

      const getData = (result: PromiseSettledResult<any>) => 
        result.status === 'fulfilled' ? result.value.data || [] : [];

      const syncData: SyncData = {
        products: getData(results[0]),
        sales: getData(results[1]),
        pretFamilles: getData(results[2]),
        pretProduits: getData(results[3]),
        depenses: getData(results[4]),
        clients: getData(results[5]),
        messages: getData(results[6])
      };

      // Update cache
      this.dataCacheManager.updateCache('products', syncData.products);
      this.dataCacheManager.updateCache('sales', syncData.sales);
      this.dataCacheManager.updateCache('pretfamilles', syncData.pretFamilles);
      this.dataCacheManager.updateCache('pretproduits', syncData.pretProduits);
      this.dataCacheManager.updateCache('depensedumois', syncData.depenses);
      this.dataCacheManager.updateCache('clients', syncData.clients);
      this.dataCacheManager.updateCache('messages', syncData.messages);

      this.lastSyncTime = new Date();
      this.notifyListeners(syncData);
      
      const endTime = performance.now();
      console.log(`⚡ Sync completed in ${Math.round(endTime - startTime)}ms`);
      
      return syncData;
    } catch (error) {
      console.error('❌ Sync error:', error);
      return null;
    } finally {
      this.syncInProgress = false;
    }
  }

  addDataListener(callback: (data: Partial<SyncData>) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  addSyncListener(callback: (event: SyncEvent) => void) {
    this.syncListeners.add(callback);
    return () => {
      this.syncListeners.delete(callback);
    };
  }

  private notifyListeners(data: Partial<SyncData>) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  private notifySyncListeners(event: SyncEvent) {
    this.syncListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }

  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  getConnectionStatus(): boolean {
    return this.eventSourceManager.getConnectionStatus();
  }

  async forceSync(): Promise<void> {
    try {
      await api.post('/api/sync/force-sync');
    } catch (error) {
      console.error('Force sync failed, using local sync');
      await this.syncCurrentMonthData();
    }
  }
}

export const realtimeService = new RealtimeService();
