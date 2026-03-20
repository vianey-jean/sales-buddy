/**
 * =============================================================================
 * TendancesProductsTab - Onglet Performance par Produit
 * =============================================================================
 * 
 * Graphique en barres groupées : ventes, bénéfices et prix d'achat par produit.
 * 
 * @module TendancesProductsTab
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ChartTooltip } from '@/components/ui/chart';
import { ShoppingCart } from 'lucide-react';

interface TendancesProductsTabProps {
  salesByProduct: any[];
}

const TendancesProductsTab: React.FC<TendancesProductsTabProps> = ({ salesByProduct }) => {
  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-purple-600" />
          Performance par Produit
        </CardTitle>
        <CardDescription>Analyse détaillée des ventes, bénéfices et prix d'achat</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full bg-white/50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByProduct.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold text-sm">{label}</p>
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
              <Bar dataKey="ventes" fill="#8B5CF6" name="Ventes (€)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benefice" fill="#06D6A0" name="Bénéfice (€)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="prixAchat" fill="#F59E0B" name="Prix d'achat (€)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TendancesProductsTab;
