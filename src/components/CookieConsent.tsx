import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONSENT_KEY = 'rgpd_cookie_consent';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] max-w-lg mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 backdrop-blur-xl">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground text-sm">Protection de vos données (RGPD)</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Ce site utilise des cookies essentiels pour son fonctionnement. 
                  Vos données personnelles sont protégées conformément au RGPD. 
                  Aucune donnée n'est partagée avec des tiers sans votre consentement.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={decline} className="text-xs">
                Refuser
              </Button>
              <Button size="sm" onClick={accept} className="text-xs">
                Accepter
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
