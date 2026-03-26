import { useCallback, useRef } from 'react';

// Facebook-like notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First beep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(830, ctx.currentTime);
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Second beep (higher pitch)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.12);
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.01, ctx.currentTime);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.3);

    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    console.warn('Could not play notification sound:', e);
  }
};

export interface ChatNotification {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
}

export const useChatNotification = () => {
  const notificationsRef = useRef<ChatNotification[]>([]);

  const notify = useCallback((sender: string, message: string) => {
    playNotificationSound();
    
    const notif: ChatNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sender,
      message: message.length > 60 ? message.substring(0, 60) + '...' : message,
      timestamp: Date.now(),
    };
    notificationsRef.current = [...notificationsRef.current, notif];
    
    // Auto-remove after 5s
    setTimeout(() => {
      notificationsRef.current = notificationsRef.current.filter(n => n.id !== notif.id);
    }, 5000);

    return notif;
  }, []);

  const dismiss = useCallback((id: string) => {
    notificationsRef.current = notificationsRef.current.filter(n => n.id !== id);
  }, []);

  return { notify, dismiss, notifications: notificationsRef };
};

export { playNotificationSound };
