/**
 * =============================================================================
 * TendancesCategoriesTab - Onglet Par Catégories
 * =============================================================================
 * 
 * Affiche un PieChart de répartition des ventes et un BarChart des bénéfices
 * par catégorie de produit.
 * 
 * @module TendancesCategoriesTab
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartTooltip } from '@/components/ui/chart';
import { Target, Award } from 'lucide-react';

/** Couleurs associées aux catégories */
const categoryColors: Record<string, string> = {
  'Perruques': '#8B5CF6',
  'Tissages': '#06D6A0',
  'Accessoires': '#F59E0B',
  'Autres': '#6B7280'
};

const fallbackColors = ['#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#10B981', '#F97316'];

interface TendancesCategoriesTabProps {
  salesByCategory: any[];
}

const TendancesCategoriesTab: React.FC<TendancesCategoriesTabProps> = ({ salesByCategory }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Répartition des Ventes par Catégorie
          </CardTitle>
          <CardDescription>Distribution des ventes par type de produit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-white/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="ventes">
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || fallbackColors[index % fallbackColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{payload[0].payload.category}</p>
                          <p style={{ color: payload[0].color }}>Ventes: {payload[0].value?.toLocaleString()} €</p>
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

      {/* Bar Chart bénéfices */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Bénéfices par Catégorie
          </CardTitle>
          <CardDescription>Rentabilité par type de produit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-white/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{label}</p>
                          <p style={{ color: payload[0].color }}>Bénéfice: {payload[0].value?.toLocaleString()} €</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="benefice" fill="#06D6A0" radius={[4, 4, 0, 0]} name="Bénéfice (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TendancesCategoriesTab;
