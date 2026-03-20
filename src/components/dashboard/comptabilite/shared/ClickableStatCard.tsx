/**
 * ClickableStatCard - Carte de statistique cliquable et réutilisable
 * 
 * @description
 * Composant de carte cliquable avec effet de survol premium.
 * Utilisé pour afficher des statistiques avec possibilité d'ouvrir une modale au clic.
 * 
 * @example
 * ```tsx
 * <ClickableStatCard
 *   title="Total Crédit"
 *   value={1500}
 *   subtitle="Argent entrant"
 *   icon={ArrowUpCircle}
 *   colorScheme="green"
 *   onClick={() => setShowModal(true)}
 *   formatValue={formatEuro}
 * />
 * ```
 * 
 * @props
 * - title: Titre de la statistique
 * - value: Valeur numérique à afficher
 * - subtitle: Texte descriptif sous la valeur (optionnel)
 * - icon: Icône Lucide à afficher
 * - colorScheme: Thème de couleur ('green' | 'red' | 'blue' | 'indigo' | 'orange' | 'cyan' | 'emerald')
 * - onClick: Fonction appelée au clic
 * - formatValue: Fonction de formatage de la valeur (optionnel)
 * - isNegative: Si true, utilise les couleurs de valeur négative (optionnel)
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface ClickableStatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'green' | 'red' | 'blue' | 'indigo' | 'orange' | 'cyan' | 'emerald' | 'purple';
  onClick: () => void;
  formatValue?: (value: number) => string;
  isNegative?: boolean;
}

const colorSchemes = {
  green: {
    gradient: 'from-green-500/20 to-emerald-600/20',
    border: 'border-green-500/30',
    titleText: 'text-green-600',
    valueText: 'text-green-500',
    subtitleText: 'text-green-400/70',
    iconColor: 'text-green-400'
  },
  red: {
    gradient: 'from-red-500/20 to-rose-600/20',
    border: 'border-red-500/30',
    titleText: 'text-red-600',
    valueText: 'text-red-500',
    subtitleText: 'text-red-400/70',
    iconColor: 'text-red-400'
  },
  blue: {
    gradient: 'from-blue-500/20 to-indigo-600/20',
    border: 'border-blue-500/30',
    titleText: 'text-blue-600',
    valueText: 'text-blue-500',
    subtitleText: 'text-blue-400/70',
    iconColor: 'text-blue-400'
  },
  indigo: {
    gradient: 'from-indigo-500/20 to-purple-600/20',
    border: 'border-indigo-500/30',
    titleText: 'text-indigo-600',
    valueText: 'text-indigo-500',
    subtitleText: 'text-indigo-400/70',
    iconColor: 'text-indigo-400'
  },
  orange: {
    gradient: 'from-orange-500/20 to-amber-600/20',
    border: 'border-orange-500/30',
    titleText: 'text-orange-600',
    valueText: 'text-orange-500',
    subtitleText: 'text-orange-400/70',
    iconColor: 'text-orange-400'
  },
  cyan: {
    gradient: 'from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/30',
    titleText: 'text-cyan-600',
    valueText: 'text-cyan-500',
    subtitleText: 'text-cyan-400/70',
    iconColor: 'text-cyan-400'
  },
  emerald: {
    gradient: 'from-emerald-500/20 to-teal-600/20',
    border: 'border-emerald-500/30',
    titleText: 'text-emerald-600',
    valueText: 'text-emerald-500',
    subtitleText: 'text-emerald-400/70',
    iconColor: 'text-emerald-400'
  },
  purple: {
    gradient: 'from-purple-500/20 to-fuchsia-600/20',
    border: 'border-purple-500/30',
    titleText: 'text-purple-600',
    valueText: 'text-purple-500',
    subtitleText: 'text-purple-400/70',
    iconColor: 'text-purple-400'
  }
};

const ClickableStatCard: React.FC<ClickableStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  onClick,
  formatValue,
  isNegative = false
}) => {
  const colors = isNegative ? colorSchemes.red : colorSchemes[colorScheme];
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <Card 
      className={`bg-gradient-to-br ${colors.gradient} ${colors.border} shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${colors.titleText} font-medium`}>{title}</p>
            <p className={`text-xl font-bold ${isNegative ? 'text-red-500' : colors.valueText}`}>
              {displayValue}
            </p>
            {subtitle && (
              <p className={`text-xs ${colors.subtitleText}`}>{subtitle}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${colors.iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickableStatCard;
