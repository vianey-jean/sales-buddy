
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernButtonProps extends ButtonProps {
  icon?: LucideIcon;
  gradient?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  isLoading?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  icon: Icon,
  gradient = 'blue',
  isLoading = false,
  children,
  className,
  ...props
}) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  };

  return (
    <Button
      className={cn(
        'btn-3d text-white border-0 shadow-lg transition-all duration-200',
        'hover:shadow-xl hover:scale-105 active:scale-95',
        'text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5',
        gradientClasses[gradient],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-1.5 sm:mr-2" />
      ) : (
        Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
      )}
      {children}
    </Button>
  );
};

export default ModernButton;
