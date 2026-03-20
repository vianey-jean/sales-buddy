
// Export the new modular realtime service
export { realtimeService } from './realtime/RealtimeService';
export type { SyncData, SyncEvent } from './realtime/types';

// For backward compatibility
import { realtimeService } from './realtime/RealtimeService';
export default realtimeService;
