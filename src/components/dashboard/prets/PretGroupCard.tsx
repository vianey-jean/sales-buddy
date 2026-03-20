/**
 * Carte de groupe de prêts avec détails expandables
 */
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Phone, CheckCircle, Clock, Plus, ArrowRightLeft, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { PretProduit } from '@/types';

interface GroupedPrets {
  nom: string;
  phone?: string;
  prets: PretProduit[];
  totalPrixVente: number;
  totalAvance: number;
  totalReste: number;
  allPaid: boolean;
}

interface PretGroupCardProps {
  group: GroupedPrets;
  isExpanded: boolean;
  onToggle: () => void;
  formatCurrency: (amount: number) => string;
  getDatePaiementClass: (pret: PretProduit) => string;
  onAddAvance: (pret: PretProduit) => void;
  onEdit: (pret: PretProduit) => void;
  onDelete: (pret: PretProduit) => void;
  onViewDetails: (pret: PretProduit) => void;
  onTransfer: (group: GroupedPrets) => void;
}

const PretGroupCard: React.FC<PretGroupCardProps> = ({
  group,
  isExpanded,
  onToggle,
  formatCurrency,
  getDatePaiementClass,
  onAddAvance,
  onEdit,
  onDelete,
  onViewDetails,
  onTransfer
}) => {
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden">
      {/* Header du groupe - cliquable */}
      <div 
        className="p-3 sm:p-4 md:p-6 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all"
        onClick={onToggle}
      >
        {/* Mobile layout */}
        <div className="flex flex-col sm:hidden gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-purple-600 flex-shrink-0" />
              )}
              <h3 className="text-base font-bold text-purple-600 dark:text-purple-400 truncate">
                {group.nom}
              </h3>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
              group.allPaid 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-500'
            }`}>
              {group.allPaid ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Payés
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  En cours
                </>
              )}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {group.phone && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Phone className="h-3 w-3" />
                  {group.phone}
                </span>
              )}
              <span className="text-orange-500 font-bold">
                {group.prets.length} prêt{group.prets.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-right">
              <p className="text-gray-500 dark:text-gray-400">Reste</p>
              <p className={`font-bold ${
                group.totalReste === 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {formatCurrency(group.totalReste)}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-purple-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-purple-600" />
              )}
              <h3 className="text-lg md:text-xl font-bold text-purple-600 dark:text-purple-400 truncate">
                {group.nom}
              </h3>
            </div>
            
            {group.phone && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">{group.phone}</span>
              </div>
            )}

            <span className="text-sm font-bold text-orange-500 dark:text-orange-400">
              {group.prets.length} prêt{group.prets.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <motion.div className="text-right">
              <p className="text-xs sm:text-sm text-gray-500 font-bold dark:text-gray-400">
                Total Reste
              </p>
              <motion.p
                key={group.totalReste}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`text-base md:text-lg font-bold ${
                  group.totalReste === 0
                    ? 'text-green-600 dark:text-green-400'
                    : group.totalReste > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {formatCurrency(group.totalReste)}
              </motion.p>
            </motion.div>
            
            <span className={`inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold ${
              group.allPaid 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-red-300 text-red-800 dark:bg-red-900/30 dark:text-red-600'
            }`}>
              {group.allPaid ? (
                <>
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Tous payés
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  En cours
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu expandé */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-3 sm:px-4 md:px-6 pb-4 md:pb-6 border-t border-gray-200 dark:border-gray-700">
              {/* Bouton de transfert */}
              <div className="mt-3 md:mt-4 mb-3 md:mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransfer(group);
                  }}
                  className="text-xs sm:text-sm"
                >
                  <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Transférer
                </Button>
              </div>

              {/* Liste des prêts */}
              <div className="space-y-2 sm:space-y-3">
                {group.prets.map((pret) => (
                  <PretItem
                    key={pret.id}
                    pret={pret}
                    formatCurrency={formatCurrency}
                    getDatePaiementClass={getDatePaiementClass}
                    onAddAvance={() => onAddAvance(pret)}
                    onEdit={() => onEdit(pret)}
                    onDelete={() => onDelete(pret)}
                    onViewDetails={() => onViewDetails(pret)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Sous-composant pour un item de prêt
interface PretItemProps {
  pret: PretProduit;
  formatCurrency: (amount: number) => string;
  getDatePaiementClass: (pret: PretProduit) => string;
  onAddAvance: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

const PretItem: React.FC<PretItemProps> = ({
  pret,
  formatCurrency,
  getDatePaiementClass,
  onAddAvance,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  return (
    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-all">
      {/* Mobile layout */}
      <div className="flex flex-col sm:hidden gap-2">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{pret.description}</p>
            <p className="text-xs text-gray-500">{format(new Date(pret.date), 'dd/MM/yyyy')}</p>
          </div>
          <div className="text-right ml-2">
            <p className="font-bold text-orange-600 text-sm">{formatCurrency(pret.reste).replace(',00', '')}</p>
            <p className="text-xs text-gray-500">reste</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500">Prix: </span>
            <span className="font-semibold">{formatCurrency(pret.prixVente).replace(',00', '')}</span>
            <span className="text-gray-500 mx-1">|</span>
            <span className="text-gray-500">Avance: </span>
            <span className="font-semibold">{formatCurrency(pret.avanceRecue).replace(',00', '')}</span>
          </div>
        </div>
        
        {/* Actions mobile */}
        <div className="flex gap-1.5 mt-1">
          {!pret.estPaye && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onAddAvance(); }}
              className="flex-1 h-7 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Plus className="h-3 w-3 mr-1" />
              Avance
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            className="h-7 w-7 p-0"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="h-7 w-7 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-0">
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 w-full">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{pret.description}</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Date prêt</p>
            <p className="font-medium text-sm">{format(new Date(pret.date), 'dd/MM/yyyy')}</p>
          </div>

          <div className="hidden lg:block">
            <p className="text-xs text-gray-500 dark:text-gray-400">Date paiement</p>
            <p className={`${getDatePaiementClass(pret)} text-sm`}>
              {pret.datePaiement ? format(new Date(pret.datePaiement), 'dd/MM/yyyy') : '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Prix / Avance</p>
            <p className="font-semibold text-sm">
              {formatCurrency(pret.prixVente).replace(',00', '')} / {formatCurrency(pret.avanceRecue).replace(',00', '')}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reste</p>
            <p className="font-bold text-orange-600 text-sm">{formatCurrency(pret.reste).replace(',00', '')}</p>
          </div>
        </div>

        {/* Actions desktop */}
        <div className="flex gap-1 sm:gap-2 w-full lg:w-auto justify-end">
          {!pret.estPaye && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onAddAvance(); }}
              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden md:inline">Avance</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PretGroupCard;
