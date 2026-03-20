import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'text' | 'avatar';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-muted/50 via-muted to-muted/50 animate-gradientShift">
            <div className="h-4 w-3/4 bg-gradient-to-r from-muted-foreground/10 via-muted-foreground/20 to-muted-foreground/10 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gradient-to-r from-muted-foreground/10 via-muted-foreground/20 to-muted-foreground/10 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
            <div className="h-8 w-full bg-gradient-to-r from-muted-foreground/10 via-muted-foreground/20 to-muted-foreground/10 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        );
      
      case 'table':
        return (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="h-8 w-full bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-2">
            <div className="h-4 w-full bg-gradient-to-r from-muted-foreground/10 via-muted-foreground/20 to-muted-foreground/10 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gradient-to-r from-muted-foreground/10 via-muted-foreground/20 to-muted-foreground/10 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
          </div>
        );
      
      case 'avatar':
        return (
          <div className="relative h-12 w-12 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-gradientShift" />
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          </div>
        );
      
      default:
        return <div className="h-4 w-full bg-gradient-to-r from-muted-foreground/10 via-muted-foreground/20 to-muted-foreground/10 rounded animate-pulse" />;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn('animate-fadeIn')} style={{ animationDelay: `${i * 0.1}s` }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};
