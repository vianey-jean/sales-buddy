/**
 * =============================================================================
 * RdvSearchBar - Barre de recherche avec suggestions pour les RDV
 * =============================================================================
 * 
 * Recherche avec auto-complétion, affiche les résultats en dropdown.
 * Minimum 3 caractères pour déclencher la recherche.
 * 
 * @module RdvSearchBar
 */

import React, { useRef, useEffect } from 'react';
import { RDV } from '@/types/rdv';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Clock, User, Edit, Trash2, CalendarX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RdvSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearchSuggestions: boolean;
  setShowSearchSuggestions: (show: boolean) => void;
  searchSuggestions: RDV[];
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  onSuggestionClick: (rdv: RDV) => void;
  onEditRdv: (rdv: RDV) => void;
  onDeleteRdv: (rdv: RDV) => void;
}

const RdvSearchBar: React.FC<RdvSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  showSearchSuggestions,
  setShowSearchSuggestions,
  searchSuggestions,
  statusColors,
  statusLabels,
  onSuggestionClick,
  onEditRdv,
  onDeleteRdv,
}) => {
  const searchRef = useRef<HTMLDivElement>(null);

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSearchSuggestions]);

  return (
    <div ref={searchRef} className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchSuggestions(e.target.value.length >= 3);
          }}
          onFocus={() => {
            if (searchQuery.length >= 3) setShowSearchSuggestions(true);
          }}
          placeholder="Rechercher un rendez-vous (min. 3 caractères)..."
          className="pl-12 h-14 text-lg rounded-xl border-2 border-primary/20 focus:border-primary bg-background/80 backdrop-blur-sm shadow-lg"
        />
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSearchSuggestions && searchSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-primary/20 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 bg-primary/5 border-b border-primary/10">
              <p className="text-sm font-medium text-muted-foreground">
                {searchSuggestions.length} résultat(s) pour "{searchQuery}"
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchSuggestions.map((rdv) => (
                <motion.div
                  key={rdv.id}
                  whileHover={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                  onClick={() => onSuggestionClick(rdv)}
                  className="p-4 cursor-pointer border-b border-primary/10 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-white text-xs", statusColors[rdv.statut])}>
                          {statusLabels[rdv.statut]}
                        </Badge>
                        <span className="font-semibold">{rdv.titre}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{rdv.clientNom}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(parseISO(rdv.date), 'd MMM', { locale: fr })}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rdv.heureDebut}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn("h-8 w-8", rdv.statut === 'confirme' ? "text-gray-400 cursor-not-allowed opacity-50" : "text-blue-600 hover:bg-blue-100")}
                        onClick={(e) => { e.stopPropagation(); if (rdv.statut !== 'confirme') onEditRdv(rdv); }}
                        disabled={rdv.statut === 'confirme'}
                        title={rdv.statut === 'confirme' ? "Impossible de modifier un rendez-vous confirmé" : "Modifier"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:bg-red-100"
                        onClick={(e) => { e.stopPropagation(); onDeleteRdv(rdv); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      <AnimatePresence>
        {showSearchSuggestions && searchQuery.length >= 3 && searchSuggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-primary/20 rounded-xl shadow-2xl z-50 p-6 text-center"
          >
            <CalendarX className="h-12 w-12 mx-auto text-red-800 mb-2 font-bold" />
            <p className="text-red-800 font-bold">Aucun rendez-vous trouvé pour "{searchQuery}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RdvSearchBar;
