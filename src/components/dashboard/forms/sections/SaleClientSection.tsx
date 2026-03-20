import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';
import ClientSearchInput from '../../ClientSearchInput';

interface SaleClientSectionProps {
  clientName: string;
  setClientName: (v: string) => void;
  clientPhone: string;
  setClientPhone: (v: string) => void;
  clientAddress: string;
  setClientAddress: (v: string) => void;
  onClientSelect: (client: any) => void;
  isSubmitting: boolean;
}

const SaleClientSection: React.FC<SaleClientSectionProps> = ({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  onClientSelect,
  isSubmitting,
}) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/10 border-0 shadow-xl shadow-blue-500/10 rounded-2xl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-300/20 rounded-full blur-2xl" />
      </div>
      <CardHeader className="relative pb-2">
        <CardTitle className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <Package className="h-4 w-4 text-white" />
          </div>
          Informations Client
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="space-y-2">
          <Label>Nom du client</Label>
          <ClientSearchInput
            value={clientName}
            onChange={setClientName}
            onClientSelect={onClientSelect}
            disabled={isSubmitting}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Numéro de téléphone"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              type="text"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Adresse du client"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleClientSection;
