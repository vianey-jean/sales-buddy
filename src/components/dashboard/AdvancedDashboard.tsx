
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Calculator, 
  BarChart4, 
  FileSpreadsheet,
  Zap,
  Crown,
  Gem,
  Star,
  Calendar
} from 'lucide-react';

// Importer tous nos composants
import ProfitLossStatement from './accounting/ProfitLossStatement';
import ComptabiliteModule from './comptabilite/ComptabiliteModule';
import SalesReport from './reports/SalesReport';
import ProfitEvolution from './reports/ProfitEvolution';
import StockRotation from './reports/StockRotation';
import YearlyComparison from './reports/YearlyComparison';

interface AdvancedDashboardProps {
  className?: string;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className={`space-y-4 sm:space-y-6 md:space-y-8 ${className}`}>
      {/* En-tête premium ultra-moderne */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-0 shadow-2xl">
        {/* Effets de fond animés */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        
        <CardHeader className="relative text-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative p-2 sm:p-3 md:p-4 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-2xl">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3 sm:mb-4">
            <span className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <Gem className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-purple-400" />
              <span className="text-center">Tableau de Bord Premium</span>
              <Star className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-pink-400" />
            </span>
          </CardTitle>
          
          <CardDescription className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 font-medium max-w-4xl mx-auto leading-relaxed px-2">
            <span className="inline-flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full border border-white/20 text-xs sm:text-sm md:text-base">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-400 shrink-0" />
              <span className="hidden sm:inline">Tableau de Bord Executive Premium</span>
              <span className="sm:hidden">Dashboard Premium</span>
              <Gem className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-400 shrink-0" />
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Navigation ultra-moderne */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 h-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-1.5 sm:p-2">
    <TabsTrigger
    value="inventory"
    className="group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden w-full h-14 sm:h-16 md:h-16 py-2 px-2"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
      <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 group-data-[state=active]:bg-white/20 shrink-0">
        <Calculator className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      </div>
      <span className="font-bold text-[10px] xs:text-xs sm:text-sm text-center leading-tight">Compta<span className="hidden md:inline">bilité</span></span>
    </div>
  </TabsTrigger>  



  <TabsTrigger
    value="accounting"
    className="group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden w-full h-14 sm:h-16 md:h-16 py-2 px-2"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
      <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 group-data-[state=active]:bg-white/20 shrink-0">
        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      </div>
      <span className="font-bold text-[10px] xs:text-xs sm:text-sm text-center leading-tight">Finance<span className="hidden md:inline"> Pro</span></span>
    </div>
  </TabsTrigger>



  <TabsTrigger
    value="reports"
    className="group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:via-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden w-full h-14 sm:h-16 md:h-16 py-2 px-2"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
      <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-orange-500 to-red-500 group-data-[state=active]:bg-white/20 shrink-0">
        <BarChart4 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      </div>
      <span className="font-bold text-[10px] xs:text-xs sm:text-sm text-center leading-tight">Analytics<span className="hidden md:inline"> Pro</span></span>
    </div>
  </TabsTrigger>

  <TabsTrigger
    value="yearly"
    className="group relative flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-500 hover:shadow-xl rounded-lg sm:rounded-xl overflow-hidden w-full h-14 sm:h-16 md:h-16 py-2 px-2"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
      <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 group-data-[state=active]:bg-white/20 shrink-0">
        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      </div>
      <span className="font-bold text-[10px] xs:text-xs sm:text-sm text-center leading-tight">Annuel<span className="hidden md:inline">le</span></span>
    </div>
  </TabsTrigger>

</TabsList>

       <TabsContent value="inventory" className="space-y-8 mt-10">
          <ComptabiliteModule />
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-indigo-900/30 to-cyan-900/30 border-blue-500/30 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-cyan-500/5"></div>
            <CardHeader className="relative text-center py-8">
              <CardTitle className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text flex items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl">
                  <Calculator className="h-7 w-7 text-white" />
                </div>
                Module Comptabilité Intelligent
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl">
                  <Calculator className="h-7 w-7 text-white" />
                </div>
              </CardTitle>
              <CardDescription className="text-lg text-black-200 font-medium mt-4 max-w-4xl mx-auto leading-relaxed">
                Gestion complète des achats, dépenses et analyse de rentabilité avec graphiques avancés 
                pour une vision financière optimale de votre activité.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-4 sm:space-y-6 md:space-y-8 mt-4 sm:mt-6 md:mt-10">
          <ProfitLossStatement />
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-green-900/30 border-emerald-500/30 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-green-500/5"></div>
            <CardHeader className="relative text-center py-4 sm:py-6 md:py-8 px-3 sm:px-4">
              <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <span className="text-center">Suite Financière Executive</span>
                <div className="p-2 sm:p-2.5 md:p-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 dark:text-gray-300 font-medium mt-3 sm:mt-4 max-w-4xl mx-auto leading-relaxed px-2">
                Outils financiers de niveau entreprise avec analyses prédictives, automatisation complète et 
                tableaux de bord executives pour une gestion financière d'exception.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

       

        <TabsContent value="reports" className="space-y-8 mt-10">
          <Tabs defaultValue="sales" className="w-full">
           <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2 bg-white/90 from-gray-900 to-slate-900 shadow-xl rounded-xl h-auto p-2">
  
  <TabsTrigger
    value="sales"
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold w-full h-14 flex items-center justify-center"
  >
    <BarChart4 className="h-4 w-4 mr-2" />
    Ventes Premium
  </TabsTrigger>

  <TabsTrigger
    value="profits"
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold w-full h-14 flex items-center justify-center"
  >
    <TrendingUp className="h-4 w-4 mr-2" />
    Profits Executive
  </TabsTrigger>

  <TabsTrigger
    value="rotation"
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 rounded-lg font-bold w-full h-14 flex items-center justify-center"
  >
    <Zap className="h-4 w-4 mr-2" />
    Rotation Ultra
  </TabsTrigger>

</TabsList>


            <TabsContent value="sales" className="mt-8">
              <SalesReport />
            </TabsContent>

            <TabsContent value="profits" className="mt-8">
              <ProfitEvolution />
            </TabsContent>

            <TabsContent value="rotation" className="mt-8">
              <StockRotation />
            </TabsContent>
          </Tabs>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-900/30 via-red-900/30 to-pink-900/30 border-orange-500/30 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5"></div>
            <CardHeader className="relative text-center py-8">
              <CardTitle className="text-2xl font-black text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text flex items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 shadow-xl">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
                Analytics & Business Intelligence
                 <div className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 shadow-xl">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
              </CardTitle>
              <CardDescription className="text-lg text-black-200 font-medium mt-4 max-w-4xl mx-auto leading-relaxed">
                Suite complète d'analytics avec visualisations interactives, exports automatisés et 
                insights stratégiques pour propulser votre croissance business.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Onglet Comparaison Annuelle */}
        <TabsContent value="yearly" className="space-y-8 mt-10">
          <YearlyComparison />
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 border-indigo-500/30 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
            <CardHeader className="relative text-center py-8">
              <CardTitle className="text-2xl font-black text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text flex items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                Analyse Comparative Annuelle
                <div className="p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </CardTitle>
              <CardDescription className="text-lg text-black-200 font-medium mt-4 max-w-4xl mx-auto leading-relaxed">
                Comparez vos performances d'une année à l'autre. Les statistiques se réinitialisent 
                automatiquement au 1er janvier de chaque nouvelle année.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDashboard;
