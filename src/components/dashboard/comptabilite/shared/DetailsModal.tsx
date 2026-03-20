/**
 * DetailsModal - Modale générique pour afficher les détails
 * 
 * @description
 * Composant de modale réutilisable pour afficher des listes de détails.
 * Utilisé pour les modales de détails des cartes de statistiques.
 * 
 * @example
 * ```tsx
 * <DetailsModal
 *   open={showModal}
 *   onOpenChange={setShowModal}
 *   title="Détails Achats"
 *   subtitle="Janvier 2026"
 *   icon={Package}
 *   colorScheme="indigo"
 *   totalLabel="Total"
 *   totalValue={1500}
 *   formatValue={formatEuro}
 * >
 *   <AchatsDetails achats={achats} formatEuro={formatEuro} />
 * </DetailsModal>
 * ```
 * 
 * @props
 * - open: État d'ouverture de la modale
 * - onOpenChange: Callback pour changer l'état d'ouverture
 * - title: Titre de la modale
 * - subtitle: Sous-titre (période, etc.)
 * - icon: Icône Lucide pour le titre
 * - colorScheme: Thème de couleur
 * - totalLabel: Label du total (optionnel)
 * - totalValue: Valeur totale (optionnel)
 * - itemCount: Nombre d'éléments (optionnel)
 * - formatValue: Fonction de formatage (optionnel)
 * - children: Contenu de la modale
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LucideIcon } from 'lucide-react';

export interface DetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'green' | 'red' | 'blue' | 'indigo' | 'orange' | 'cyan' | 'emerald' | 'purple';
  totalLabel?: string;
  totalValue?: number;
  itemCount?: number;
  formatValue?: (value: number) => string;
  children: React.ReactNode;
}

const colorClasses = {
  green: 'text-green-600',
  red: 'text-red-600',
  blue: 'text-blue-600',
  indigo: 'text-indigo-600',
  orange: 'text-orange-600',
  cyan: 'text-cyan-600',
  emerald: 'text-emerald-600',
  purple: 'text-purple-600'
};

const DetailsModal: React.FC<DetailsModalProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  icon: Icon,
  colorScheme,
  totalLabel,
  totalValue,
  itemCount,
  formatValue,
  children
}) => {
  const colorClass = colorClasses[colorScheme];
  const formattedTotal = formatValue && totalValue !== undefined 
    ? formatValue(totalValue) 
    : totalValue?.toString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${colorClass}`}>
            <Icon className="h-6 w-6" />
            {title} {subtitle && `- ${subtitle}`}
          </DialogTitle>
          {(totalLabel || itemCount !== undefined) && (
            <DialogDescription>
              {totalLabel && formattedTotal && `${totalLabel}: ${formattedTotal}`}
              {itemCount !== undefined && ` (${itemCount} élément${itemCount > 1 ? 's' : ''})`}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal;
