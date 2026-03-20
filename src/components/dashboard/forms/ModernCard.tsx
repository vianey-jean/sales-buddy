
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ModernCardProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
  headerActions
}) => {
  return (
    <Card className={`card-3d border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${className}`}>
      {(title || Icon || headerActions) && (
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {Icon && (
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-app-blue to-app-purple text-white shrink-0">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              )}
              {title && (
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {title}
                </CardTitle>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-1.5 sm:space-x-2 w-full xs:w-auto">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default ModernCard;
