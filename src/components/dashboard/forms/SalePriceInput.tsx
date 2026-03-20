
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SalePriceInputProps {
  price: string;
  onChange: (price: string) => void;
  disabled: boolean;
  isProfitNegative?: boolean; // Added this as an optional prop
}

/**
 * Composant pour la saisie du prix de vente
 */
const SalePriceInput: React.FC<SalePriceInputProps> = ({
  price,
  onChange,
  disabled,
  isProfitNegative = false,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="sellingPrice">Prix de vente (€)</Label>
      <Input
        id="sellingPrice"
        name="sellingPrice"
        type="number"
        step="0.01"
        min="0"
        value={price}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={isProfitNegative ? "border-red-500" : ""}
      />
      {isProfitNegative && (
        <p className="text-xs text-red-500">
          Le prix de vente est trop bas, vous allez faire une perte !
        </p>
      )}
    </div>
  );
};

export default SalePriceInput;
