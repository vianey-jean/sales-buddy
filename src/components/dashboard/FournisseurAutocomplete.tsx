import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Plus } from 'lucide-react';
import { fournisseurApiService, Fournisseur } from '@/services/api/fournisseurApi';
import { cn } from '@/lib/utils';

interface FournisseurAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  /** Dark theme variant for slate/dark modals */
  variant?: 'light' | 'dark';
  className?: string;
}

const FournisseurAutocomplete: React.FC<FournisseurAutocompleteProps> = ({
  value,
  onChange,
  variant = 'light',
  className,
}) => {
  const [suggestions, setSuggestions] = useState<Fournisseur[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value || value.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await fournisseurApiService.search(value);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('❌ Error searching fournisseurs:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = variant === 'dark';
  const exactMatch = suggestions.some(s => s.nom.toLowerCase() === value.toLowerCase());

  return (
    <div ref={containerRef} className={cn("space-y-2 relative", className)}>
      <Label className={cn(
        "text-sm font-bold flex items-center gap-2",
        isDark ? "text-white/80" : "text-gray-700"
      )}>
        <Truck className={cn("h-4 w-4", isDark ? "text-orange-400" : "text-orange-600")} />
        Fournisseur
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (value && suggestions.length > 0) setShowDropdown(true); }}
        placeholder="Saisir le nom du fournisseur..."
        className={cn(
          isDark
            ? "bg-white/10 border border-white/20 focus:border-orange-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
            : "h-12 px-4 bg-gradient-to-r from-white to-gray-50/80 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 focus:from-orange-50/50 focus:to-white rounded-xl shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-300 placeholder:text-gray-400 text-gray-900 font-medium"
        )}
      />

      {/* Dropdown */}
      {showDropdown && value.length >= 1 && (
        <div className={cn(
          "absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border shadow-2xl overflow-hidden max-h-48 overflow-y-auto",
          isDark
            ? "bg-slate-800/95 border-white/10 backdrop-blur-2xl"
            : "bg-white/95 border-orange-200/30 backdrop-blur-2xl"
        )}>
          {suggestions.map((f) => (
            <button
              key={f.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(f.nom);
                setShowDropdown(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2.5 flex items-center gap-2 transition-all duration-150 border-b last:border-0",
                isDark
                  ? "hover:bg-white/10 text-white/90 border-white/5"
                  : "hover:bg-orange-50 text-gray-800 border-orange-100/30"
              )}
            >
              <Truck className={cn("h-3.5 w-3.5 flex-shrink-0", isDark ? "text-orange-400" : "text-orange-500")} />
              <span className="font-semibold text-sm truncate">{f.nom}</span>
            </button>
          ))}

          {/* Show "new supplier" hint if no exact match */}
          {!exactMatch && value.length >= 2 && (
            <div className={cn(
              "px-4 py-2.5 flex items-center gap-2 border-t",
              isDark
                ? "bg-green-900/20 border-white/10 text-green-400"
                : "bg-green-50 border-green-100 text-green-700"
            )}>
              <Plus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-bold">
                Nouveau fournisseur : "<span className="font-black">{value}</span>" sera créé automatiquement
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FournisseurAutocomplete;
