import React, { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatBadgeProps {
  /** Icône à afficher */
  icon?: LucideIcon;
  /** Texte ou valeur à afficher */
  children: ReactNode;
  /** Variante de couleur */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Taille */
  size?: 'sm' | 'md' | 'lg';
  /** Classes CSS additionnelles */
  className?: string;
}

const variantStyles = {
  default: 'bg-white/10 border-white/20 text-white',
  success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100',
  warning: 'bg-amber-500/20 border-amber-500/30 text-amber-100',
  danger: 'bg-red-500/20 border-red-500/30 text-red-100',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-100'
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg',
  lg: 'px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6 sm:w-7 sm:h-7',
  lg: 'w-7 h-7 sm:w-8 sm:h-8'
};

/**
 * Badge de statistique réutilisable
 * Utilisé dans les sections hero pour afficher des compteurs
 */
const StatBadge: React.FC<StatBadgeProps> = memo(({
  icon: Icon,
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  return (
    <div className={cn(
      "backdrop-blur-md rounded-xl sm:rounded-2xl border shadow-2xl",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      <div className="flex items-center gap-2 sm:gap-3">
        {Icon && <Icon className={cn("shrink-0", iconSizes[size])} />}
        <span className="font-bold">{children}</span>
      </div>
    </div>
  );
});

StatBadge.displayName = 'StatBadge';

export default StatBadge;
