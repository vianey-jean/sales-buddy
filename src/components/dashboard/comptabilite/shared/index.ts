/**
 * INDEX - Exports des composants partagés du module Comptabilité
 * 
 * Ce fichier centralise les exports des composants réutilisables.
 * 
 * COMPOSANTS EXPORTÉS :
 * - ClickableStatCard : Carte de statistique cliquable avec effet premium
 * - DetailsModal : Modale générique pour afficher des détails
 * 
 * UTILISATION :
 * import { ClickableStatCard, DetailsModal } from '@/components/dashboard/comptabilite/shared';
 */

export { default as ClickableStatCard } from './ClickableStatCard';
export type { ClickableStatCardProps } from './ClickableStatCard';

export { default as DetailsModal } from './DetailsModal';
export type { DetailsModalProps } from './DetailsModal';
