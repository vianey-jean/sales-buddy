import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Calendar, Clock, MoveRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConflictingTache {
  id: string;
  description: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  travailleurNom: string;
  importance: string;
}

interface TacheConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictingTache: ConflictingTache | null;
  onReschedule: (tacheId: string, newDate: string, newHeureDebut: string, newHeureFin: string) => Promise<void>;
  onSkip: () => void;
}

const TacheConflictModal: React.FC<TacheConflictModalProps> = ({
  isOpen, onClose, conflictingTache, onReschedule, onSkip
}) => {
  const [newDate, setNewDate] = useState('');
  const [newHeureDebut, setNewHeureDebut] = useState('');
  const [newHeureFin, setNewHeureFin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && conflictingTache) {
      setNewDate(conflictingTache.date);
      setNewHeureDebut('');
      setNewHeureFin('');
    }
  }, [isOpen, conflictingTache]);

  if (!conflictingTache) return null;

  const handleReschedule = async () => {
    if (!newDate || !newHeureDebut || !newHeureFin) return;
    setIsSubmitting(true);
    try {
      await onReschedule(conflictingTache.id, newDate, newHeureDebut, newHeureFin);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gradient-to-br from-background via-background to-destructive/5 rounded-3xl border-2 border-destructive/20 shadow-2xl overflow-hidden"
        >
          <div className="px-8 pt-8 pb-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl shadow-amber-500/30 w-fit"
            >
              <AlertTriangle className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-foreground">
              ⚠️ Conflit d'horaire détecté
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Une tâche occupe déjà ce créneau. Voulez-vous la déplacer ?
            </p>
          </div>

          <div className="mx-6 mb-4 p-4 bg-muted/50 rounded-2xl border border-border/50">
            <p className="text-sm font-bold text-foreground">{conflictingTache.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              📅 {conflictingTache.date} • ⏰ {conflictingTache.heureDebut} - {conflictingTache.heureFin}
              {conflictingTache.travailleurNom && ` • ${conflictingTache.travailleurNom}`}
            </p>
          </div>

          <div className="mx-6 mb-4 space-y-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MoveRight className="w-4 h-4 text-primary" /> Nouveau créneau pour cette tâche :
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Nouvelle date
              </Label>
              <Input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Début
                </Label>
                <Input
                  type="time"
                  value={newHeureDebut}
                  onChange={e => setNewHeureDebut(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Fin
                </Label>
                <Input
                  type="time"
                  value={newHeureFin}
                  onChange={e => setNewHeureFin(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1 h-12 rounded-2xl"
            >
              Ignorer le conflit
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!newDate || !newHeureDebut || !newHeureFin || isSubmitting}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
            >
              {isSubmitting ? '...' : 'Déplacer et créer'}
            </Button>
          </div>

          <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TacheConflictModal;
