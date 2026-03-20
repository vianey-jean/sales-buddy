
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeStatusProps {
  isConnected?: boolean;
  lastSync?: Date;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  isConnected = true,
  lastSync
}) => {
  const [syncTime, setSyncTime] = useState<string>('');

  useEffect(() => {
    if (lastSync) {
      const updateTime = () => {
        const now = new Date();
        const diff = now.getTime() - lastSync.getTime();
        const seconds = Math.floor(diff / 1000);
        
        if (seconds < 60) {
          setSyncTime(`${seconds}s`);
        } else {
          const minutes = Math.floor(seconds / 60);
          setSyncTime(`${minutes}m`);
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [lastSync]);

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center gap-1 text-xs"
    >
      {isConnected ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {isConnected ? 'Sync' : 'Hors ligne'}
      {syncTime && <span>({syncTime})</span>}
    </Badge>
  );
};
