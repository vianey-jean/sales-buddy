// Hook pour les actions téléphoniques (appel, SMS)
import { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

export const usePhoneActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string>('');
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const openPhoneDialog = useCallback((phone: string) => {
    setSelectedPhone(phone);
    setIsOpen(true);
  }, []);

  const closePhoneDialog = useCallback(() => {
    setIsOpen(false);
    setSelectedPhone('');
  }, []);

  const handleCall = useCallback(() => {
    window.location.href = `tel:${selectedPhone}`;
    closePhoneDialog();
  }, [selectedPhone, closePhoneDialog]);

  const handleMessage = useCallback(() => {
    if (isMobile) {
      // Sur mobile, ouvrir l'app SMS
      window.location.href = `sms:${selectedPhone}`;
    } else {
      // Sur desktop, afficher un toast
      toast({
        title: "Message",
        description: `Préparez un message pour ${selectedPhone}`,
        className: "notification-success",
      });
    }
    closePhoneDialog();
  }, [isMobile, selectedPhone, closePhoneDialog, toast]);

  return {
    isOpen,
    selectedPhone,
    isMobile,
    openPhoneDialog,
    closePhoneDialog,
    handleCall,
    handleMessage,
  };
};

export default usePhoneActions;
