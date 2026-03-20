import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Euro } from 'lucide-react';

interface SaleTotalsSectionProps {
  totals: {
    totalPurchasePrice: number;
    totalSellingPrice: number;
    totalProfit: number;
    totalDeliveryFee: number;
  };
  showAdvanceSection: boolean;
  setShowAdvanceSection: (v: boolean) => void;
  avancePrice: string;
  onAvancePriceChange: (v: string) => void;
  reste: string;
  nextPaymentDate: string;
  setNextPaymentDate: (v: string) => void;
  isSubmitting: boolean;
}

const SaleTotalsSection: React.FC<SaleTotalsSectionProps> = ({
  totals,
  showAdvanceSection,
  setShowAdvanceSection,
  avancePrice,
  onAvancePriceChange,
  reste,
  nextPaymentDate,
  setNextPaymentDate,
  isSubmitting,
}) => {
  return (
    <>
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/10 border-0 shadow-xl shadow-green-500/10 rounded-2xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-green-300/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl" />
        </div>
        <CardHeader className="relative pb-2">
          <CardTitle className="text-base font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <Euro className="h-4 w-4 text-white" />
            </div>
            Totaux de la vente
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prix d'achat total</p>
              <p className="text-lg font-black text-gray-800 dark:text-gray-200">{totals.totalPurchasePrice.toFixed(2)} €</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Frais de livraison</p>
              <p className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totals.totalDeliveryFee.toFixed(2)} €</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prix de vente total</p>
              <p className="text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totals.totalSellingPrice.toFixed(2)} €</p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bénéfice total</p>
              <p className={`text-lg font-black ${totals.totalProfit >= 0 ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'}`}>
                {totals.totalProfit.toFixed(2)} €
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton Avance Premium */}
      <div className="text-center">
        <Button
          type="button"
          onClick={() => setShowAdvanceSection(!showAdvanceSection)}
          className="rounded-xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5 px-6"
        >
          {showAdvanceSection ? '✕ Masquer Avance' : '💳 Avance'}
        </Button>
      </div>

      {/* Section Avance */}
      {showAdvanceSection && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300">Paiement avec Avance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avancePrice">Prix Avance (€)</Label>
                <Input
                  id="avancePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  max={totals.totalSellingPrice}
                  value={avancePrice}
                  onChange={(e) => onAvancePriceChange(e.target.value)}
                  placeholder="Entrer l'avance"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reste">Reste (€)</Label>
                <Input id="reste" type="number" step="0.01" value={reste} readOnly disabled className="bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextPaymentDate">Date prochaine Paiement</Label>
                <Input id="nextPaymentDate" type="date" value={nextPaymentDate} onChange={(e) => setNextPaymentDate(e.target.value)} disabled={isSubmitting} />
              </div>
            </div>
            {avancePrice && Number(avancePrice) > 0 && (
              <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                <p className="font-semibold">Information:</p>
                <p>Cette vente sera enregistrée avec un prix de vente de {Number(avancePrice).toFixed(2)} € (avance) et un reste de {reste} € sera enregistré.</p>
                <p className="mt-2">Un prêt produit sera automatiquement créé dans votre base de données.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SaleTotalsSection;
