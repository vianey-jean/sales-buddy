import { useCallback, useRef } from 'react';

// Luxurious chime notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;

    // Helper to create a rich tone with harmonics
    const playTone = (freq: number, start: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + start);
      gain.gain.setValueAtTime(0, t + start);
      gain.gain.linearRampToValueAtTime(vol, t + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + start + duration);
      osc.start(t + start);
      osc.stop(t + start + duration);
    };

    // Three-note ascending chime (C6 → E6 → G6) — elegant & luxurious
    playTone(1047, 0, 0.35, 0.18);      // C6
    playTone(1319, 0.12, 0.35, 0.15);   // E6
    playTone(1568, 0.24, 0.5, 0.2);     // G6

    // Soft harmonic shimmer on the last note
    playTone(3136, 0.24, 0.4, 0.04);    // G7 (octave above, very soft)
    playTone(2093, 0.24, 0.45, 0.06);   // C7 (fifth shimmer)

    setTimeout(() => ctx.close(), 1200);
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
