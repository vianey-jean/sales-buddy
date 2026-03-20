import React, { useEffect, useState } from 'react';
import { Eye, TrendingUp, Target, Sparkles, BarChart3, Calendar, Coins, ArrowUpRight, Users, Percent, DollarSign, ShoppingCart, Award, Crown, Diamond, Gem, Star, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { objectifApi, ObjectifData, ObjectifChange, BeneficeMensuel, MonthlyData } from '@/services/api/objectifApi';
import { cn } from '@/lib/utils';
import PremiumLoading from '@/components/ui/premium-loading';
import BeneficesHistoriqueModal from './modals/BeneficesHistoriqueModal';
import VentesHistoriqueModal from './modals/VentesHistoriqueModal';
import ObjectifChangesModal from './modals/ObjectifChangesModal';

interface ObjectifHistorique {
  currentData: ObjectifData;
  historique: MonthlyData[];
  objectifChanges: ObjectifChange[];
  beneficesHistorique: BeneficeMensuel[];
  annee: number;
}

const MOIS_NOMS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Déc'
];

const MOIS_COMPLETS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

type DetailModalType = 'ventesMois' | 'performance' | null;

const ObjectifStatsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ObjectifHistorique | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showBeneficesModal, setShowBeneficesModal] = useState(false);
  const [showVentesModal, setShowVentesModal] = useState(false);
  const [showObjectifChangesModal, setShowObjectifChangesModal] = useState(false);
  const [detailModal, setDetailModal] = useState<DetailModalType>(null);

  const fetchHistorique = async () => {
    setLoading(true);
    try {
      const response = await objectifApi.getHistorique();
      setData(response as ObjectifHistorique);
    } catch (error) {
      console.error('Error fetching historique:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistorique();
    }
  }, [isOpen]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = data?.historique?.map((item) => ({
    name: MOIS_NOMS[item.mois - 1],
    ventes: item.totalVentesMois,
    objectif: item.objectif,
    pourcentage: item.pourcentage,
  })) || [];

  // Fill missing months with 0
  const fullYearData = MOIS_NOMS.map((nom, index) => {
    const existing = chartData.find((d) => d.name === nom);
    return existing || {
      name: nom,
      ventes: 0,
      objectif: data?.currentData?.objectif || 0,
      pourcentage: 0,
    };
  });

  const currentPercentage = data?.currentData 
    ? Math.round((data.currentData.totalVentesMois / data.currentData.objectif) * 100)
    : 0;

  const totalAnnuel = data?.historique?.reduce((sum, item) => sum + item.totalVentesMois, 0) || 0;
  const moyenneMensuelle = data?.historique?.length 
    ? Math.round(totalAnnuel / data.historique.length)
    : 0;
  
  // Calculate total benefices for the year
  const totalBeneficesAnnuel = data?.beneficesHistorique?.reduce((sum, b) => sum + b.totalBenefice, 0) || 0;

  // Calcul des statistiques de performance
  const bestMonth = data?.historique?.reduce((best, item) => 
    item.pourcentage > (best?.pourcentage || 0) ? item : best, data?.historique[0]);
  
  const monthsAboveObjectif = data?.historique?.filter(item => item.pourcentage >= 100).length || 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 border-2 border-white/30 shadow-xl shadow-violet-500/40 transition-all duration-300 flex items-center justify-center group"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-30 transition-opacity animate-pulse" />
            <Eye className="h-4 w-4 text-white drop-shadow-lg" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-400 animate-pulse" />
          </motion.button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-violet-50/50 dark:from-[#030014] dark:via-[#0a0020] dark:to-[#0e0030] border border-violet-200/20 dark:border-violet-700/20 rounded-3xl shadow-[0_30px_100px_-20px_rgba(139,92,246,0.2)]">
          {/* Premium Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-t-3xl" />
          
          <DialogHeader className="pb-4 pt-2">
            <DialogTitle className="flex items-center gap-4 text-2xl font-bold">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-2xl blur-lg opacity-50 animate-pulse" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-xl shadow-violet-500/40">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    PREMIUM
                  </Badge>
                  <Gem className="h-4 w-4 text-fuchsia-500 animate-pulse" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Statistiques des Objectifs
                </span>
              </div>
              <Star className="h-6 w-6 text-amber-500 animate-bounce" />
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <PremiumLoading 
              text="Chargement des statistiques..." 
              size="lg" 
              overlay={false}
              variant="dashboard"
              showText={true}
            />
          ) : data ? (
            <div className="space-y-6 pt-4">
              {/* Stats Cards - Tous cliquables */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Ventes du mois"
                  value={formatCurrency(data.currentData.totalVentesMois)}
                  gradient="from-emerald-500 to-teal-500"
                  shadowColor="emerald"
                  onClick={() => setDetailModal('ventesMois')}
                  clickable
                />
                <StatCard
                  icon={<Target className="h-5 w-5" />}
                  label="Objectif du Mois encours"
                  value={formatCurrency(data.currentData.objectif)}
                  gradient="from-violet-500 to-purple-500"
                  shadowColor="violet"
                  onClick={() => setShowObjectifChangesModal(true)}
                  clickable
                />
                <StatCard
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Performance"
                  value={`${currentPercentage}%`}
                  gradient={currentPercentage >= 100 ? "from-amber-500 to-orange-500" : "from-blue-500 to-cyan-500"}
                  shadowColor={currentPercentage >= 100 ? "amber" : "blue"}
                  onClick={() => setDetailModal('performance')}
                  clickable
                />
                <StatCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Total annuel"
                  value={formatCurrency(totalAnnuel)}
                  gradient="from-rose-500 to-pink-500"
                  shadowColor="rose"
                  onClick={() => setShowVentesModal(true)}
                  clickable
                />
              </div>

              {/* Progress Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative p-6 rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-violet-200/50 dark:border-violet-700/50 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-fuchsia-500/10 to-transparent rounded-full" />
                
                <div className="relative flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                    Progression du mois
                    </span>
                  </div>
                  <Badge className={cn(
                    "text-white border-0 shadow-lg font-black text-lg px-4 py-1",
                    currentPercentage >= 100 ? "bg-gradient-to-r from-emerald-500 to-green-500" : currentPercentage >= 50 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-rose-500 to-pink-500"
                  )}>
                    {currentPercentage}%
                  </Badge>
                </div>
                <div className="relative h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(currentPercentage, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      currentPercentage >= 100 
                        ? "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" 
                        : currentPercentage >= 50 
                          ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500"
                          : "bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
                </div>
              </motion.div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Ventes par mois */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative p-6 rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
                  <h3 className="text-lg font-black mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Ventes {data.annee}
                    </span>
                    <Diamond className="h-4 w-4 text-emerald-500 animate-pulse" />
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height={256}>
                      <AreaChart data={fullYearData}>
                        <defs>
                          <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#dc2626', fontWeight: 'bold', fontSize: 12 }}
                          stroke="#94a3b8"
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Ventes']}
                        />
                        <Area
                          type="monotone"
                          dataKey="ventes"
                          stroke="#10b981"
                          strokeWidth={3}
                          fill="url(#colorVentes)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Pourcentage par mois */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative p-6 rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-violet-200/50 dark:border-violet-700/50 shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                  <h3 className="text-lg font-black mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      Performance {data.annee}
                    </span>
                    <Gem className="h-4 w-4 text-violet-500 animate-pulse" />
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height={256}>
                      <LineChart data={fullYearData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#dc2626', fontWeight: 'bold', fontSize: 12 }}
                          stroke="#94a3b8"
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          }}
                          formatter={(value: number) => [`${value}%`, 'Performance']}
                        />
                        <Line
                          type="monotone"
                          dataKey="pourcentage"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#8b5cf6' }}
                        />
                        {/* Ligne de référence 100% */}
                        <Line
                          type="monotone"
                          dataKey={() => 100}
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-2">
                    <Star className="h-3 w-3 text-amber-500" />
                    La ligne dorée représente l'objectif de 100%
                    <Star className="h-3 w-3 text-amber-500" />
                  </p>
                </motion.div>
              </div>

              {/* Summary with Benefices */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative p-6 rounded-3xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border-2 border-violet-300/50 dark:border-violet-700/50 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-violet-500/10 to-transparent rounded-full" />
                
                <div className="relative flex flex-wrap justify-center gap-8 text-center">
                  <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg border border-violet-200/30 dark:border-violet-700/30">
                    <p className="text-sm text-muted-foreground">Moyenne mensuelle</p>
                    <p className="text-2xl font-black text-violet-600 dark:text-violet-400">
                      {formatCurrency(moyenneMensuelle)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg border border-fuchsia-200/30 dark:border-fuchsia-700/30">
                    <p className="text-sm text-muted-foreground">Mois en cours</p>
                    <p className="text-2xl font-black text-fuchsia-600 dark:text-fuchsia-400">
                      {MOIS_NOMS[data.currentData.mois - 1]} {data.annee}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg border border-pink-200/30 dark:border-pink-700/30">
                    <p className="text-sm text-muted-foreground">Mois enregistrés</p>
                    <p className="text-2xl font-black text-pink-600 dark:text-pink-400">
                      {data.historique?.length || 0}
                    </p>
                  </div>
                  {/* New: Total des bénéfices de l'année - Cliquable */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer group transition-all duration-300 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg border border-emerald-200/30 dark:border-emerald-700/30 hover:shadow-xl hover:border-emerald-400/50"
                    onClick={() => setShowBeneficesModal(true)}
                  >
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                      <Coins className="h-3.5 w-3.5" />
                      Total bénéfices annuels
                      <Crown className="h-3 w-3 text-amber-500" />
                    </p>
                    <p className={cn(
                      "text-2xl font-black flex items-center justify-center gap-1",
                      totalBeneficesAnnuel >= 0 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-rose-600 dark:text-rose-400"
                    )}>
                      {formatCurrency(totalBeneficesAnnuel)}
                    </p>
                    <p className="text-xs text-violet-500 group-hover:text-violet-600 transition-colors mt-1">
                      Cliquez pour détails →
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-full">
                  <BarChart3 className="h-12 w-12 text-violet-600" />
                </div>
                <p className="text-xl font-bold text-gray-600 dark:text-gray-400">Aucune donnée disponible</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Détail Ventes du Mois */}
      <Dialog open={detailModal === 'ventesMois'} onOpenChange={(open) => !open && setDetailModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-[#030014] dark:to-emerald-950/20 border border-emerald-200/20 dark:border-emerald-800/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Détails des Ventes du Mois
              </span>
            </DialogTitle>
          </DialogHeader>
          {data && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                {/* Stats actuelles */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Ventes Actuelles</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                      {formatCurrency(data.currentData.totalVentesMois)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border border-violet-200/50 dark:border-violet-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-violet-600" />
                      <span className="text-xs text-violet-700 dark:text-violet-400">Objectif</span>
                    </div>
                    <p className="text-2xl font-bold text-violet-800 dark:text-violet-300">
                      {formatCurrency(data.currentData.objectif)}
                    </p>
                  </div>
                </div>

                {/* Progression */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progression</span>
                    <span className={cn(
                      "text-lg font-bold",
                      currentPercentage >= 100 ? "text-emerald-500" : currentPercentage >= 50 ? "text-amber-500" : "text-rose-500"
                    )}>
                      {currentPercentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        currentPercentage >= 100 
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                          : currentPercentage >= 50 
                            ? "bg-gradient-to-r from-amber-500 to-orange-500"
                            : "bg-gradient-to-r from-rose-500 to-pink-500"
                      )}
                      style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Reste à atteindre */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-700 dark:text-blue-400">Reste à atteindre</span>
                    </div>
                    <span className={cn(
                      "text-xl font-bold",
                      data.currentData.totalVentesMois >= data.currentData.objectif 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-blue-600 dark:text-blue-400"
                    )}>
                      {data.currentData.totalVentesMois >= data.currentData.objectif 
                        ? "Objectif atteint! 🎉" 
                        : formatCurrency(data.currentData.objectif - data.currentData.totalVentesMois)}
                    </span>
                  </div>
                </div>

                {/* Mois en cours */}
                <div className="text-center p-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
                  <p className="text-sm opacity-90">Mois en cours</p>
                  <p className="text-2xl font-bold">{MOIS_COMPLETS[data.currentData.mois - 1]} {data.annee}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Détail Performance */}
      <Dialog open={detailModal === 'performance'} onOpenChange={(open) => !open && setDetailModal(null)}>
        <DialogContent className="sm:max-w-xl bg-gradient-to-br from-white to-blue-50/50 dark:from-[#030014] dark:to-blue-950/20 border border-blue-200/20 dark:border-blue-800/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Analyse de Performance
              </span>
            </DialogTitle>
          </DialogHeader>
          {data && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                {/* Performance actuelle */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-800/50 text-center">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Performance Actuelle</p>
                  <p className={cn(
                    "text-5xl font-bold",
                    currentPercentage >= 100 ? "text-emerald-600" : currentPercentage >= 50 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {currentPercentage}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {currentPercentage >= 100 ? "Objectif dépassé!" : currentPercentage >= 50 ? "En bonne voie" : "Effort supplémentaire nécessaire"}
                  </p>
                </div>

                {/* Statistiques de performance */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-700 dark:text-amber-400">Meilleur Mois</span>
                    </div>
                    <p className="text-lg font-bold text-amber-800 dark:text-amber-300">
                      {bestMonth ? `${MOIS_NOMS[bestMonth.mois - 1]} (${bestMonth.pourcentage}%)` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Objectifs Atteints</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                      {monthsAboveObjectif}/{data.historique?.length || 0} mois
                    </p>
                  </div>
                </div>

                {/* Historique des performances */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4">Historique des Performances</h3>
                <div className="space-y-2">
                  {data.historique?.map((item) => (
                    <div 
                      key={`${item.mois}-${item.annee}`}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01]",
                        item.pourcentage >= 100 
                          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50" 
                          : item.pourcentage >= 50 
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50"
                            : "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs",
                          item.pourcentage >= 100 
                            ? "bg-gradient-to-r from-emerald-500 to-green-500" 
                            : item.pourcentage >= 50 
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : "bg-gradient-to-r from-rose-500 to-pink-500"
                        )}>
                          {item.mois}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {MOIS_COMPLETS[item.mois - 1]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{formatCurrency(item.totalVentesMois)}</span>
                        <span className={cn(
                          "font-bold px-2 py-1 rounded-full text-sm",
                          item.pourcentage >= 100 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" 
                            : item.pourcentage >= 50 
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400"
                        )}>
                          {item.pourcentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      {data && (
        <>
          <BeneficesHistoriqueModal
            isOpen={showBeneficesModal}
            onClose={() => setShowBeneficesModal(false)}
            beneficesHistorique={data.beneficesHistorique || []}
            annee={data.annee}
          />
          <VentesHistoriqueModal
            isOpen={showVentesModal}
            onClose={() => setShowVentesModal(false)}
            historique={data.historique || []}
            annee={data.annee}
          />
          <ObjectifChangesModal
            isOpen={showObjectifChangesModal}
            onClose={() => setShowObjectifChangesModal(false)}
            objectifChanges={data.objectifChanges || []}
            currentObjectif={data.currentData.objectif}
            annee={data.annee}
          />
        </>
      )}
    </>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  shadowColor: string;
  onClick?: () => void;
  clickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  gradient, 
  shadowColor, 
  onClick,
  clickable = false 
}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={clickable ? { scale: 1.05, y: -5 } : undefined}
    whileTap={clickable ? { scale: 0.95 } : undefined}
    className={cn(
      "relative p-5 rounded-3xl card-mirror-light dark:card-mirror backdrop-blur-xl shadow-xl transition-all duration-300 overflow-hidden",
      clickable && "cursor-pointer hover:shadow-2xl group",
      `hover:shadow-${shadowColor}-500/30 hover:border-${shadowColor}-300/50`
    )}
    onClick={clickable ? onClick : undefined}
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-80" style={{backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`}} />
    <div className={cn("absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20", `bg-${shadowColor}-500`)} />
    
    <div className={cn(
      "relative w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br text-white transition-transform shadow-xl",
      gradient,
      clickable && "group-hover:scale-110 group-hover:rotate-3",
      `shadow-${shadowColor}-500/40`
    )}>
      {icon}
    </div>
    <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <p className="text-xl font-black">{value}</p>
      {clickable && (
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
      )}
    </div>
    {clickable && (
      <p className="text-xs text-violet-500 dark:text-violet-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
        Cliquez pour voir les détails
      </p>
    )}
  </motion.div>
);

export default ObjectifStatsModal;
