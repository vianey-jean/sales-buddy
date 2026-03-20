/**
 * =============================================================================
 * Index des composants pour la page Commandes
 * =============================================================================
 * 
 * Exporte tous les composants réutilisables de la page Commandes.
 * 
 * @module CommandesComponents
 */

// Composants de base
export { default as CommandesHero } from './CommandesHero';
export { default as CommandesSearchBar } from './CommandesSearchBar';
export { default as CommandesTable } from './CommandesTable';
export { default as CommandesDialogs } from './CommandesDialogs';

// Composants de formulaire
export { default as CommandeFormDialog } from './CommandeFormDialog';
export { default as ReporterModal } from './ReporterModal';

// Composants de confirmation
export { ValidationDialog, CancellationDialog, DeleteDialog } from './ConfirmationDialogs';

// Composants RDV
export { default as RdvCreationModal } from './RdvCreationModal';
export { default as RdvConfirmationModal } from './RdvConfirmationModal';
