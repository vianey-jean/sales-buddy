
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorBoundaryContextType {
  errors: ErrorInfo[];
  reportError: (error: Error, context?: string, severity?: ErrorInfo['severity']) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | undefined>(undefined);

export const useErrorBoundary = () => {
  const context = useContext(ErrorBoundaryContext);
  if (!context) {
    throw new Error('useErrorBoundary must be used within ErrorBoundaryProvider');
  }
  return context;
};

export const ErrorBoundaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const { toast } = useToast();

  const reportError = useCallback((
    error: Error, 
    context?: string, 
    severity: ErrorInfo['severity'] = 'medium'
  ) => {
    const errorInfo: ErrorInfo = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context,
      severity
    };

    setErrors(prev => [...prev, errorInfo]);

    // Afficher un toast selon la gravité
    if (severity === 'high' || severity === 'critical') {
      toast({
        title: 'Erreur détectée',
        description: error.message,
        variant: 'destructive', className: "notification-erreur",
      });
    }

    // Logger l'erreur pour le debugging
    console.error('Error reported:', errorInfo);

    // En production, envoyer à un service de monitoring
    if (import.meta.env.PROD) {
      // Ici on pourrait envoyer à Sentry, LogRocket, etc.
    }
  }, [toast]);

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorBoundaryContext.Provider value={{ 
      errors, 
      reportError, 
      clearError, 
      clearAllErrors 
    }}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
};

// Hook pour gérer les erreurs async de manière élégante
export const useAsyncError = () => {
  const { reportError } = useErrorBoundary();

  return useCallback(<T,>(
    asyncFn: () => Promise<T>,
    context?: string,
    fallback?: T
  ): Promise<T | undefined> => {
    return asyncFn().catch((error) => {
      reportError(error as Error, context, 'medium');
      return fallback;
    });
  }, [reportError]);
};
