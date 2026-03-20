// Formulaire d'ajout/modification de client
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientFormData } from '@/types/client';
import { Sparkles } from 'lucide-react';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  isEditing: boolean;
  isSubmitting: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-200 dark:border-purple-700 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            {isEditing ? 'Modifier le Client Élite' : 'Nouveau Client Élite'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            {isEditing 
              ? 'Modifiez les informations de votre client VIP' 
              : 'Ajoutez un nouveau membre à votre cercle élite'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                Nom complet
              </Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Entrez le nom du client..."
                className="border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-xl py-3 text-base sm:text-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Numéro de téléphone..."
                className="border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-xl py-3 text-base sm:text-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse" className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                Adresse
              </Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse complète..."
                className="border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-xl py-3 text-base sm:text-lg"
                required
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? 'En cours...' : (isEditing ? 'Mettre à jour' : 'Ajouter le client')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
