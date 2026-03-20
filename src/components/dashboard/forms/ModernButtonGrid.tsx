
import React from 'react';
import { cn } from '@/lib/utils';

interface ModernButtonGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const ModernButtonGrid: React.FC<ModernButtonGridProps> = ({ 
  children, 
  columns = 3,
  className 
}) => {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 xs:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6',
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
};

export default ModernButtonGrid;
