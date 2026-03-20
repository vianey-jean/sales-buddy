/**
 * INDEX - Exports des composants de détails du module Comptabilité
 * 
 * Ce fichier centralise les exports des composants d'affichage des détails.
 * Ces composants sont utilisés dans les modales des cartes de statistiques.
 * 
 * COMPOSANTS EXPORTÉS :
 * - AchatsProduitsDetails : Liste détaillée des achats produits
 * - AutresDepensesDetails : Liste détaillée des autres dépenses (taxes, carburant, etc.)
 * - SoldeNetDetails : Détail du calcul du solde net avec indicateurs visuels
 * 
 * UTILISATION :
 * import { AchatsProduitsDetails, AutresDepensesDetails, SoldeNetDetails } from '@/components/dashboard/comptabilite/details';
 */

export { default as AchatsProduitsDetails } from './AchatsProduitsDetails';
export type { AchatsProduitsDetailsProps } from './AchatsProduitsDetails';

export { default as AutresDepensesDetails } from './AutresDepensesDetails';
export type { AutresDepensesDetailsProps } from './AutresDepensesDetails';

export { default as SoldeNetDetails } from './SoldeNetDetails';
export type { SoldeNetDetailsProps } from './SoldeNetDetails';
