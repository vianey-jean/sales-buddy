
import React from 'react';
import Layout from '../components/Layout';
import SalesReport from '../components/dashboard/reports/SalesReport';
import ProfitEvolution from '../components/dashboard/reports/ProfitEvolution';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Tendances: React.FC = () => {
  return (
    <Layout>
      <div className="responsive-container space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="responsive-h1">Tendances et Analyses</h1>
        </div>

        <Tabs defaultValue="reports" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2 h-auto p-1.5 sm:p-2">
            <TabsTrigger value="reports" className="text-xs sm:text-sm py-2.5 sm:py-3">
              <span className="hidden xs:inline">Rapports de Ventes</span>
              <span className="xs:hidden">Rapports</span>
            </TabsTrigger>
            <TabsTrigger value="profit" className="text-xs sm:text-sm py-2.5 sm:py-3">
              <span className="hidden xs:inline">Évolution des Profits</span>
              <span className="xs:hidden">Profits</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 sm:space-y-6">
            <SalesReport />
          </TabsContent>

          <TabsContent value="profit" className="space-y-4 sm:space-y-6">
            <ProfitEvolution />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tendances;
