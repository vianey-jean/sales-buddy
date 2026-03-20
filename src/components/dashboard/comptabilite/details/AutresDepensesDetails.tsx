/**
 * AutresDepensesDetails - Affichage détaillé des autres dépenses
 * 
 * @description
 * Composant pour afficher la liste des dépenses hors achats produits.
 * Inclut taxes, carburant et autres dépenses.
 * 
 * @example
 * ```tsx
 * <AutresDepensesDetails 
 *   achats={achats} 
 *   formatEuro={formatEuro} 
 * />
 * ```
 * 
 * @props
 * - achats: Liste des achats (filtrée automatiquement pour exclure achat_produit)
 * - formatEuro: Fonction de formatage monétaire
 */

import React from 'react';
import { Fuel, Receipt, DollarSign } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';

export interface AutresDepensesDetailsProps {
  achats: NouvelleAchat[];
  formatEuro: (value: number) => string;
}

const AutresDepensesDetails: React.FC<AutresDepensesDetailsProps> = ({
  achats,
  formatEuro
}) => {
  // Filtrer les dépenses hors achats produits
  const depenses = achats.filter(a => a.type !== 'achat_produit');

  if (depenses.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Aucune autre dépense ce mois
      </p>
    );
  }

  // Helper pour obtenir l'icône selon le type
  const getIcon = (type: string) => {
    switch (type) {
      case 'carburant':
        return <Fuel className="h-4 w-4 text-orange-400" />;
      case 'taxes':
        return <Receipt className="h-4 w-4 text-red-400" />;
      default:
        return <DollarSign className="h-4 w-4 text-purple-400" />;
    }
  };

  // Helper pour obtenir le label du type
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'carburant':
        return 'Carburant';
      case 'taxes':
        return 'Taxes';
      default:
        return 'Autre';
    }
  };

  // Helper pour obtenir les classes de couleur
  const getColorClasses = (type: string) => {
    switch (type) {
      case 'carburant':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-600'
        };
      case 'taxes':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-600'
        };
    }
  };

  return (
    <>
      {depenses.map((depense) => {
        const colors = getColorClasses(depense.type);
        return (
          <div 
            key={depense.id} 
            className={`flex items-center justify-between p-3 ${colors.bg} rounded-lg border ${colors.border}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                {getIcon(depense.type)}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {depense.productDescription || depense.description}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(depense.date).toLocaleDateString('fr-FR')}
                  {' • '}
                  <span className="font-medium">{getTypeLabel(depense.type)}</span>
                  {depense.categorie && ` • ${depense.categorie}`}
                </p>
              </div>
            </div>
            <p className={`text-lg font-bold ${colors.text}`}>
              {formatEuro(depense.totalCost)}
            </p>
          </div>
        );
      })}
    </>
  );
};

export default AutresDepensesDetails;
