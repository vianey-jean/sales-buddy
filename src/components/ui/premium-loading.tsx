import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading';

interface PremiumLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  overlay?: boolean;
  showText?: boolean;
  variant?: 'default' | 'dashboard' | 'tendances' | 'ventes';
}

const PremiumLoading = ({ 
  text = "Gestion Ventes", 
  size = 'md', 
  className = '', 
  overlay = false,
  showText = true,
  variant = 'default'
}: PremiumLoadingProps) => {
  // Convertir la taille pour LoadingSpinner (xl -> lg)
  const spinnerSize = size === 'xl' ? 'lg' : size;

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const variantGradients = {
    default: 'from-purple-600 via-blue-600 to-emerald-600',
    dashboard: 'from-purple-600 via-pink-600 to-blue-600',
    tendances: 'from-emerald-600 via-blue-600 to-purple-600',
    ventes: 'from-green-600 via-emerald-600 to-teal-600'
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Main Loading Container */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <LoadingSpinner size={spinnerSize} />
          
          {/* Loading Text */}
          {showText && (
            <div className="text-center space-y-2">
              <h3 className={cn(
                "font-bold bg-gradient-to-r bg-clip-text text-transparent animate-pulse",
                textSizeClasses[size],
                variantGradients[variant]
              )}>
                {text}
              </h3>
              <div className="flex space-x-1 justify-center">
                <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)}></div>
                <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)} style={{ animationDelay: '0.1s' }}></div>
                <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)} style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col justify-center items-center p-8", className)}>
      <div className="relative flex flex-col items-center space-y-6">
        <LoadingSpinner size={spinnerSize} />
        
        {/* Loading Text */}
        {showText && (
          <div className="text-center space-y-2">
            <h3 className={cn(
              "font-bold bg-gradient-to-r bg-clip-text text-transparent animate-pulse",
              textSizeClasses[size],
              variantGradients[variant]
            )}>
              {text}
            </h3>
            <div className="flex space-x-1 justify-center">
              <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)}></div>
              <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)} style={{ animationDelay: '0.1s' }}></div>
              <div className={cn("w-2 h-2 rounded-full animate-bounce", `bg-gradient-to-r ${variantGradients[variant]}`)} style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumLoading;
