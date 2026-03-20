import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner, LoadingDots, LoadingSkeleton } from '@/components/ui/loading';

interface ProfessionalLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  overlay?: boolean;
  className?: string;
  progress?: number; // 0-100 pour une barre de progression
}

const ProfessionalLoading: React.FC<ProfessionalLoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  overlay = false,
  className,
  progress
}) => {
  // Convertir la taille pour les composants de loading (xl -> lg)
  const loadingSize = size === 'xl' ? 'lg' : size;

  const renderLoadingElement = () => {
    switch (variant) {
      case 'spinner':
        return <LoadingSpinner size={loadingSize} />;

      case 'dots':
        return <LoadingDots size={loadingSize} />;

      case 'pulse':
        return <LoadingSpinner size={loadingSize} />;

      case 'skeleton':
        return <LoadingSkeleton variant="card" count={3} />;

      default:
        return <LoadingSpinner size={loadingSize} />;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      className
    )}>
      {renderLoadingElement()}
      
      {text && (
        <p className="text-sm text-muted-foreground font-medium" aria-live="polite">
          {text}
        </p>
      )}
      
      {typeof progress === 'number' && (
        <div className="w-full max-w-xs">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progression: ${progress}%`}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {progress}%
          </p>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Chargement en cours"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default ProfessionalLoading;
