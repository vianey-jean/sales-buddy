/**
 * AchatsHistoriqueList - Liste historique des achats et dépenses
 * 
 * RÔLE :
 * Ce composant affiche la liste des achats et dépenses enregistrés
 * pour un mois donné. Chaque entrée est cliquable et permet de :
 * - Voir les détails dans une modale luxe
 * - Modifier l'achat/dépense
 * - Supprimer l'achat/dépense
 * 
 * PROPS :
 * - achats: NouvelleAchat[] - Liste des achats/dépenses à afficher
 * - formatEuro: (value: number) => string - Fonction de formatage monétaire
 * - selectedMonth: number - Mois sélectionné (1-12)
 * - selectedYear: number - Année sélectionnée
 * - months: string[] - Tableau des noms de mois
 * - onUpdate: (id: string, data: Partial<NouvelleAchat>) => Promise<void> - Callback de mise à jour
 * - onDelete: (id: string) => Promise<void> - Callback de suppression
 * 
 * DÉPENDANCES :
 * - @/components/ui/card
 * - @/components/ui/badge
 * - @/types/comptabilite (NouvelleAchat)
 * - lucide-react (Package, Receipt, Fuel, DollarSign, Edit, Trash2)
 * - framer-motion
 * 
 * UTILISÉ PAR :
 * - ComptabiliteModule.tsx (onglet Historique)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Receipt, Fuel, DollarSign, Sparkles, Edit, Trash2 } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { motion } from 'framer-motion';
import AchatDetailModal from './modals/AchatDetailModal';
import AchatEditModal from './modals/AchatEditModal';

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface AchatsHistoriqueListProps {
  /** Liste des achats et dépenses à afficher */
  achats: NouvelleAchat[];
  /** Fonction de formatage des montants en euros */
  formatEuro: (value: number) => string;
  /** Mois sélectionné (1-12) */
  selectedMonth: number;
  /** Année sélectionnée */
  selectedYear: number;
  /** Tableau des noms de mois en français */
  months: string[];
  /** Callback de mise à jour */
  onUpdate?: (id: string, data: Partial<NouvelleAchat>) => Promise<void>;
  /** Callback de suppression */
  onDelete?: (id: string) => Promise<void>;
}

// ============================================
// FONCTION UTILITAIRE - Obtenir l'icône selon le type
// ============================================
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return <Package className="h-5 w-5 text-blue-400" />;
    case 'taxes':
      return <Receipt className="h-5 w-5 text-red-400" />;
    case 'carburant':
      return <Fuel className="h-5 w-5 text-orange-400" />;
    default:
      return <DollarSign className="h-5 w-5 text-purple-400" />;
  }
};

// ============================================
// FONCTION UTILITAIRE - Obtenir la classe CSS selon le type
// ============================================
const getTypeClass = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return 'bg-blue-500/20';
    case 'taxes':
      return 'bg-red-500/20';
    case 'carburant':
      return 'bg-orange-500/20';
    default:
      return 'bg-purple-500/20';
  }
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AchatsHistoriqueList: React.FC<AchatsHistoriqueListProps> = ({
  achats,
  formatEuro,
  selectedMonth,
  selectedYear,
  months,
  onUpdate,
  onDelete
}) => {
  // États pour les modales
  const [selectedAchat, setSelectedAchat] = useState<NouvelleAchat | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Gestionnaires d'événements
  const handleItemClick = (achat: NouvelleAchat) => {
    setSelectedAchat(achat);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, achat: NouvelleAchat) => {
    e.stopPropagation();
    setSelectedAchat(achat);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
    }
  };

  const handleEditFromDetail = (achat: NouvelleAchat) => {
    setIsDetailModalOpen(false);
    setSelectedAchat(achat);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, data: Partial<NouvelleAchat>) => {
    if (onUpdate) {
      await onUpdate(id, data);
    }
    setIsEditModalOpen(false);
    setSelectedAchat(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAchat(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAchat(null);
  };

  return (
    <>
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        {/* En-tête avec titre animé */}
        <CardHeader className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="
              flex items-center gap-3 px-6 py-4
              rounded-2xl
              bg-white/70 dark:bg-white/10
              backdrop-blur-xl
              shadow-[0_20px_50px_rgba(0,0,0,0.15)]
              border border-white/30
            "
          >
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            <CardTitle
              className="
                text-xl font-semibold tracking-wide
                bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900
                dark:from-white dark:via-gray-300 dark:to-white
                bg-clip-text text-transparent
                text-center
              "
            >
              Historique des Achats & Dépenses
              <span className="block text-sm text-green-600 font-bold mt-1 opacity-80">
                {months[selectedMonth - 1]} {selectedYear}
              </span>
            </CardTitle>
          </motion.div>
        </CardHeader>
        
        <CardContent>
          {/* Liste des achats/dépenses ou message si vide */}
          {achats.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {achats.map((achat, index) => (
                <motion.div
                  key={achat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(achat)}
                  className="
                    flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4
                    bg-white/50 dark:bg-gray-800/50 
                    rounded-xl border border-gray-200 dark:border-gray-700 
                    hover:shadow-lg hover:scale-[1.01] hover:border-primary/50
                    transition-all duration-200 cursor-pointer
                    group gap-2 sm:gap-0
                  "
                >
                  {/* Partie haute/gauche: Icône et informations */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${getTypeClass(achat.type)} transition-transform group-hover:scale-110`}>
                      {getTypeIcon(achat.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate">
                        {achat.productDescription || achat.description}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(achat.date).toLocaleDateString('fr-FR')}
                        {achat.fournisseur && ` • ${achat.fournisseur}`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Partie basse/droite: Coût, quantité et actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-11 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-sm sm:text-base text-red-400">-{formatEuro(achat.totalCost)}</p>
                      {achat.quantity && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Qté: {achat.quantity}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Actions - toujours visibles sur mobile/tablette, hover sur desktop */}
                    <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleEditClick(e, achat)}
                        className="
                          h-8 w-8 sm:h-9 sm:w-9 rounded-lg
                          text-emerald-600 hover:text-emerald-700
                          hover:bg-emerald-500/15
                          transition-all hover:scale-110
                        "
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAchat(achat);
                          setIsDetailModalOpen(true);
                        }}
                        className="
                          h-8 w-8 sm:h-9 sm:w-9 rounded-lg
                          text-red-600 hover:text-red-700
                          hover:bg-red-500/15
                          transition-all hover:scale-110
                        "
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Aucun achat ou dépense pour {months[selectedMonth - 1]} {selectedYear}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de détails */}
      <AchatDetailModal
        achat={selectedAchat}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteClick}
        formatEuro={formatEuro}
      />

      {/* Modale de modification */}
      <AchatEditModal
        achat={selectedAchat}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />
    </>
  );
};

export default AchatsHistoriqueList;
