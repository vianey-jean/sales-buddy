/**
 * ComptabiliteStatsCards - Cartes de statistiques de comptabilité
 * 
 * RÔLE :
 * Ce composant affiche les 4 cartes principales de statistiques :
 * - Total Crédit (argent entrant)
 * - Total Débit (argent sortant)
 * - Bénéfice des Ventes
 * - Bénéfice Réel (après dépenses)
 * 
 * Chaque carte est cliquable et ouvre une modale de détails.
 * 
 * PROPS :
 * - comptabiliteData: ComptabiliteData - Données de comptabilité calculées
 * - formatEuro: (value: number) => string - Fonction de formatage monétaire
 * - onCreditClick: () => void - Callback au clic sur la carte Crédit
 * - onDebitClick: () => void - Callback au clic sur la carte Débit
 * - onBeneficeVentesClick: () => void - Callback au clic sur la carte Bénéfice Ventes
 * - onBeneficeReelClick: () => void - Callback au clic sur la carte Bénéfice Réel
 * 
 * DÉPENDANCES :
 * - @/components/ui/card
 * - @/types/comptabilite (ComptabiliteData)
 * - lucide-react (ArrowUpCircle, ArrowDownCircle, TrendingUp, Wallet)
 * 
 * UTILISÉ PAR :
 * - ComptabiliteModule.tsx
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Wallet } from 'lucide-react';
import { ComptabiliteData } from '@/types/comptabilite';

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface ComptabiliteStatsCardsProps {
  /** Données de comptabilité calculées */
  comptabiliteData: ComptabiliteData;
  /** Fonction de formatage des montants en euros */
  formatEuro: (value: number) => string;
  /** Callback au clic sur la carte Crédit */
  onCreditClick: () => void;
  /** Callback au clic sur la carte Débit */
  onDebitClick: () => void;
  /** Callback au clic sur la carte Bénéfice Ventes */
  onBeneficeVentesClick: () => void;
  /** Callback au clic sur la carte Bénéfice Réel */
  onBeneficeReelClick: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const ComptabiliteStatsCards: React.FC<ComptabiliteStatsCardsProps> = ({
  comptabiliteData,
  formatEuro,
  onCreditClick,
  onDebitClick,
  onBeneficeVentesClick,
  onBeneficeReelClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Carte Crédit - Argent entrant */}
      <Card 
        className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
        onClick={onCreditClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Crédit</p>
              <p className="text-2xl font-bold text-green-500">{formatEuro(comptabiliteData.totalCredit)}</p>
              <p className="text-xs text-green-400/70">Argent entrant</p>
            </div>
            <ArrowUpCircle className="h-10 w-10 text-green-400" />
          </div>
        </CardContent>
      </Card>
      
      {/* Carte Débit - Argent sortant */}
      <Card 
        className="bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
        onClick={onDebitClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Débit</p>
              <p className="text-2xl font-bold text-red-500">{formatEuro(comptabiliteData.totalDebit)}</p>
              <p className="text-xs text-red-400/70">Argent sortant</p>
            </div>
            <ArrowDownCircle className="h-10 w-10 text-red-400" />
          </div>
        </CardContent>
      </Card>
      
      {/* Carte Bénéfice Ventes */}
      <Card 
        className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-500/30 shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
        onClick={onBeneficeVentesClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Bénéfice Ventes</p>
              <p className="text-2xl font-bold text-blue-500">{formatEuro(comptabiliteData.salesProfit)}</p>
              <p className="text-xs text-blue-400/70">{comptabiliteData.salesCount} ventes</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-400" />
          </div>
        </CardContent>
      </Card>
      
      {/* Carte Bénéfice Réel - Après dépenses */}
      <Card 
        className={`bg-gradient-to-br ${comptabiliteData.beneficeReel >= 0 ? 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30' : 'from-red-500/20 to-rose-600/20 border-red-500/30'} shadow-xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300`}
        onClick={onBeneficeReelClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-600' : 'text-red-600'} font-medium`}>Bénéfice Réel</p>
              <p className={`text-2xl font-bold ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatEuro(comptabiliteData.beneficeReel)}
              </p>
              <p className={`text-xs ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>Après dépenses</p>
            </div>
            <Wallet className={`h-10 w-10 ${comptabiliteData.beneficeReel >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComptabiliteStatsCards;
