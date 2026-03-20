
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

/**
 * Bouton d'action réutilisable avec icône
 * Utilisé pour les actions primaires dans l'interface
 * 
 * @param icon - Composant d'icône Lucide
 * @param children - Texte du bouton ou éléments enfants
 * @param variant - Variante du bouton (style)
 * @param className - Classes CSS additionnelles
 * @param onClick - Fonction de clic
 */
interface ActionButtonProps extends ButtonProps {
  icon: LucideIcon;
  children: React.ReactNode;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(({ 
  icon: Icon,
  children, 
  variant = "default",
  className = "",
  onClick,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      className={`${className} card-3d`}
      onClick={onClick}
      {...props}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';

export default ActionButton;
