import React, { memo } from 'react';
import PremiumLoading from '@/components/ui/premium-loading';
import { cn } from '@/lib/utils';

export interface LoadingOverlayProps {
  /** Message à afficher pendant le chargement */
  text?: string;
  /** Taille du loader */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Afficher en overlay sur toute la page */
  overlay?: boolean;
  /** Variante de style */
  variant?: 'default' | 'dashboard' | 'tendances' | 'ventes';
  /** Afficher le texte */
  showText?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** Hauteur minimale du container (sans overlay) */
  minHeight?: string;
}

/**
 * Composant de chargement réutilisable
 * Encapsule PremiumLoading avec des options supplémentaires
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = memo(({
  text = "Chargement en cours...",
  size = 'lg',
  overlay = true,
  variant = 'default',
  showText = true,
  className,
  minHeight = '400px'
}) => {
  if (overlay) {
    return (
      <PremiumLoading
        text={text}
        size={size}
        overlay={true}
        variant={variant}
        showText={showText}
      />
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center justify-center w-full",
        className
      )}
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <PremiumLoading
        text={text}
        size={size}
        overlay={false}
        variant={variant}
        showText={showText}
      />
    </div>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export default LoadingOverlay;
