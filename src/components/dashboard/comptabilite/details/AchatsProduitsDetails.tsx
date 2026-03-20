/**
 * AchatsProduitsDetails - Affichage détaillé des achats produits
 * 
 * @description
 * Composant pour afficher la liste des achats de type "achat_produit" du mois.
 * 
 * @example
 * ```tsx
 * <AchatsProduitsDetails 
 *   achats={achats} 
 *   formatEuro={formatEuro} 
 * />
 * ```
 * 
 * @props
 * - achats: Liste des achats (filtrée automatiquement par type achat_produit)
 * - formatEuro: Fonction de formatage monétaire
 */

import React from 'react';
import { Package } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';

export interface AchatsProduitsDetailsProps {
  achats: NouvelleAchat[];
  formatEuro: (value: number) => string;
}

const AchatsProduitsDetails: React.FC<AchatsProduitsDetailsProps> = ({
  achats,
  formatEuro
}) => {
  // Filtrer uniquement les achats produits
  const achatsProducts = achats.filter(a => a.type === 'achat_produit');

  if (achatsProducts.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Aucun achat de produit ce mois
      </p>
    );
  }

  return (
    <>
      {achatsProducts.map((achat) => (
        <div 
          key={achat.id} 
          className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Package className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {achat.productDescription}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(achat.date).toLocaleDateString('fr-FR')}
                {achat.fournisseur && ` • ${achat.fournisseur}`}
                {achat.quantity && ` • Qté: ${achat.quantity}`}
              </p>
            </div>
          </div>
          <p className="text-lg font-bold text-indigo-600">
            {formatEuro(achat.totalCost)}
          </p>
        </div>
      ))}
    </>
  );
};

export default AchatsProduitsDetails;
