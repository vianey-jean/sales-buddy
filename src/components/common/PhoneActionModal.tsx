// Modale pour les actions téléphoniques
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PhoneCall, MessageSquare } from 'lucide-react';

interface PhoneActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  isMobile: boolean;
  onCall: () => void;
  onMessage: () => void;
}

const PhoneActionModal: React.FC<PhoneActionModalProps> = ({
  isOpen,
  onClose,
  phone,
  isMobile,
  onCall,
  onMessage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-200 dark:border-blue-700 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <PhoneCall className="w-5 h-5 text-blue-500" />
            Action pour {phone}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Choisissez une action à effectuer
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={onCall}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <PhoneCall className="w-5 h-5" />
            Appeler ce numéro
          </Button>
          
          <Button
            onClick={onMessage}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <MessageSquare className="w-5 h-5" />
            {isMobile ? 'Envoyer un SMS à ce numéro' : 'Envoyer un message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneActionModal;
