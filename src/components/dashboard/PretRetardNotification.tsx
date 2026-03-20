import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Clock, X } from 'lucide-react';
import { PretProduit } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface PretRetardNotificationProps {
  prets: PretProduit[];
}

const PretRetardNotification: React.FC<PretRetardNotificationProps> = ({ prets }) => {
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>(() => {
    // Récupérer les notifications déjà vues depuis localStorage
    const stored = localStorage.getItem('dismissedNotifications');
    return stored ? JSON.parse(stored) : [];
  });

  // Filtrer les prêts en retard
  const pretsEnRetard = prets.filter((pret) => {
    if (pret.estPaye || !pret.datePaiement) return false;

    const datePaiement = new Date(pret.datePaiement);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    datePaiement.setHours(0, 0, 0, 0);

    return datePaiement < aujourdhui && !dismissedNotifications.includes(pret.id);
  });

  const dismissNotification = (pretId: string) => {
    setDismissedNotifications((prev) => {
      const updated = [...prev, pretId];
      localStorage.setItem('dismissedNotifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Fermer automatiquement chaque notification après 5 secondes
  useEffect(() => {
    const timers = pretsEnRetard.map((pret) =>
      setTimeout(() => dismissNotification(pret.id), 10000)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [pretsEnRetard]);

  if (pretsEnRetard.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-h-[80vh] w-96 overflow-y-auto space-y-2">
      <AnimatePresence>
        {pretsEnRetard.map((pret) => (
          <motion.div
            key={pret.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="w-full"
          >
            <Alert className="bg-red-50 border-red-200 animate-pulse">
              <Clock className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Prêt en retard!</p>
                    <p className="text-sm mb-2">
                      <strong>{pret.nom || 'Client'}</strong> - {pret.description}
                    </p>
                    <p className="text-sm mb-2">
                      Date de paiement dépassée: {new Date(pret.datePaiement!).toLocaleDateString('fr-FR')}
                    </p>
                    {pret.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>Contactez au: {pret.phone}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => dismissNotification(pret.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PretRetardNotification;
