
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SSEOptions {
  onData?: (event: string, data: any) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export const useSSE = (url: string, options: SSEOptions = {}) => {
  const {
    onData,
    onError,
    onConnect,
    onDisconnect,
    autoReconnect = true,
    reconnectInterval = 3000
  } = options;

  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = () => {
    if (!token) return;

    try {
      const eventSource = new EventSource(`${url}?token=${token}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);
          onData?.(event.type || 'message', data);
        } catch (error) {
          console.error('Erreur parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setIsConnected(false);
        onError?.(error);
        onDisconnect?.();

        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Tentative de reconnexion SSE...');
            connect();
          }, reconnectInterval);
        }
      };

      // Écouter les événements personnalisés
      ['data-changed', 'force-sync', 'connected'].forEach(eventType => {
        eventSource.addEventListener(eventType, (event: any) => {
          try {
            const data = JSON.parse(event.data);
            setLastEvent(data);
            onData?.(eventType, data);
          } catch (error) {
            console.error(`Erreur parsing ${eventType} data:`, error);
          }
        });
      });

    } catch (error) {
      console.error('Erreur création EventSource:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, url]);

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect
  };
};
