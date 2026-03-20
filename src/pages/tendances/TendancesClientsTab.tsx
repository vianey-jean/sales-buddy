/**
 * TendancesClientsTab - Onglet Analyse Clients
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartTooltip } from '@/components/ui/chart';
import { Users, Crown, TrendingUp, ShoppingBag, ArrowUp, ArrowDown, RotateCcw, CalendarDays, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const clientColors = ['#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#10B981', '#F97316', '#6366F1', '#14B8A6'];

interface ClientData {
  name: string;
  totalSpent: number;
  totalProfit: number;
  purchaseCount: number;
  avgBasket: number;
  lastPurchase: string;
  sales?: any[];
}

interface TendancesClientsTabProps {
  clientsData: ClientData[];
}

const TendancesClientsTab: React.FC<TendancesClientsTabProps> = ({ clientsData }) => {
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  const sortedClients = useMemo(() => {
    return [...clientsData].sort((a, b) =>
      sortDirection === 'desc' ? b.totalSpent - a.totalSpent : a.totalSpent - b.totalSpent
    );
  }, [clientsData, sortDirection]);

  const top10Clients = sortedClients.slice(0, 10);
  const top5Pie = clientsData.slice(0, 5);
  const othersTotal = clientsData.slice(5).reduce((sum, c) => sum + c.totalSpent, 0);
  const pieData = othersTotal > 0 
    ? [...top5Pie.map(c => ({ name: c.name, value: c.totalSpent })), { name: 'Autres', value: othersTotal }]
    : top5Pie.map(c => ({ name: c.name, value: c.totalSpent }));

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  // Determine if client is regular (bought more than once)
  const isRegularClient = (client: ClientData) => client.purchaseCount > 1;

  // Check if client has refunds (negative sales)
  const getClientRefunds = (client: ClientData) => {
    if (!client.sales) return [];
    return client.sales.filter((s: any) => s.isRefund || (s.totalSellingPrice || s.sellingPrice || 0) < 0);
  };

  return (
    <div className="space-y-6">
      {/* Top clients KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none shadow-xl rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-violet-100 font-medium">Clients actifs</p>
                  <p className="text-3xl font-extrabold mt-1">{clientsData.length}</p>
                </div>
                <Users className="h-10 w-10 text-violet-200/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-xl rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-100 font-medium">Meilleur client</p>
                  <p className="text-lg font-extrabold mt-1 truncate max-w-[180px]">{top10Clients[0]?.name || 'N/A'}</p>
                  <p className="text-sm text-amber-100/80">{top10Clients[0]?.totalSpent.toLocaleString('fr-FR')} €</p>
                </div>
                <Crown className="h-10 w-10 text-amber-200/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-100 font-medium">Panier moyen global</p>
                  <p className="text-3xl font-extrabold mt-1">
                    {clientsData.length > 0
                      ? (clientsData.reduce((s, c) => s + c.avgBasket, 0) / clientsData.length).toFixed(0)
                      : 0} €
                  </p>
                </div>
                <ShoppingBag className="h-10 w-10 text-emerald-200/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 clients - Bar chart */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Top 10 Clients par CA
            </CardTitle>
            <CardDescription>Les clients qui génèrent le plus de chiffre d'affaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full bg-white/50 dark:bg-gray-900/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Clients} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} stroke="#64748b" />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-xl">
                            <p className="font-bold text-sm mb-2">{data.name}</p>
                            <p className="text-purple-600 text-sm">CA: {data.totalSpent.toLocaleString('fr-FR')} €</p>
                            <p className="text-emerald-600 text-sm">Bénéfice: {data.totalProfit.toLocaleString('fr-FR')} €</p>
                            <p className="text-blue-600 text-sm">Achats: {data.purchaseCount}x</p>
                            <p className="text-orange-600 text-sm">Panier moy: {data.avgBasket.toFixed(0)} €</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="totalSpent" fill="url(#clientGradient)" radius={[0, 6, 6, 0]} name="CA (€)" />
                  <defs>
                    <linearGradient id="clientGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition CA par client - Pie chart */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Répartition du CA par Client
            </CardTitle>
            <CardDescription>Part de chaque client dans le chiffre d'affaires total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full bg-white/50 dark:bg-gray-900/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value">
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={clientColors[idx % clientColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                            <p className="font-bold text-sm">{payload[0].name}</p>
                            <p style={{ color: payload[0].color }} className="text-sm">
                              CA: {Number(payload[0].value).toLocaleString('fr-FR')} €
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau détaillé des clients */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Classement Complet des Clients
          </CardTitle>
          <CardDescription>Tous les clients classés par chiffre d'affaires — Cliquez sur un client pour voir ses détails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-bold text-gray-600 dark:text-gray-300">#</th>
                  <th className="text-left py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Client</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">
                    <button
                      onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="inline-flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      CA Total
                      {sortDirection === 'desc' ? (
                        <ArrowDown className="h-3.5 w-3.5 text-purple-500" />
                      ) : (
                        <ArrowUp className="h-3.5 w-3.5 text-purple-500" />
                      )}
                    </button>
                  </th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Bénéfice</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Achats</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Panier Moy.</th>
                  <th className="text-right py-3 px-2 font-bold text-gray-600 dark:text-gray-300">Dernier Achat</th>
                </tr>
              </thead>
              <tbody>
                {sortedClients.slice(0, 20).map((client, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedClient(client)}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-gray-900 dark:text-gray-100">{client.name}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-purple-600">{client.totalSpent.toLocaleString('fr-FR')} €</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-emerald-600">{client.totalProfit.toLocaleString('fr-FR')} €</td>
                    <td className="py-2.5 px-2 text-right text-blue-600 font-semibold">{client.purchaseCount}</td>
                    <td className="py-2.5 px-2 text-right text-orange-600 font-semibold">{client.avgBasket.toFixed(0)} €</td>
                    <td className="py-2.5 px-2 text-right text-gray-500 text-xs">{client.lastPurchase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client Detail Modal */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 backdrop-blur-xl border border-purple-100/50 dark:border-purple-800/30 shadow-2xl rounded-2xl">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {selectedClient.name}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-white/50">
                  Détails des achats et historique
                </DialogDescription>
              </DialogHeader>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 dark:border-purple-500/20 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-white/40">CA Total</p>
                  <p className="text-lg font-black text-purple-600">{formatCurrency(selectedClient.totalSpent)}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-white/40">Bénéfice</p>
                  <p className="text-lg font-black text-emerald-600">{formatCurrency(selectedClient.totalProfit)}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-white/40">Nb Achats</p>
                  <p className="text-lg font-black text-blue-600">{selectedClient.purchaseCount}</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/20 rounded-xl text-center">
                  <p className="text-xs text-gray-500 dark:text-white/40">Panier Moyen</p>
                  <p className="text-lg font-black text-orange-600">{formatCurrency(selectedClient.avgBasket)}</p>
                </div>
              </div>

              {/* Client status badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {isRegularClient(selectedClient) ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0">
                    <CalendarDays className="h-3 w-3 mr-1" /> Client régulier
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-0">
                    Achat unique
                  </Badge>
                )}
                {getClientRefunds(selectedClient).length > 0 && (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-0">
                    <RotateCcw className="h-3 w-3 mr-1" /> {getClientRefunds(selectedClient).length} remboursement(s)
                  </Badge>
                )}
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-0">
                  Dernier achat: {selectedClient.lastPurchase}
                </Badge>
              </div>

              {/* Sales list */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 dark:text-white/70 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Historique des achats
                </p>
                {selectedClient.sales && selectedClient.sales.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {selectedClient.sales.map((sale: any, idx: number) => {
                      const isRefund = sale.isRefund || (sale.totalSellingPrice || sale.sellingPrice || 0) < 0;
                      return (
                        <div key={idx} className={`p-3 rounded-xl border ${isRefund ? 'bg-red-50/80 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/20' : 'bg-gray-50/80 dark:bg-white/[0.04] border-gray-200/60 dark:border-white/[0.08]'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              {isRefund && <span className="text-[10px] font-bold text-white bg-red-500 rounded px-1.5 py-0.5 mr-1">REMB.</span>}
                              <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                {sale.products
                                  ? sale.products.map((p: any) => p.description).join(', ')
                                  : sale.description}
                              </span>
                            </div>
                            <span className={`text-sm font-bold ${isRefund ? 'text-red-600' : 'text-emerald-600'}`}>
                              {formatCurrency(sale.totalSellingPrice || sale.sellingPrice || 0)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{new Date(sale.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-white/40">Données d'achats détaillées non disponibles dans cette vue</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TendancesClientsTab;
