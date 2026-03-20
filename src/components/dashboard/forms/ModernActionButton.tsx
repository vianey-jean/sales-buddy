
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernActionButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  icon?: LucideIcon;
  gradient?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo' | 'pink' | 'teal';
  isLoading?: boolean;
  buttonSize?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
}

const ModernActionButton = React.forwardRef<HTMLButtonElement, ModernActionButtonProps>(({
  icon: Icon,
  gradient = 'blue',
  isLoading = false,
  buttonSize = 'md',
  variant = 'solid',
  children,
  className,
  ...props
}, ref) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25',
    green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/25',
    red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-purple-500/25',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25',
    indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-500/25',
    pink: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-pink-500/25',
    teal: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-teal-500/25'
  };

  const outlineClasses = {
    blue: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    green: 'border-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
    red: 'border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
    purple: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    orange: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20',
    indigo: 'border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
    pink: 'border-2 border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20',
    teal: 'border-2 border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Button
      ref={ref}
      size={buttonSize === 'sm' ? 'sm' : buttonSize === 'lg' ? 'lg' : 'default'}
      className={cn(
        'relative overflow-hidden font-semibold transition-all duration-300 transform',
        'hover:shadow-xl hover:scale-105 active:scale-95',
        'before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%]',
        sizeClasses[buttonSize],
        variant === 'solid' ? `${gradientClasses[gradient]} text-white border-0 shadow-lg` :
        variant === 'outline' ? `${outlineClasses[gradient]} bg-transparent shadow-md` :
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
        ) : (
          Icon && <Icon className={cn(iconSizes[buttonSize], "mr-2")} />
        )}
        {children}
      </div>
    </Button>
  );
});

ModernActionButton.displayName = 'ModernActionButton';

export default ModernActionButton;
