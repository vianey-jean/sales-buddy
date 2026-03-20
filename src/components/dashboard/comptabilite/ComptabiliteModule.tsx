/**
 * ComptabiliteModule - Module principal de comptabilité (REFACTORISÉ)
 * 
 * Ce composant est maintenant minimal et ne contient que :
 * - Les imports des composants spécialisés
 * - L'utilisation du hook useComptabilite
 * - L'orchestration des composants
 * 
 * Toute la logique métier est dans le hook useComptabilite.
 * Tous les formulaires et modales sont dans des composants séparés.
 */

import React from 'react';

// Hook personnalisé avec toute la logique métier
import useComptabilite from '@/hooks/useComptabilite';

// Composants d'en-tête et de structure
import ComptabiliteHeader from './ComptabiliteHeader';
import ComptabiliteStatsCards from './ComptabiliteStatsCards';
import SecondaryStatsCards from './SecondaryStatsCards';
import ComptabiliteTabs from './ComptabiliteTabs';

// Formulaires modales
import AchatFormDialog from './AchatFormDialog';
import DepenseFormDialog from './DepenseFormDialog';

// Modales de détails
import {
  CreditDetailsModal,
  DebitDetailsModal,
  BeneficeVentesModal,
  BeneficeReelModal,
  AchatsProduitsModal,
  AutresDepensesModal,
  SoldeNetModal,
  ExportPdfModal
} from './modals';

interface ComptabiliteModuleProps {
  className?: string;
}

