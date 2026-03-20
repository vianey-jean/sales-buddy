/**
 * =============================================================================
 * TendancesOverviewTab - Onglet Vue d'ensemble
 * =============================================================================
 * 
 * Affiche les graphiques d'évolution des ventes et le top 10 produits rentables.
 * 
 * @module TendancesOverviewTab
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { ChartTooltip } from '@/components/ui/chart';
import { TrendingUp, Package } from 'lucide-react';

interface TendancesOverviewTabProps {
  salesOverTime: any[];
  topProfitableProducts: any[];
}

const TendancesOverviewTab: React.FC<TendancesOverviewTabProps> = ({ salesOverTime, topProfitableProducts }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Évolution des ventes */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Évolution des Ventes
          </CardTitle>
          <CardDescription>Progression mensuelle des ventes et bénéfices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-white/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesOverTime}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorBenefice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06D6A0" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>
                              {entry.name}: {entry.value?.toLocaleString()} €
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="ventes" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorVentes)" strokeWidth={3} name="Ventes (€)" />
                <Area type="monotone" dataKey="benefice" stroke="#06D6A0" fillOpacity={1} fill="url(#colorBenefice)" strokeWidth={3} name="Bénéfice (€)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Produits Rentables */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Top 10 Produits les Plus Rentables
          </CardTitle>
          <CardDescription>Classement par bénéfice généré</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full bg-white/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProfitableProducts.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} stroke="#64748b" interval={0} />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" label={{ value: 'Bénéfice (€)', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-xl border-gray-200 dark:border-gray-600">
                          <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">{data.fullName || label}</p>
                          <div className="space-y-1">
                            <p className="text-emerald-600 dark:text-emerald-400 flex items-center">
                              <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                              Bénéfice: <span className="font-bold ml-1">{payload[0].value?.toLocaleString()} €</span>
                            </p>
                            <p className="text-blue-600 dark:text-blue-400 text-xs">Quantité vendue: {data.quantite}</p>
                            <p className="text-purple-600 dark:text-purple-400 text-xs">Ventes totales: {data.ventes?.toLocaleString()} €</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="benefice" fill="url(#beneficeGradient)" radius={[4, 4, 0, 0]} name="Bénéfice (€)" stroke="#06D6A0" strokeWidth={1} />
                <defs>
                  <linearGradient id="beneficeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#06D6A0" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TendancesOverviewTab;
