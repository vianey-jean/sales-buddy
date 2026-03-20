/**
 * =============================================================================
 * TendancesPage - Page d'analyse des tendances et analytics
 * =============================================================================
 * 
 * Utilise useTendancesData pour la logique de calcul et des composants
 * extraits pour chaque section visuelle.
 * 
 * @module TendancesPage
 */

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import PremiumLoading from '@/components/ui/premium-loading';
import { 
  VentesTotalesModal, 
  BeneficesModal, 
  ProduitsVendusModal, 
  MeilleurRoiModal 
} from '@/components/tendances/TendancesStatsModals';

// Composants extraits
import  TendancesHero  from '@/pages/tendances/TendancesHero';

import { useTendancesData } from '@/pages/tendances/useTendancesData';
import TendancesStatsCards from '@/pages/tendances/TendancesStatsCards';
import TendancesTabNavigation from '@/pages/tendances/TendancesTabNavigation';
import TendancesOverviewTab from '@/pages/tendances/TendancesOverviewTab';
import TendancesProductsTab from '@/pages/tendances/TendancesProductsTab';
import TendancesCategoriesTab from '@/pages/tendances/TendancesCategoriesTab';
import TendancesRecommendationsTab from '@/pages/tendances/TendancesRecommendationsTab';
import TendancesStockTab from '@/pages/tendances/TendancesStockTab';
import TendancesClientsTab from '@/pages/tendances/TendancesClientsTab';

const TendancesPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { allSales, products, loading } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();
  
  // Stats modals state
  const [activeModal, setActiveModal] = useState<'ventes' | 'benefices' | 'produits' | 'roi' | null>(null);

  // Données calculées via le hook dédié
  const {
    stockAnalysis,
    dailySalesAnalysis,
    salesByProduct,
    salesByCategory,
    salesOverTime,
    salesData,
    topProfitableProducts,
    buyingRecommendations,
    clientsData,
  } = useTendancesData(allSales, products);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  if (loading) {
    if (embedded) return <PremiumLoading text="Chargement des Tendances" size="lg" overlay={false} variant="tendances" />;
    return (
      <Layout requireAuth>
        <PremiumLoading text="Chargement des Tendances" size="lg" overlay={true} variant="tendances" />
      </Layout>
    );
  }

  const content = (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-purple-50/30 dark:from-[#030014] dark:via-[#0a0020]/80 dark:to-[#0e0030]">
      <div className="container mx-auto px-4 py-8">
          {/* Hero */}
          <TendancesHero />

          {/* Stats Cards */}
          <TendancesStatsCards
            revenue={salesData.totals.revenue}
            profit={salesData.totals.profit}
            salesCount={salesData.totals.sales}
            quantity={salesData.totals.quantity}
            uniqueProducts={salesByProduct.length}
            buyingRecommendations={buyingRecommendations}
            onOpenModal={setActiveModal}
            formatCurrency={formatCurrency}
          />

          {/* Tabs */}
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="space-y-8">
            <TendancesTabNavigation activeTab={activeTab} isMobile={isMobile} />

            <TabsContent value="overview" className="space-y-6">
              <TendancesOverviewTab salesOverTime={salesOverTime} topProfitableProducts={topProfitableProducts} />
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <TendancesProductsTab salesByProduct={salesByProduct} />
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <TendancesCategoriesTab salesByCategory={salesByCategory} />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <TendancesRecommendationsTab buyingRecommendations={buyingRecommendations} />
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <TendancesClientsTab clientsData={clientsData} />
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <TendancesStockTab stockAnalysis={stockAnalysis} dailySalesAnalysis={dailySalesAnalysis} salesData={salesData} />
            </TabsContent>
          </Tabs>
      </div>
    </div>

    {/* Stats Modals */}
    <VentesTotalesModal isOpen={activeModal === 'ventes'} onClose={() => setActiveModal(null)} revenue={salesData.totals.revenue} sales={salesData.totals.sales} salesByProduct={salesByProduct} />
    <BeneficesModal isOpen={activeModal === 'benefices'} onClose={() => setActiveModal(null)} profit={salesData.totals.profit} margin={salesData.totals.revenue > 0 ? (salesData.totals.profit / salesData.totals.revenue) * 100 : 0} salesByProduct={salesByProduct} />
    <ProduitsVendusModal isOpen={activeModal === 'produits'} onClose={() => setActiveModal(null)} quantity={salesData.totals.quantity} uniqueProducts={salesByProduct.length} salesByProduct={salesByProduct} />
    <MeilleurRoiModal isOpen={activeModal === 'roi'} onClose={() => setActiveModal(null)} buyingRecommendations={buyingRecommendations} />
    </>
  );

  if (embedded) return content;
  return <Layout requireAuth>{content}</Layout>;
};

export default TendancesPage;
