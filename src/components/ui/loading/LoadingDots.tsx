import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn('flex space-x-2', className)} role="status" aria-label="Chargement...">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full relative',
            sizeClasses[size]
          )}
        >
          {/* Gradient background animé */}
          <div 
            className={cn(
              'absolute inset-0 rounded-full bg-gradient-to-r from-primary via-primary/60 to-primary',
              'animate-pulse'
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.2s'
            }}
          />
          {/* Effet de brillance */}
          <div 
            className={cn(
              'absolute inset-0 rounded-full bg-primary/50',
              'animate-ping'
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.5s'
            }}
          />
        </div>
      ))}
    </div>
  );
};
