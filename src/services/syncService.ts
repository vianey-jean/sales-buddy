
import { realtimeService } from './realtimeService';

export interface SyncData {
  products: any[];
  sales: any[];
  pretFamilles: any[];
  pretProduits: any[];
  depenses: any[];
}

// Réexporter le service temps réel pour compatibilité
export const syncService = realtimeService;

// Export par défaut
export default realtimeService;
