import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string | React.ReactNode;
  itemName?: string;
  isSubmitting?: boolean;
}

/**
 * Dialog de suppression premium avec design luxueux
 */
const PremiumDeleteDialog: React.FC<PremiumDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isSubmitting = false,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gradient-to-br from-white via-red-50/30 to-pink-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-red-200/20 to-pink-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-red-200/20 to-rose-200/20 rounded-full blur-3xl" />
        </div>

        <AlertDialogHeader className="relative text-center space-y-4 pb-2">
          {/* Premium icon container */}
          <div className="mx-auto relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <ShieldAlert className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl blur-xl opacity-40 -z-10 scale-110" />
          </div>

          <AlertDialogTitle className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-700 to-rose-700 bg-clip-text text-transparent">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="text-gray-600 text-center font-medium space-y-4">
              <div className="text-sm leading-relaxed">{description}</div>
              
              {itemName && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border-2 border-red-100 shadow-inner">
                  <div className="flex items-center gap-3 justify-center">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-red-800 font-bold text-base">{itemName}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 text-sm text-red-600 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>Cette action est irréversible</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="relative flex gap-3 pt-4 sm:flex-row">
          <AlertDialogCancel 
            className={cn(
              "flex-1 h-12 rounded-xl font-bold text-base",
              "bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100",
              "border-2 border-gray-200 hover:border-gray-300",
              "text-gray-700 hover:text-gray-900",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-300 transform hover:-translate-y-0.5",
              "flex items-center justify-center gap-2"
            )}
            disabled={isSubmitting}
          >
            <XCircle className="h-5 w-5" />
            Annuler
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-1 h-12 rounded-xl font-bold text-base",
              "bg-gradient-to-r from-red-500 via-red-600 to-rose-600",
              "hover:from-red-600 hover:via-red-700 hover:to-rose-700",
              "text-white border-0",
              "shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40",
              "transition-all duration-300 transform hover:-translate-y-0.5",
              "flex items-center justify-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            <Trash2 className="h-5 w-5" />
            {isSubmitting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PremiumDeleteDialog;
