// Grille de clients avec pagination
import React from 'react';
import { Client } from '@/types/client';
import ClientCard from './ClientCard';
import { Button } from '@/components/ui/button';

interface ClientsGridProps {
  clients: Client[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onPhoneClick: (phone: string) => void;
}

const ClientsGrid: React.FC<ClientsGridProps> = ({
  clients,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onPhoneClick,
}) => {
  return (
    <>
      {/* Grille des clients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {clients.map((client, index) => (
          <ClientCard
            key={client.id}
            client={client}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onPhoneClick={onPhoneClick}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10 md:mt-12 flex-wrap">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-white/80 dark:bg-gray-800/80 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl"
          >
            Précédent
          </Button>
          
          <div className="flex gap-1 sm:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 p-0 rounded-xl ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0'
                    : 'bg-white/80 dark:bg-gray-800/80 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                }`}
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-white/80 dark:bg-gray-800/80 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl"
          >
            Suivant
          </Button>
        </div>
      )}
      
      {/* Message si aucun client */}
      {clients.length === 0 && (
        <div className="text-center py-12 sm:py-16 md:py-20">
          <div className="text-gray-400 dark:text-gray-500 text-lg sm:text-xl">
            Aucun client trouvé
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Ajoutez votre premier client élite pour commencer
          </p>
        </div>
      )}
    </>
  );
};

export default ClientsGrid;
