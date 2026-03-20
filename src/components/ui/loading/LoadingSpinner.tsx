import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeConfig = {
    sm: { container: 'w-12 h-12', logo: 'w-6 h-6', ring: 'w-12 h-12', dots: 'w-1 h-1' },
    md: { container: 'w-20 h-20', logo: 'w-10 h-10', ring: 'w-20 h-20', dots: 'w-1.5 h-1.5' },
    lg: { container: 'w-32 h-32', logo: 'w-16 h-16', ring: 'w-32 h-32', dots: 'w-2 h-2' }
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', config.container, className)}
      role="status"
      aria-label="Chargement..."
    >
      {/* Logo central */}
      <img 
        src="/images/logo.ico" 
        alt="Logo" 
        className={cn('absolute z-10 animate-pulse', config.logo)}
      />
      
      {/* Anneau tournant principal */}
      <div className={cn(
        'absolute rounded-full border-2 border-transparent border-t-primary border-r-primary/50',
        'animate-spin',
        config.ring
      )} style={{ animationDuration: '1s' }} />
      
      {/* Anneau tournant secondaire (sens inverse) */}
      <div className={cn(
        'absolute rounded-full border-2 border-transparent border-b-primary/60 border-l-primary/30',
        'animate-spin',
        config.ring
      )} style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      
      {/* Points orbitaux */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'absolute bg-primary rounded-full animate-spin',
            config.dots
          )}
          style={{
            animationDuration: '2s',
            animationDelay: `${i * 0.5}s`,
            top: '50%',
            left: '50%',
            transform: `rotate(${i * 90}deg) translateX(${size === 'sm' ? '20px' : size === 'md' ? '32px' : '52px'}) translateY(-50%)`
          }}
        />
      ))}
    </div>
  );
};
