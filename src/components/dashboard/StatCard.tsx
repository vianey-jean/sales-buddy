
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Crown, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Composant de carte statistique premium réutilisable 
 * Design moderne et luxueux pour le tableau de bord
 * 
 * @param title - Titre principal de la carte
 * @param description - Description secondaire sous le titre
 * @param value - Valeur principale à afficher (peut être formatée)
 * @param valueClassName - Classes CSS à appliquer à la valeur
 * @param icon - Icône optionnelle à afficher
 * @param gradient - Couleur du gradient (purple, blue, green, rose, amber)
 */
interface StatCardProps {
  title: string;
  description: string;
  value: React.ReactNode;
  valueClassName?: string;
  icon?: React.ReactNode;
  gradient?: 'purple' | 'blue' | 'green' | 'rose' | 'amber' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  description, 
  value, 
  valueClassName = "text-gray-700 dark:text-gray-200",
  icon,
  gradient = 'purple'
}) => {
  const gradientClasses = {
    purple: 'from-purple-500/10 via-pink-500/5 to-purple-500/10 hover:from-purple-500/20 hover:to-pink-500/20',
    blue: 'from-blue-500/10 via-cyan-500/5 to-blue-500/10 hover:from-blue-500/20 hover:to-cyan-500/20',
    green: 'from-emerald-500/10 via-teal-500/5 to-emerald-500/10 hover:from-emerald-500/20 hover:to-teal-500/20',
    rose: 'from-rose-500/10 via-pink-500/5 to-rose-500/10 hover:from-rose-500/20 hover:to-pink-500/20',
    amber: 'from-amber-500/10 via-yellow-500/5 to-amber-500/10 hover:from-amber-500/20 hover:to-yellow-500/20',
    indigo: 'from-indigo-500/10 via-violet-500/5 to-indigo-500/10 hover:from-indigo-500/20 hover:to-violet-500/20'
  };

  const borderClasses = {
    purple: 'border-purple-200/50 dark:border-purple-700/30',
    blue: 'border-blue-200/50 dark:border-blue-700/30',
    green: 'border-emerald-200/50 dark:border-emerald-700/30',
    rose: 'border-rose-200/50 dark:border-rose-700/30',
    amber: 'border-amber-200/50 dark:border-amber-700/30',
    indigo: 'border-indigo-200/50 dark:border-indigo-700/30'
  };

  return (
    <Card className={cn(
      'card-3d relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl',
      'bg-gradient-to-br backdrop-blur-xl border',
      gradientClasses[gradient],
      borderClasses[gradient]
    )}>
      {/* Decorative sparkle elements */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
      </div>
      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
        <Gem className="h-3 w-3 text-pink-400" />
      </div>
      
      <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base md:text-lg font-bold flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">{description}</CardDescription>
          </div>
          <Crown className="h-5 w-5 text-amber-400 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <p className={cn(
          "text-xl sm:text-2xl md:text-3xl font-black",
          valueClassName
        )}>
          {value}
        </p>
      </CardContent>
      
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </Card>
  );
};

export default StatCard;
