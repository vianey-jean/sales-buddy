/**
 * Modale Premium de Confirmation pour création de RDV depuis une réservation
 * Design luxe, moderne et professionnel avec animations élégantes
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CalendarCheck,
  Sparkles,
  User,
  Calendar,
  Clock,
  MapPin,
  X,
  Check,
  Crown,
  Diamond,
} from 'lucide-react';

interface ReservationData {
  clientNom: string;
  dateEcheance: string;
  horaire: string;
  clientAddress?: string;
}

interface RdvConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservation: ReservationData | null;
}

const RdvConfirmationModal: React.FC<RdvConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
}) => {
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-gradient-to-br from-background via-background to-primary/5 rounded-3xl border-2 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden"
        >
          {/* Effets décoratifs premium */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full blur-2xl"
            />
          </div>

          {/* En-tête avec icône animée */}
          <div className="relative px-8 pt-8 pb-4">
            <div className="flex flex-col items-center text-center">
              {/* Icône principale avec animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.1, 
                  duration: 0.5, 
                  type: 'spring', 
                  stiffness: 200 
                }}
                className="relative mb-4"
              >
                <div className="p-5 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl shadow-xl shadow-primary/40">
                  <CalendarCheck className="w-10 h-10 text-primary-foreground" />
                </div>
                {/* Badge premium */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg"
                >
                  <Crown className="w-3.5 h-3.5 text-white" />
                </motion.div>
              </motion.div>

              {/* Titre */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
              >
                Créer un rendez-vous ?
              </motion.h2>

              {/* Sous-titre avec sparkles */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-2 text-muted-foreground flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                Voulez-vous enregistrer cette réservation comme rendez-vous ?
              </motion.p>
            </div>
          </div>

          {/* Informations de la réservation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-6 mb-6 p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm"
          >
            <div className="space-y-3">
              {/* Client */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Client</p>
                  <p className="font-semibold text-foreground">{reservation.clientNom}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Date</p>
                  <p className="font-semibold text-foreground capitalize">{formatDate(reservation.dateEcheance)}</p>
                </div>
              </div>

              {/* Heure */}
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Heure</p>
                  <p className="font-semibold text-foreground">{reservation.horaire}</p>
                </div>
              </div>

              {/* Lieu si disponible */}
              {reservation.clientAddress && (
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Lieu</p>
                    <p className="font-semibold text-foreground">{reservation.clientAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-6 pb-6 flex gap-3"
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border-2 hover:bg-muted/50 transition-all duration-300 group"
            >
              <X className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Non, merci
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 group"
            >
              <Check className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Oui, créer le RDV
            </Button>
          </motion.div>

          {/* Ligne décorative en bas */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RdvConfirmationModal;
