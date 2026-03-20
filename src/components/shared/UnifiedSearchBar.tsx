import React, { useState, useCallback, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UnifiedSearchBarProps {
  /** Valeur de recherche actuelle */
  value: string;
  /** Callback appelé lors du changement de valeur */
  onChange: (value: string) => void;
  /** Placeholder du champ de recherche */
  placeholder?: string;
  /** Label affiché avant le champ (optionnel) */
  label?: string;
  /** Nombre minimum de caractères avant recherche */
  minChars?: number;
  /** Message affiché si minChars non atteint */
  minCharsMessage?: string;
  /** Nombre de résultats trouvés (pour affichage) */
  resultsCount?: number;
  /** Classes CSS additionnelles pour le container */
  className?: string;
  /** Afficher dans une Card ou non */
  withCard?: boolean;
  /** Variante de style */
  variant?: 'default' | 'compact' | 'hero';
  /** Délai de debounce en ms (0 = pas de debounce) */
  debounceMs?: number;
  /** Désactiver le champ */
  disabled?: boolean;
  /** ID pour l'accessibilité */
  id?: string;
}

/**
 * Composant de barre de recherche unifiée et réutilisable
 * Utilise les tokens de design du système
 * Accessible (WCAG 2.1 AA)
 */
const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = memo(({
  value,
  onChange,
  placeholder = "Rechercher...",
  label,
  minChars = 0,
  minCharsMessage,
  resultsCount,
  className,
  withCard = true,
  variant = 'default',
  debounceMs = 0,
  disabled = false,
  id = 'unified-search'
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    if (debounceMs > 0) {
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
      setDebounceTimer(timer);
    } else {
      onChange(newValue);
    }
  }, [onChange, debounceMs, debounceTimer]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange('');
  }, [onChange]);

  const displayValue = debounceMs > 0 ? internalValue : value;
  const showMinCharsWarning = minChars > 0 && displayValue.length > 0 && displayValue.length < minChars;
  const showResultsCount = resultsCount !== undefined && displayValue.length >= minChars;

  const variantStyles = {
    default: 'p-4 sm:p-6',
    compact: 'p-3 sm:p-4',
    hero: 'p-4 sm:p-6 md:p-8'
  };

  const inputStyles = {
    default: 'py-3 sm:py-4 text-base sm:text-lg',
    compact: 'py-2 sm:py-3 text-sm sm:text-base',
    hero: 'py-4 sm:py-5 text-lg sm:text-xl'
  };

  const SearchContent = (
    <div className={cn("flex flex-col gap-4", !withCard && className)}>
      {label && (
        <Label 
          htmlFor={id} 
          className="text-base sm:text-lg font-semibold text-foreground whitespace-nowrap"
        >
          {label}
        </Label>
      )}
      
      <div className="relative w-full">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" 
          aria-hidden="true"
        />
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 sm:pl-12 pr-12 border-2 border-input focus:border-primary rounded-xl bg-background transition-all duration-300",
            inputStyles[variant]
          )}
          aria-label={label || placeholder}
          aria-describedby={`${id}-description`}
        />
        {displayValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted rounded-full"
            aria-label="Effacer la recherche"
            type="button"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Messages de statut */}
      <div id={`${id}-description`} className="sr-only">
        {minChars > 0 && `Saisissez au moins ${minChars} caractères pour rechercher`}
      </div>

      {showMinCharsWarning && minCharsMessage && (
        <div className="text-sm sm:text-base text-amber-600 dark:text-amber-400 font-medium animate-in fade-in-50">
          {minCharsMessage}
        </div>
      )}

      {showResultsCount && (
        <div className="text-sm sm:text-base text-primary font-medium animate-in fade-in-50">
          {resultsCount} résultat{resultsCount !== 1 ? 's' : ''} trouvé{resultsCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );

  if (!withCard) {
    return SearchContent;
  }

  return (
    <Card className={cn(
      "bg-card/80 backdrop-blur-sm border-2 border-border shadow-xl hover:shadow-2xl transition-all duration-300",
      className
    )}>
      <CardContent className={variantStyles[variant]}>
        {SearchContent}
      </CardContent>
    </Card>
  );
});

UnifiedSearchBar.displayName = 'UnifiedSearchBar';

export default UnifiedSearchBar;
