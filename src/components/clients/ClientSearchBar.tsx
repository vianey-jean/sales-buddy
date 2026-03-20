// Barre de recherche pour les clients
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ClientSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
}

const ClientSearchBar: React.FC<ClientSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  filteredCount,
}) => {
  return (
    <div className="mb-8 sm:mb-10 md:mb-12">
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Label htmlFor="search" className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
              Rechercher un client
            </Label>
            <div className="relative w-full">
              <Input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Saisissez au moins 3 caractères (nom, téléphone, adresse)..."
                className="w-full pl-4 pr-12 py-3 sm:py-4 text-base sm:text-lg border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-xl bg-white dark:bg-gray-900 transition-all duration-300"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full"
                >
                  <span className="text-xl text-gray-500 dark:text-gray-400">×</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Indicateur de résultats */}
          {searchQuery.length >= 3 && (
            <div className="mt-4 text-sm sm:text-base text-purple-700 dark:text-purple-300 font-medium">
              {filteredCount} résultat{filteredCount > 1 ? 's' : ''} trouvé{filteredCount > 1 ? 's' : ''}
            </div>
          )}
          
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <div className="mt-4 text-sm sm:text-base text-orange-600 dark:text-orange-400 font-medium">
              Saisissez au moins 3 caractères pour lancer la recherche
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSearchBar;
