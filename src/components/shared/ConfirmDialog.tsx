import React, { memo, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react';

export interface ConfirmDialogProps {
  /** État d'ouverture du dialog */
  open: boolean;
  /** Callback de changement d'état */
  onOpenChange: (open: boolean) => void;
  /** Titre du dialog */
  title: string;
  /** Description/message du dialog */
  description: string;
  /** Texte du bouton de confirmation */
  confirmText?: string;
  /** Texte du bouton d'annulation */
  cancelText?: string;
  /** Callback de confirmation */
  onConfirm: () => void;
  /** Callback d'annulation (optionnel) */
  onCancel?: () => void;
  /** Variante du dialog */
  variant?: 'danger' | 'warning' | 'info' | 'success';
  /** Chargement en cours */
  isLoading?: boolean;
  /** Désactiver les boutons */
  disabled?: boolean;
  /** Contenu additionnel */
  children?: ReactNode;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColor: 'text-destructive',
    buttonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    buttonClass: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    buttonClass: 'bg-blue-500 text-white hover:bg-blue-600',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    buttonClass: 'bg-emerald-500 text-white hover:bg-emerald-600',
  },
};

/**
 * Dialog de confirmation réutilisable
 * Accessible et stylé selon le design system
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = memo(({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false,
  disabled = false,
  children
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (!isLoading && !disabled) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-0 shadow-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "p-2 rounded-full",
              variant === 'danger' && "bg-destructive/10",
              variant === 'warning' && "bg-amber-500/10",
              variant === 'info' && "bg-blue-500/10",
              variant === 'success' && "bg-emerald-500/10"
            )}>
              <IconComponent className={cn("h-5 w-5", config.iconColor)} />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <AlertDialogFooter className="gap-3 sm:gap-2">
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-secondary hover:bg-secondary/80"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || disabled}
            className={cn(config.buttonClass, "min-w-[100px]")}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Chargement...
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;
