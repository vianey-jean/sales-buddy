/**
 * =============================================================================
 * Composant SaleQuantityInput
 * =============================================================================
 * 
 * Composant réutilisable pour la saisie de quantité avec boutons + et -.
 * Gère automatiquement la validation par rapport au stock disponible.
 * 
 * @module SaleQuantityInput
 * @version 2.0.0 - Support des deux types de props (quantity/value)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Props du composant SaleQuantityInput
 * Supporte à la fois 'quantity' et 'value' pour la rétrocompatibilité
 */
interface SaleQuantityInputProps {
  /** Valeur de la quantité (alias principal) */
  quantity?: string;
  /** Valeur de la quantité (alias alternatif pour rétrocompatibilité) */
  value?: string;
  /** Quantité maximum disponible en stock */
  maxQuantity?: number;
  /** Callback appelé lors du changement de quantité */
  onChange: (quantity: string) => void;
  /** Désactiver le composant */
  disabled?: boolean;
  /** Afficher le stock disponible */
  showAvailableStock?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant pour gérer la saisie de la quantité vendue avec des boutons + et -
 * Gère automatiquement la validation et les notifications de stock insuffisant
 */
const SaleQuantityInput: React.FC<SaleQuantityInputProps> = ({ 
  quantity,
  value,
  maxQuantity = 999999, 
  onChange, 
  disabled = false,
  showAvailableStock = true,
  className
}) => {
  const { toast } = useToast();
  
  // Support des deux props: quantity (prioritaire) ou value (rétrocompatibilité)
  const currentValue = quantity ?? value ?? '1';

  /**
   * Gère l'incrémentation/décrémentation de la quantité
   * Vérifie automatiquement les limites (min 1, max stock)
   */
  const handleQuantityChange = (increment: boolean) => {
    const currentQty = Number(currentValue);
    let newQty = increment ? currentQty + 1 : currentQty - 1;

    // Ne pas permettre de quantité inférieure à 1
    if (newQty < 1) newQty = 1;
    
    // Vérifier si la quantité demandée ne dépasse pas le stock disponible
    if (increment && newQty > maxQuantity) {
      toast({
        title: "Quantité insuffisante",
        description: `Stock disponible: ${maxQuantity} unités`,
        variant: "destructive",
      });
      return;
    }

    onChange(newQty.toString());
  };

  /**
   * Gère la saisie manuelle dans le champ input
   * Valide automatiquement par rapport au stock
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = Number(e.target.value);
    
    // Vérifier si la quantité ne dépasse pas le stock disponible
    if (numValue > maxQuantity) {
      toast({
        title: "Quantité insuffisante",
        description: `Stock disponible: ${maxQuantity} unités`,
        variant: "destructive",
      });
      return;
    }
    
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="flex items-center space-x-2">
        {/* Bouton pour diminuer la quantité */}
        <Button 
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(false)}
          disabled={disabled}
          className="shrink-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        {/* Champ de saisie de la quantité */}
        <Input
          id="quantitySold"
          name="quantitySold"
          type="number"
          min="1"
          value={currentValue}
          onChange={handleInputChange}
          disabled={disabled}
          className="text-center"
        />
        
        {/* Bouton pour augmenter la quantité */}
        <Button 
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(true)}
          disabled={disabled}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Afficher le stock disponible */}
      {showAvailableStock && maxQuantity < 999999 && (
        <p className="text-xs text-muted-foreground">
          Stock disponible: {maxQuantity} unités
        </p>
      )}
    </div>
  );
};

export default SaleQuantityInput;
