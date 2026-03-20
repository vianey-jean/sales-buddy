/**
 * AchatDetailModal - Modale ultra luxe pour afficher les détails d'un achat/dépense
 * 
 * RÔLE :
 * Ce composant affiche une modale premium avec les détails complets
 * d'un achat ou d'une dépense, avec options de modification et suppression.
 * 
 * PROPS :
 * - achat: NouvelleAchat | null - L'achat/dépense à afficher
 * - isOpen: boolean - État d'ouverture de la modale
 * - onClose: () => void - Callback de fermeture
 * - onEdit: (achat: NouvelleAchat) => void - Callback de modification
 * - onDelete: (id: string) => void - Callback de suppression
 * - formatEuro: (value: number) => string - Fonction de formatage monétaire
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Receipt, 
  Fuel, 
  DollarSign, 
  Calendar, 
  Truck, 
  Hash,
  Edit,
  Trash2,
  X,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface AchatDetailModalProps {
  achat: NouvelleAchat | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (achat: NouvelleAchat) => void;
  onDelete: (id: string) => void;
  formatEuro: (value: number) => string;
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return <Package className="h-8 w-8 text-blue-400" />;
    case 'taxes':
      return <Receipt className="h-8 w-8 text-red-400" />;
    case 'carburant':
      return <Fuel className="h-8 w-8 text-orange-400" />;
    default:
      return <DollarSign className="h-8 w-8 text-purple-400" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return 'Achat Produit';
    case 'taxes':
      return 'Taxes';
    case 'carburant':
      return 'Carburant';
    default:
      return 'Autre Dépense';
  }
};

const getTypeGradient = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return 'from-blue-500/20 via-blue-400/10 to-blue-600/5';
    case 'taxes':
      return 'from-red-500/20 via-red-400/10 to-red-600/5';
    case 'carburant':
      return 'from-orange-500/20 via-orange-400/10 to-orange-600/5';
    default:
      return 'from-purple-500/20 via-purple-400/10 to-purple-600/5';
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return 'bg-blue-500';
    case 'taxes':
      return 'bg-red-500';
    case 'carburant':
      return 'bg-orange-500';
    default:
      return 'bg-purple-500';
  }
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AchatDetailModal: React.FC<AchatDetailModalProps> = ({
  achat,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  formatEuro
}) => {
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!achat) return null;

  const handleConfirmEdit = () => {
    setShowEditConfirm(false);
    onEdit(achat);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(achat.id);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-transparent border-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
              relative rounded-3xl overflow-hidden
              bg-gradient-to-br ${getTypeGradient(achat.type)}
              backdrop-blur-xl
              border border-white/30 dark:border-white/10
              shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]
            `}
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="relative p-6">
              {/* Header avec icône et type */}
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className={`
                      p-4 rounded-2xl
                      bg-gradient-to-br ${getTypeBadgeColor(achat.type)} to-transparent
                      shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)]
                    `}
                  >
                    {getTypeIcon(achat.type)}
                  </motion.div>
                  <div>
                    <Badge className={`${getTypeBadgeColor(achat.type)} text-white mb-2`}>
                      {getTypeLabel(achat.type)}
                    </Badge>
                    <DialogTitle className="text-xl font-bold text-foreground">
                      {achat.productDescription || achat.description}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              {/* Montant principal */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="
                  mb-6 p-5 rounded-2xl text-center
                  bg-white/70 dark:bg-white/10
                  backdrop-blur-sm
                  border border-white/30
                  shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)]
                "
              >
                <p className="text-sm text-muted-foreground mb-1">Montant Total</p>
                <p className="text-4xl font-extrabold text-red-500">
                  -{formatEuro(achat.totalCost)}
                </p>
              </motion.div>

              {/* Détails */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 mb-6"
              >
                {/* Date */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {new Date(achat.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Quantité et Prix unitaire (pour achats produit) */}
                {achat.type === 'achat_produit' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5">
                        <Hash className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Quantité</p>
                          <p className="font-semibold">{achat.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Prix unitaire</p>
                          <p className="font-semibold">{formatEuro(achat.purchasePrice)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Fournisseur */}
                {achat.fournisseur && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fournisseur</p>
                      <p className="font-semibold">{achat.fournisseur}</p>
                    </div>
                  </div>
                )}

                {/* Catégorie (pour dépenses) */}
                {achat.categorie && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Catégorie</p>
                      <p className="font-semibold capitalize">{achat.categorie}</p>
                    </div>
                  </div>
                )}

                {/* Caractéristiques */}
                {achat.caracteristiques && (
                  <div className="p-3 rounded-xl bg-white/50 dark:bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Caractéristiques</p>
                    <p className="font-medium text-sm">{achat.caracteristiques}</p>
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                <Button
                  onClick={() => setShowEditConfirm(true)}
                  className="
                    flex-1 h-12 rounded-xl
                    bg-gradient-to-r from-emerald-500 to-green-600
                    hover:from-emerald-600 hover:to-green-700
                    text-white font-semibold
                    shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]
                    transition-all duration-300
                    hover:scale-[1.02]
                  "
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Modifier
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="
                    flex-1 h-12 rounded-xl
                    bg-gradient-to-r from-red-500 to-rose-600
                    hover:from-red-600 hover:to-rose-700
                    text-white font-semibold
                    shadow-[0_10px_30px_-10px_rgba(239,68,68,0.5)]
                    transition-all duration-300
                    hover:scale-[1.02]
                  "
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Supprimer
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de modification */}
      <AlertDialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-emerald-500/20">
                <Edit className="h-6 w-6 text-emerald-500" />
              </div>
              <AlertDialogTitle className="text-xl">Confirmer la modification</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Voulez-vous vraiment modifier cet{' '}
              <span className="font-semibold">{achat.type === 'achat_produit' ? 'achat' : 'cette dépense'}</span> ?
              <br />
              <span className="text-muted-foreground">
                "{achat.productDescription || achat.description}"
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEdit}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
            >
              Oui, modifier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <AlertDialogTitle className="text-xl">Confirmer la suppression</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              <span className="text-red-500 font-semibold">Attention !</span> Cette action est irréversible.
              <br /><br />
              Voulez-vous vraiment supprimer{' '}
              <span className="font-semibold">"{achat.productDescription || achat.description}"</span> ?
              <br />
              <span className="text-sm text-muted-foreground">
                Montant : {formatEuro(achat.totalCost)}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-500 hover:bg-red-600"
            >
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AchatDetailModal;
