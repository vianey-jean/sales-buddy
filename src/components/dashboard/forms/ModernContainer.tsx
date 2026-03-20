
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernContainerProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  gradient?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo' | 'pink' | 'neutral';
}

const ModernContainer: React.FC<ModernContainerProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
  headerActions,
  gradient = 'neutral'
}) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-900/10 dark:via-gray-900 dark:to-blue-900/10 border-blue-200 dark:border-blue-800/50',
    green: 'bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-900/10 dark:via-gray-900 dark:to-green-900/10 border-green-200 dark:border-green-800/50',
    red: 'bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900/10 dark:via-gray-900 dark:to-red-900/10 border-red-200 dark:border-red-800/50',
    purple: 'bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-purple-900/10 dark:via-gray-900 dark:to-purple-900/10 border-purple-200 dark:border-purple-800/50',
    orange: 'bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-orange-900/10 dark:via-gray-900 dark:to-orange-900/10 border-orange-200 dark:border-orange-800/50',
    indigo: 'bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-indigo-900/10 dark:via-gray-900 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-800/50',
    pink: 'bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-pink-900/10 dark:via-gray-900 dark:to-pink-900/10 border-pink-200 dark:border-pink-800/50',
    neutral: 'bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700'
  };

  const iconGradients = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    red: 'bg-gradient-to-br from-red-500 to-red-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    pink: 'bg-gradient-to-br from-pink-500 to-pink-600',
    neutral: 'bg-gradient-to-br from-gray-500 to-gray-600'
  };

  return (
    <Card className={cn(
      'relative overflow-hidden shadow-xl border-0 transition-all duration-300 hover:shadow-2xl hover:translate-y-[-2px]',
      gradientClasses[gradient],
      className
    )}>
      {/* Effet de brillance subtile */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {(title || Icon || headerActions) && (
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {Icon && (
                <div className={cn(
                  'p-3 rounded-xl text-white shadow-lg',
                  iconGradients[gradient]
                )}>
                  <Icon className="h-6 w-6" />
                </div>
              )}
              {title && (
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {title}
                </CardTitle>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-3">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="relative z-10 pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default ModernContainer;
