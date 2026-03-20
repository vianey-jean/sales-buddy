import React, { memo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface AddressActionModalProps {
  /** État d'ouverture */
  open: boolean;
  /** Callback de changement d'état */
  onOpenChange: (open: boolean) => void;
  /** Adresse à ouvrir */
  address: string;
}

/**
 * Modal de choix d'application de navigation
 * Affiche les options Google Maps, Waze et Apple Maps
 */
const AddressActionModal: React.FC<AddressActionModalProps> = memo(({
  open,
  onOpenChange,
  address
}) => {
  const openGoogleMaps = useCallback(() => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    onOpenChange(false);
  }, [address, onOpenChange]);

  const openWaze = useCallback(() => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://waze.com/ul?q=${encodedAddress}`, '_blank');
    onOpenChange(false);
  }, [address, onOpenChange]);

  const openAppleMaps = useCallback(() => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.apple.com/?q=${encodedAddress}`, '_blank');
    onOpenChange(false);
  }, [address, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Navigation className="h-5 w-5 text-primary" />
            Navigation
          </DialogTitle>
          <DialogDescription className="text-base">
            Ouvrir l'adresse dans quelle application ?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={openGoogleMaps}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6"
          >
            <MapPin className="h-5 w-5 mr-3" />
            Google Maps
          </Button>
          
          <Button
            onClick={openWaze}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-6"
          >
            <Navigation className="h-5 w-5 mr-3" />
            Waze
          </Button>
          
          <Button
            onClick={openAppleMaps}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-6"
          >
            <MapPin className="h-5 w-5 mr-3" />
            Apple Maps
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

AddressActionModal.displayName = 'AddressActionModal';

export default AddressActionModal;

/**
 * Hook utilitaire pour gérer l'ouverture d'adresse avec modal sur mobile
 */
export const useAddressNavigation = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState('');

  const handleAddressClick = useCallback((address: string) => {
    if (isMobile) {
      setSelectedAddress(address);
      setIsOpen(true);
    } else {
      // Sur desktop, ouvrir directement Google Maps
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  }, [isMobile]);

  return {
    isOpen,
    setIsOpen,
    selectedAddress,
    handleAddressClick
  };
};
