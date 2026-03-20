
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export function useAutoLogout() {
  const { logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    if (isAuthenticated) {
      timeoutRef.current = window.setTimeout(() => {
        logout();
        toast({
          title: "Session expirée",
          description: "Vous avez été déconnecté en raison d'inactivité",
          variant: "destructive",
        });
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Start the initial timer
    resetTimer();
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });
    
    // Clean up
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, logout]);
}
