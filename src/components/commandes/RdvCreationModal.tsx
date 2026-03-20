/**
 * Modale Premium de Création de Rendez-vous
 * Design luxe, moderne et professionnel
 * Uniquement Titre et Description avec scroll élégant
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  CalendarPlus,
  Sparkles,
  Edit3,
  FileText,
  Crown,
  X,
  Loader2,
  Diamond,
  CheckCircle,
} from 'lucide-react';

interface ReservationData {
  id: string;
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  dateEcheance: string;
  horaire: string;
  produits: Array<{
    nom: string;
    quantite: number;
    prixUnitaire: number;
    prixVente: number;
  }>;
}

interface RdvCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (titre: string, description: string) => Promise<void>;
  reservation: ReservationData | null;
  isLoading?: boolean;
}

const RdvCreationModal: React.FC<RdvCreationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  isLoading = false
}) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitre('');
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titre.trim()) {
      setError('Le titre du rendez-vous est obligatoire');
      return;
    }
    
    setError('');
    await onConfirm(titre.trim(), description.trim());
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-gradient-to-br from-background via-background to-primary/5 rounded-3xl border-2 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Effets décoratifs premium */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-12 -left-12 w-28 h-28 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full blur-2xl"
            />
          </div>

          {/* En-tête fixe */}
          <div className="relative px-8 pt-8 pb-4 border-b border-border/30 flex-shrink-0">
            <div className="flex items-start gap-5">
              {/* Icône principale */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 200 }}
                className="relative flex-shrink-0"
              >
                <div className="p-4 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl shadow-xl shadow-primary/40">
                  <CalendarPlus className="w-8 h-8 text-primary-foreground" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg"
                >
                  <Crown className="w-3 h-3 text-white" />
                </motion.div>
              </motion.div>

              {/* Titre et description */}
              <div className="flex-1 min-w-0">
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                >
                  Détails du rendez-vous
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-1 text-sm text-muted-foreground flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  Personnalisez votre rendez-vous
                </motion.p>
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <form id="rdv-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Titre du rendez-vous */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3"
              >
                <Label htmlFor="rdv-titre" className="flex items-center gap-2 text-sm font-semibold">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Edit3 className="w-4 h-4 text-primary" />
                  </div>
                  Titre du rendez-vous
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="rdv-titre"
                    value={titre}
                    onChange={(e) => {
                      setTitre(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ex: Livraison perruque naturelle, Essayage..."
                    className={`h-14 px-5 text-base bg-muted/30 border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-primary/10 ${
                      error 
                        ? 'border-destructive focus:border-destructive' 
                        : 'border-border/50 focus:border-primary'
                    }`}
                    autoFocus
                  />
                  {titre.trim() && !error && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive flex items-center gap-2 mt-2"
                  >
                    <X className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <Label htmlFor="rdv-description" className="flex items-center gap-2 text-sm font-semibold">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  Description
                  <span className="text-xs text-muted-foreground font-normal ml-2 px-2 py-0.5 bg-muted rounded-full">
                    Optionnel
                  </span>
                </Label>
                <Textarea
                  id="rdv-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ajoutez des notes ou détails supplémentaires pour ce rendez-vous..."
                  className="min-h-[140px] px-5 py-4 text-base bg-muted/30 border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 resize-none"
                />
              </motion.div>
            </form>
          </div>

          {/* Footer fixe avec boutons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="relative px-8 py-5 border-t border-border/30 bg-gradient-to-t from-muted/30 to-transparent flex-shrink-0"
          >
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 h-14 rounded-2xl border-2 hover:bg-muted/50 transition-all duration-300 text-base font-medium"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="rdv-form"
                disabled={isLoading}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-base font-medium group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Diamond className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Créer le rendez-vous
                  </>
                )}
              </Button>
            </div>
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

export default RdvCreationModal;
