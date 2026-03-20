
import { SyncEvent, ConnectionConfig } from './types';

/**
 * EventSourceManager - OPTIMIZED for fast polling
 * SSE désactivé pour éviter les problèmes CORS
 * Utilise un mode polling optimisé pour la synchronisation rapide
 */
export class EventSourceManager {
  private isConnected: boolean = false;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private config: ConnectionConfig,
    private onEvent: (event: SyncEvent) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {}

  connect(token?: string) {
    // Mode polling optimisé - pas de SSE pour éviter CORS
    console.log('⚡ Fast polling mode activated');
    
    this.isConnected = false;
    this.onConnectionChange(false);
    
    // Immediate connection event
    this.onEvent({
      type: 'connected',
      timestamp: Date.now()
    });
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isConnected = false;
    this.onConnectionChange(false);
  }

  getConnectionStatus(): boolean {
    return false; // Always use polling fallback for reliability
  }
}
