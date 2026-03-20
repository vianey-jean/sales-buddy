// Carte d'affichage d'un client
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Edit, Trash2, Crown, Star } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientCardProps {
  client: Client;
  index: number;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onPhoneClick: (phone: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  index,
  onEdit,
  onDelete,
  onPhoneClick,
}) => {
  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 bg-gradient-to-br from-white via-gray-50 to-purple-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-purple-900/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-purple-500/25 relative overflow-hidden"
      style={{
        animationDelay: `${index * 150}ms`
      }}
    >
      {/* Premium Badge animé */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 animate-bounce">
        <Star className="w-3 h-3 inline mr-1" />
        ÉLITE
      </div>
      
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Halo lumineux */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              {client.nom}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span className="inline-flex items-center gap-1">
                <Crown className="w-3 h-3 text-yellow-500" />
                Membre depuis le {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        {/* Téléphone - cliquable */}
        <div 
          className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/50 dark:hover:to-green-900/50 transition-all"
          onClick={() => onPhoneClick(client.phone)}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shrink-0 shadow-lg">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Téléphone</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.phone}</p>
          </div>
        </div>
        
        {/* Adresse */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shrink-0 shadow-lg">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Adresse</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{client.adresse}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(client)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(client)}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