const ComptabiliteModule: React.FC<ComptabiliteModuleProps> = ({ className }) => {
  // Utilisation du hook centralisé
  const {
    // Données
    achats,
    comptabiliteData,
    monthlySales,
    monthlyChartData,
    depensesRepartition,
    filteredProducts,
    filteredFournisseurs,
    fournisseurSearch,
    showFournisseurList,
    allSales,
    
    // États de sélection
    selectedMonth,
    selectedYear,
    exportMonth,
    exportYear,
    setExportMonth,
    setExportYear,
    
    // États des modales
    modalStates,
    toggleModal,
    
    // États formulaire achat
    searchTerm,
    selectedProduct,
    showProductList,
    achatForm,
    
    // États formulaire dépense
    depenseForm,
    
    // Handlers
    handleMonthChange,
    handleYearChange,
    handleSearchChange,
    handleSelectProduct,
    handleAchatFormChange,
    handleSelectFournisseur,
    handleDepenseFormChange,
    handleSubmitAchat,
    handleSubmitDepense,
    handleUpdateAchat,
    handleDeleteAchat,
    
    // Utilitaires
    formatEuro,
  } = useComptabilite();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec sélecteurs et boutons */}
      <ComptabiliteHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        onNewAchat={() => toggleModal('showAchatForm', true)}
        onNewDepense={() => toggleModal('showDepenseForm', true)}
        onExport={() => toggleModal('showExportDialog', true)}
      />

      {/* Cartes statistiques principales */}
      <ComptabiliteStatsCards
        comptabiliteData={comptabiliteData}
        formatEuro={formatEuro}
        onCreditClick={() => toggleModal('showCreditModal', true)}
        onDebitClick={() => toggleModal('showDebitModal', true)}
        onBeneficeVentesClick={() => toggleModal('showBeneficeVentesModal', true)}
        onBeneficeReelClick={() => toggleModal('showBeneficeReelModal', true)}
      />

      {/* Cartes secondaires */}
      <SecondaryStatsCards
        comptabiliteData={comptabiliteData}
        formatEuro={formatEuro}
        onAchatsProduitsClick={() => toggleModal('showAchatsProduitsModal', true)}
        onAutresDepensesClick={() => toggleModal('showAutresDepensesModal', true)}
        onSoldeNetClick={() => toggleModal('showSoldeNetModal', true)}
      />

      {/* Onglets avec graphiques et historique */}
      <ComptabiliteTabs
        achats={achats}
        monthlyChartData={monthlyChartData}
        depensesRepartition={depensesRepartition}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        formatEuro={formatEuro}
        onUpdateAchat={handleUpdateAchat}
        onDeleteAchat={handleDeleteAchat}
      />

      {/* ========== MODALES DE FORMULAIRES ========== */}
      
      {/* Modal Formulaire Achat */}
      <AchatFormDialog
        isOpen={modalStates.showAchatForm}
        onClose={() => toggleModal('showAchatForm', false)}
        achatForm={achatForm}
        onFormChange={handleAchatFormChange}
        onSubmit={handleSubmitAchat}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filteredProducts={filteredProducts}
        selectedProduct={selectedProduct}
        onSelectProduct={handleSelectProduct}
        showProductList={showProductList}
        formatEuro={formatEuro}
        filteredFournisseurs={filteredFournisseurs}
        showFournisseurList={showFournisseurList}
        onSelectFournisseur={handleSelectFournisseur}
      />

      {/* Modal Formulaire Dépense */}
      <DepenseFormDialog
        isOpen={modalStates.showDepenseForm}
        onClose={() => toggleModal('showDepenseForm', false)}
        depenseForm={depenseForm}
        onFormChange={handleDepenseFormChange}
        onSubmit={handleSubmitDepense}
      />

      {/* ========== MODALES DE DÉTAILS ========== */}

      {/* Modal Crédit */}
      <CreditDetailsModal
        isOpen={modalStates.showCreditModal}
        onClose={() => toggleModal('showCreditModal', false)}
        monthlySales={monthlySales}
        totalCredit={comptabiliteData.totalCredit}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        formatEuro={formatEuro}
      />

      {/* Modal Débit */}
      <DebitDetailsModal
        isOpen={modalStates.showDebitModal}
        onClose={() => toggleModal('showDebitModal', false)}
        achats={achats}
        totalDebit={comptabiliteData.totalDebit}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        formatEuro={formatEuro}
      />

      {/* Modal Bénéfice Ventes */}
      <BeneficeVentesModal
        isOpen={modalStates.showBeneficeVentesModal}
        onClose={() => toggleModal('showBeneficeVentesModal', false)}
        monthlySales={monthlySales}
        salesProfit={comptabiliteData.salesProfit}
        salesCount={comptabiliteData.salesCount}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        formatEuro={formatEuro}
      />

      {/* Modal Bénéfice Réel */}
      <BeneficeReelModal
        isOpen={modalStates.showBeneficeReelModal}
        onClose={() => toggleModal('showBeneficeReelModal', false)}
        comptabiliteData={comptabiliteData}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        formatEuro={formatEuro}
      />

      {/* Modal Achats Produits */}
      <AchatsProduitsModal
        isOpen={modalStates.showAchatsProduitsModal}
        onClose={() => toggleModal('showAchatsProduitsModal', false)}
        achats={achats}
        achatsTotal={comptabiliteData.achatsTotal}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        formatEuro={formatEuro}
      />

      {/* Modal Autres Dépenses */}
      <AutresDepensesModal
        isOpen={modalStates.showAutresDepensesModal}
        onClose={() => toggleModal('showAutresDepensesModal', false)}
        achats={achats}
        depensesTotal={comptabiliteData.depensesTotal}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        formatEuro={formatEuro}
      />

      {/* Modal Solde Net */}
      <SoldeNetModal
        isOpen={modalStates.showSoldeNetModal}
        onClose={() => toggleModal('showSoldeNetModal', false)}
        comptabiliteData={comptabiliteData}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        formatEuro={formatEuro}
      />

      {/* Modal Export PDF */}
      <ExportPdfModal
        isOpen={modalStates.showExportDialog}
        onClose={() => toggleModal('showExportDialog', false)}
        exportMonth={exportMonth}
        exportYear={exportYear}
        setExportMonth={setExportMonth}
        setExportYear={setExportYear}
        allSales={allSales}
      />
    </div>
  );
};

export default ComptabiliteModule;
