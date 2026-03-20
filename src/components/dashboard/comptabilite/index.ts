/**
 * INDEX - Exports du module Comptabilité (REFACTORISÉ)
 * 
 * Architecture propre avec séparation des responsabilités.
 */

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export { default as ComptabiliteModule } from './ComptabiliteModule';

// ============================================
// HOOK PERSONNALISÉ
// ============================================
export { default as useComptabilite, MONTHS } from '@/hooks/useComptabilite';
export type { ModalStates, BarChartData, PieChartData } from '@/hooks/useComptabilite';

// ============================================
// COMPOSANTS DE STRUCTURE
// ============================================
export { default as ComptabiliteHeader } from './ComptabiliteHeader';
export type { ComptabiliteHeaderProps } from './ComptabiliteHeader';

export { default as ComptabiliteStatsCards } from './ComptabiliteStatsCards';
export type { ComptabiliteStatsCardsProps } from './ComptabiliteStatsCards';

export { default as SecondaryStatsCards } from './SecondaryStatsCards';
export type { SecondaryStatsCardsProps } from './SecondaryStatsCards';

export { default as ComptabiliteTabs } from './ComptabiliteTabs';
export type { ComptabiliteTabsProps } from './ComptabiliteTabs';

// ============================================
// COMPOSANTS DE FORMULAIRE
// ============================================
export { default as AchatFormDialog } from './AchatFormDialog';
export type { AchatFormDialogProps } from './AchatFormDialog';

export { default as DepenseFormDialog } from './DepenseFormDialog';
export type { DepenseFormDialogProps } from './DepenseFormDialog';

export { default as ProductSearchInput } from './ProductSearchInput';
export type { ProductSearchInputProps } from './ProductSearchInput';

// ============================================
// COMPOSANTS D'AFFICHAGE
// ============================================
export { default as AchatsHistoriqueList } from './AchatsHistoriqueList';
export type { AchatsHistoriqueListProps } from './AchatsHistoriqueList';

// ============================================
// COMPOSANTS DE GRAPHIQUES
// ============================================
export { StableBarChart, StablePieChart } from './StableCharts';
export { default as DepensesRepartitionChart } from './DepensesRepartitionChart';
export { default as EvolutionMensuelleChart } from './EvolutionMensuelleChart';

// ============================================
// MODALES DE DÉTAILS
// ============================================
export {
  CreditDetailsModal,
  DebitDetailsModal,
  BeneficeVentesModal,
  BeneficeReelModal,
  AchatsProduitsModal,
  AutresDepensesModal,
  SoldeNetModal,
  ExportPdfModal
} from './modals';

// ============================================
// COMPOSANTS PARTAGÉS (RÉUTILISABLES)
// ============================================
export { ClickableStatCard, DetailsModal } from './shared';
export type { ClickableStatCardProps, DetailsModalProps } from './shared';

// ============================================
// COMPOSANTS DE DÉTAILS
// ============================================
export { AchatsProduitsDetails, AutresDepensesDetails, SoldeNetDetails } from './details';
export type { AchatsProduitsDetailsProps, AutresDepensesDetailsProps, SoldeNetDetailsProps } from './details';
