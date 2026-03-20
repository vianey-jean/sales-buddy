
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientSync } from '@/hooks/useClientSync';

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
}

interface ClientSearchInputProps {
  onClientSelect: (client: Client | null) => void;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ClientSearchInput: React.FC<ClientSearchInputProps> = ({
  onClientSelect,
  value,
  onChange,
  disabled = false
}) => {
  const { searchClients } = useClientSync();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recherche des clients
  useEffect(() => {
    if (isSelecting) {
      setIsSelecting(false);
      return;
    }

    if (value.length >= 3) {
      const results = searchClients(value);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value, searchClients, isSelecting]);

  // Gestion clic à l'extérieur et changement de focus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleFocusChange = (event: FocusEvent) => {
      // Si le focus va vers un autre élément qui n'est pas le dropdown
      if (
        event.target !== inputRef.current &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleFocusChange);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, []);

  // Sélection d'un client
  const handleClientSelect = (client: Client) => {
    setIsSelecting(true);
    onChange(client.nom);
    onClientSelect(client);
    setSuggestions([]);
    setIsOpen(false); // Fermer immédiatement le dropdown
  };

  // Changement dans l'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.length < 3) {
      onClientSelect(null);
    }
  };

  // Gestionnaire pour fermer le dropdown quand on clique ailleurs dans le formulaire
  const handleInputBlur = () => {
    // Délai pour permettre au clic sur une suggestion de s'exécuter
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
<div className="relative">
  {/* Label avec espace en bas */}
  

  {/* Champ de saisie */}
  <Input
    ref={inputRef}
    id="clientName"
    value={value}
    onChange={handleInputChange}
    onBlur={handleInputBlur}
    placeholder="Saisir au moins 3 caractères pour rechercher..."
    disabled={disabled}
    autoComplete="off"
  />

  {/* Liste des suggestions - affiche min 3 clients avec scroll */}
  {isOpen && suggestions.length > 0 && (
    <div
      ref={dropdownRef}
      className="bg-background border border-border rounded-lg shadow-xl max-h-60 overflow-auto"
      style={{
        maxHeight: '240px',
        minHeight: suggestions.length >= 3 ? '180px' : 'auto',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
      }}
    >
      <div className="py-1">
        {suggestions.map((client, index) => (
          <button
            key={client.id}
            type="button"
            className="w-full px-4 py-3 text-left hover:bg-accent border-b border-border last:border-b-0 focus:bg-accent focus:outline-none transition-colors"
            onClick={() => handleClientSelect(client)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">
                  {client.nom}
                </div>
                <div className="text-sm text-muted-foreground">
                  {client.phone}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {client.adresse}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {suggestions.length > 3 && (
        <div className="sticky bottom-0 bg-gradient-to-t from-background to-transparent py-2 text-center">
          <span className="text-xs text-muted-foreground">
            ↓ Faites défiler pour voir plus ({suggestions.length} clients)
          </span>
        </div>
      )}
    </div>
  )}
</div>
  );
};

export default ClientSearchInput;
