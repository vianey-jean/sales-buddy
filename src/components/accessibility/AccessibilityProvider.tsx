
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true
  });

  const [ariaLiveRegion, setAriaLiveRegion] = useState<string>('');
  const announcementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnnouncementRef = useRef<string>('');

  useEffect(() => {
    // Load saved preferences - run once on mount
    try {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => {
          // Only update if actually different
          if (JSON.stringify(prev) !== JSON.stringify(parsedSettings)) {
            return parsedSettings;
          }
          return prev;
        });
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error);
    }

    // Detect system preferences
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      setSettings(prev => {
        const newSettings = { ...prev };
        let changed = false;
        
        if (prefersReducedMotion && !prev.reducedMotion) {
          newSettings.reducedMotion = true;
          changed = true;
        }
        if (prefersHighContrast && !prev.highContrast) {
          newSettings.highContrast = true;
          changed = true;
        }
        
        return changed ? newSettings : prev;
      });
    } catch (error) {
      console.warn('Failed to detect system preferences:', error);
    }
  }, []); // Empty dependency - only run once

  useEffect(() => {
    // Save preferences and apply CSS classes
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }

    // Apply CSS classes
    const root = document.documentElement;
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('large-text', settings.largeText);
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.classList.toggle('screen-reader-mode', settings.screenReaderMode);
  }, [settings]);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => {
      // Only update if value actually changed
      if (prev[key] === value) {
        return prev;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    // Prevent duplicate announcements
    if (message === lastAnnouncementRef.current) {
      return;
    }
    
    lastAnnouncementRef.current = message;
    
    // Clear any pending timeout
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }
    
    setAriaLiveRegion(message);
    
    announcementTimeoutRef.current = setTimeout(() => {
      setAriaLiveRegion('');
      lastAnnouncementRef.current = '';
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, announceToScreenReader }}>
      {children}
      {/* ARIA Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {ariaLiveRegion}
      </div>
    </AccessibilityContext.Provider>
  );
};
