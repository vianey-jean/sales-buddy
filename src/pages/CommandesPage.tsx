/**
 * =============================================================================
 * CommandesPage - Page de gestion des Commandes et Réservations
 * =============================================================================
 * 
 * Utilise useCommandesLogic pour toute la logique métier.
 * Les composants UI sont importés depuis @/components/commandes.
 * 
 * @module CommandesPage
 */

import React from 'react';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { useCommandesLogic } from '@/hooks/useCommandesLogic';

// Import des composants refactorisés
import {
  CommandesHero,
  CommandesSearchBar,
  CommandesTable,
  CommandeFormDialog,
  ReporterModal,
  ValidationDialog,
  CancellationDialog,
  DeleteDialog,
  RdvCreationModal,
  RdvConfirmationModal
} from '@/components/commandes';
import TacheConflictModal from '@/components/commandes/TacheConflictModal';

const CommandesPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const logic = useCommandesLogic();

  if (logic.isLoading) {
    if (embedded) return <PremiumLoading text="Chargement des commandes..." size="xl" overlay={false} variant="default" />;
    return (
      <Layout>
        <PremiumLoading text="Chargement des commandes..." size="xl" overlay={true} variant="default" />
      </Layout>
    );
  }

  const content = (
    <>
      {/* Hero Header */}
      <CommandesHero />

      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/30 dark:from-slate-900/50 dark:via-purple-950/20 dark:to-indigo-950/30 min-h-screen">
        {/* Barre de recherche et actions */}
        <CommandesSearchBar
          commandeSearch={logic.commandeSearch}
          setCommandeSearch={logic.setCommandeSearch}
          exportDialogOpen={logic.exportDialogOpen}
          setExportDialogOpen={logic.setExportDialogOpen}
          exportDate={logic.exportDate}
          setExportDate={logic.setExportDate}
          commandesForExportDate={logic.commandesForExportDate}
          handleExportPDF={logic.handleExportPDF}
          onNewCommande={() => logic.setIsDialogOpen(true)}
        />

        {/* Dialog Nouvelle/Modifier Commande */}
        <CommandeFormDialog
          isOpen={logic.isDialogOpen}
          onOpenChange={logic.setIsDialogOpen}
          editingCommande={logic.editingCommande}
          clientNom={logic.clientNom}
          setClientNom={logic.setClientNom}
          clientPhone={logic.clientPhone}
          setClientPhone={logic.setClientPhone}
          clientAddress={logic.clientAddress}
          setClientAddress={logic.setClientAddress}
          clientSearch={logic.clientSearch}
          setClientSearch={logic.setClientSearch}
          showClientSuggestions={logic.showClientSuggestions}
          setShowClientSuggestions={logic.setShowClientSuggestions}
          filteredClients={logic.filteredClients}
          handleClientSelect={logic.handleClientSelect}
          type={logic.type}
          setType={logic.setType}
          produitNom={logic.produitNom}
          setProduitNom={logic.setProduitNom}
          prixUnitaire={logic.prixUnitaire}
          setPrixUnitaire={logic.setPrixUnitaire}
          quantite={logic.quantite}
          setQuantite={logic.setQuantite}
          prixVente={logic.prixVente}
          setPrixVente={logic.setPrixVente}
          productSearch={logic.productSearch}
          setProductSearch={logic.setProductSearch}
          showProductSuggestions={logic.showProductSuggestions}
          setShowProductSuggestions={logic.setShowProductSuggestions}
          filteredProducts={logic.filteredProducts}
          handleProductSelect={logic.handleProductSelect}
          selectedProduct={logic.selectedProduct}
          availableQuantityForSelected={logic.availableQuantityForSelected}
          produitsListe={logic.produitsListe}
          editingProductIndex={logic.editingProductIndex}
          handleAddProduit={logic.handleAddProduit}
          handleEditProduit={logic.handleEditProduit}
          handleRemoveProduit={logic.handleRemoveProduit}
          dateArrivagePrevue={logic.dateArrivagePrevue}
          setDateArrivagePrevue={logic.setDateArrivagePrevue}
          dateEcheance={logic.dateEcheance}
          setDateEcheance={logic.setDateEcheance}
          horaire={logic.horaire}
          setHoraire={logic.setHoraire}
          handleSubmit={logic.handleSubmit}
          resetForm={logic.resetForm}
        />

        {/* Table des commandes */}
        <CommandesTable
          filteredCommandes={logic.filteredCommandes}
          totalActiveCommandes={logic.commandes.filter(c => c.statut !== 'valide' && c.statut !== 'annule').length}
          commandeSearch={logic.commandeSearch}
          sortDateAsc={logic.sortDateAsc}
          setSortDateAsc={logic.setSortDateAsc}
          handleEdit={logic.handleEdit}
          handleStatusChange={logic.handleStatusChange}
          setDeleteId={logic.setDeleteId}
          getStatusOptions={logic.getStatusOptions}
        />
      </div>

      {/* Modales de confirmation */}
      <ValidationDialog isOpen={logic.validatingId !== null} onConfirm={logic.confirmValidation} onCancel={() => logic.setValidatingId(null)} />
      <CancellationDialog isOpen={logic.cancellingId !== null} onConfirm={logic.confirmCancellation} onCancel={() => logic.setCancellingId(null)} />
      <DeleteDialog isOpen={logic.deleteId !== null} onConfirm={() => logic.deleteId && logic.handleDelete(logic.deleteId)} onCancel={() => logic.setDeleteId(null)} />

      {/* Modale Reporter */}
      <ReporterModal
        isOpen={logic.reporterModalOpen}
        onOpenChange={logic.setReporterModalOpen}
        reporterDate={logic.reporterDate}
        setReporterDate={logic.setReporterDate}
        reporterHoraire={logic.reporterHoraire}
        setReporterHoraire={logic.setReporterHoraire}
        onConfirm={logic.handleReporterConfirm}
        onCancel={() => { logic.setReporterModalOpen(false); }}
      />

      {/* Modales RDV */}
      <RdvConfirmationModal
        isOpen={logic.showRdvConfirmDialog}
        onClose={logic.handleDeclineRdv}
        onConfirm={logic.handleAcceptRdv}
        reservation={logic.pendingReservationForRdv ? {
          clientNom: logic.pendingReservationForRdv.clientNom,
          dateEcheance: logic.pendingReservationForRdv.dateEcheance || '',
          horaire: logic.pendingReservationForRdv.horaire || '',
          clientAddress: logic.pendingReservationForRdv.clientAddress
        } : null}
      />

      <RdvCreationModal
        isOpen={logic.showRdvFormModal}
        onClose={logic.handleCloseRdvModal}
        onConfirm={logic.handleCreateRdvFromReservation}
        reservation={logic.pendingReservationForRdv ? {
          id: logic.pendingReservationForRdv.id,
          clientNom: logic.pendingReservationForRdv.clientNom,
          clientPhone: logic.pendingReservationForRdv.clientPhone,
          clientAddress: logic.pendingReservationForRdv.clientAddress,
          dateEcheance: logic.pendingReservationForRdv.dateEcheance || '',
          horaire: logic.pendingReservationForRdv.horaire || '',
          produits: logic.pendingReservationForRdv.produits
        } : null}
        isLoading={logic.isRdvLoading}
      />

      {/* Modale conflit tâche */}
      <TacheConflictModal
        isOpen={logic.showTacheConflictModal}
        onClose={logic.handleSkipTacheConflict}
        conflictingTache={logic.conflictingTache}
        onReschedule={logic.handleRescheduleTacheAndCreate}
        onSkip={logic.handleSkipTacheConflict}
      />
    </>
  );

  if (embedded) return content;
  return <Layout>{content}</Layout>;
};

export default CommandesPage;
