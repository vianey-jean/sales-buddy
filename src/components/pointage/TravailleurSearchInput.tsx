import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, User, X } from 'lucide-react';
import { Travailleur } from '@/services/api/travailleurApi';

interface TravailleurSearchInputProps {
  travailleurs: Travailleur[];
  selectedId: string;
  selectedNom: string;
  onSelect: (id: string, nom: string) => void;
  onClear: () => void;
  minChars?: number;
}

const TravailleurSearchInput: React.FC<TravailleurSearchInputProps> = ({
  travailleurs, selectedId, selectedNom, onSelect, onClear, minChars = 3
}) => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<Travailleur[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedNom && search === '') setSearch(selectedNom);
  }, [selectedNom]);

  useEffect(() => {
    if (search.length >= minChars) {
      const q = search.toLowerCase();
      setResults(travailleurs.filter(t =>
        `${t.prenom} ${t.nom}`.toLowerCase().includes(q) ||
        `${t.nom} ${t.prenom}`.toLowerCase().includes(q)
      ));
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [search, travailleurs, minChars]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
        <User className="h-4 w-4 text-purple-400" /> Personne
      </Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (selectedId) onClear();
            }}
            placeholder="Saisir au moins 3 caractères..."
            className="bg-white/10 border border-white/20 focus:border-purple-400 rounded-xl text-white placeholder:text-white/40 pl-10"
          />
        </div>
        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl bg-slate-800/95 backdrop-blur-2xl border border-white/20 shadow-2xl">
            {results.map(t => (
              <button key={t.id} type="button"
                onClick={() => {
                  onSelect(t.id, `${t.prenom} ${t.nom}`);
                  setSearch(`${t.prenom} ${t.nom}`);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  {t.prenom[0]}{t.nom[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.prenom} {t.nom}</div>
                  {t.phone && <div className="text-xs text-white/50">{t.phone}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
        {showDropdown && search.length >= minChars && results.length === 0 && (
          <div className="absolute z-50 w-full mt-1 rounded-xl bg-slate-800/95 backdrop-blur-2xl border border-white/20 shadow-2xl p-4 text-center">
            <p className="text-sm text-white/50">Aucun travailleur trouvé</p>
          </div>
        )}
        {selectedNom && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <User className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-300">{selectedNom}</span>
            <button onClick={() => { onClear(); setSearch(''); }}
              className="ml-auto text-white/50 hover:text-white transition-colors">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravailleurSearchInput;
