
import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAccessibility } from './AccessibilityProvider';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  announceOnClick?: string;
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    ariaLabel, 
    announceOnClick, 
    loading = false, 
    loadingText = "Chargement en cours",
    onClick,
    className,
    disabled,
    ...props 
  }, ref) => {
    const { announceToScreenReader } = useAccessibility();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (announceOnClick) {
        announceToScreenReader(announceOnClick);
      }
      onClick?.(event);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          'hover:shadow-lg transition-all duration-200',
          className
        )}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={loading}
        aria-describedby={loading ? 'loading-description' : undefined}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <>
            <div 
              className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" 
              aria-hidden="true" 
            />
            {loadingText}
            <span id="loading-description" className="sr-only">
              Opération en cours, veuillez patienter
            </span>
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
