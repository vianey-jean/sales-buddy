import React, { memo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface PageHeroProps {
  /** Titre principal de la page */
  title: string;
  /** Sous-titre ou description */
  subtitle?: string;
  /** Icône principale (gauche) */
  iconLeft?: LucideIcon;
  /** Icône secondaire (droite) */
  iconRight?: LucideIcon;
  /** Badge de statut (ex: nombre de clients) */
  badge?: ReactNode;
  /** Actions (boutons) à afficher */
  actions?: ReactNode;
  /** Variante de couleur du gradient */
  variant?: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
  /** Classes CSS additionnelles */
  className?: string;
  /** Afficher les particules flottantes */
  showParticles?: boolean;
  /** Contenu enfant additionnel */
  children?: ReactNode;
}

const gradientVariants = {
  purple: 'from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-800 dark:via-violet-800 dark:to-indigo-800',
  blue: 'from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-800 dark:via-cyan-800 dark:to-teal-800',
  green: 'from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-800 dark:via-green-800 dark:to-teal-800',
  orange: 'from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-800 dark:via-amber-800 dark:to-yellow-800',
  pink: 'from-pink-600 via-rose-600 to-red-600 dark:from-pink-800 dark:via-rose-800 dark:to-red-800'
};

/**
 * Composant Hero réutilisable pour les pages
 * Animation fluide avec Framer Motion
 * Design responsive et accessible
 */
const PageHero: React.FC<PageHeroProps> = memo(({
  title,
  subtitle,
  iconLeft: IconLeft,
  iconRight: IconRight,
  badge,
  actions,
  variant = 'purple',
  className,
  showParticles = true,
  children
}) => {
  return (
    <div className={cn(
      "relative overflow-hidden bg-gradient-to-r",
      gradientVariants[variant],
      className
    )}>
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

      {/* Particules flottantes */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-20 left-20 w-4 h-4 bg-yellow-300/30 rounded-full animate-pulse" />
          <div className="absolute top-40 right-32 w-6 h-6 bg-pink-300/30 rounded-full animate-bounce" />
          <div className="absolute bottom-32 left-40 w-5 h-5 bg-blue-300/30 rounded-full animate-pulse" />
          <div className="absolute top-60 left-1/2 w-3 h-3 bg-green-300/30 rounded-full animate-bounce" />
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-20">
        <div className="text-center">
          {/* Icônes et titre */}
          <div className="inline-flex flex-col xs:flex-row items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            {IconLeft && (
              <div className="relative">
                <IconLeft className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-300 animate-pulse" />
              </div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold 
                        bg-gradient-to-r from-white via-yellow-100 to-white 
                        bg-clip-text text-transparent"
            >
              {title}
            </motion.h1>

            {IconRight && (
              <div className="relative">
                <IconRight className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-purple-200" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
              </div>
            )}
          </div>

          {/* Sous-titre */}
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Badge et Actions */}
          {(badge || actions) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
            >
              {badge}
              {actions}
            </motion.div>
          )}

          {/* Contenu enfant additionnel */}
          {children}
        </div>
      </div>
    </div>
  );
});

PageHero.displayName = 'PageHero';

export default PageHero;
