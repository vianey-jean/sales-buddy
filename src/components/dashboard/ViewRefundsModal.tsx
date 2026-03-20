import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RotateCcw, Euro, Package, Calendar } from 'lucide-react';
import remboursementApiService from '@/services/api/remboursementApi';
import PremiumLoading from '@/components/ui/premium-loading';

interface ViewRefundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ViewRefundsModal: React.FC<ViewRefundsModalProps> = ({ isOpen, onClose }) => {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRefunds();
    }
  }, [isOpen]);

  const loadRefunds = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const data = await remboursementApiService.getByMonth(now.getMonth() + 1, now.getFullYear());
      setRefunds(data);
    } catch (error) {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR');

  const totalRefunds = refunds.reduce((sum, r) => sum + (r.totalRefundPrice || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto
        bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-900 dark:to-amber-950/30
        backdrop-blur-xl border border-amber-100/50 dark:border-amber-800/30
        shadow-[0_40px_120px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)]
        rounded-2xl sm:rounded-3xl">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
              <RotateCcw className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Remboursements du mois
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-white/50 text-sm sm:text-base">
            Liste des remboursements effectués ce mois-ci
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <PremiumLoading text="Chargement..." size="sm" variant="ventes" />
        ) : refunds.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 mx-auto text-gray-300 dark:text-white/20 mb-3" />
            <p className="text-gray-400 dark:text-white/40">Aucun remboursement ce mois-ci</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Total */}
            <div className="p-4 bg-amber-50/80 dark:bg-amber-500/[0.06] border border-amber-200/60 dark:border-amber-500/20 rounded-xl backdrop-blur-sm flex justify-between items-center shadow-sm">
              <span className="font-bold text-amber-700 dark:text-amber-400">
                Total: {refunds.length} remboursement(s)
              </span>
              <span className="font-black text-lg text-amber-700 dark:text-amber-400">
                {formatCurrency(totalRefunds)}
              </span>
            </div>

            {refunds.map((refund) => (
              <div
                key={refund.id}
                className="p-4
                  bg-gray-50/80 dark:bg-white/[0.04]
                  border border-gray-200/60 dark:border-white/[0.08]
                  rounded-xl backdrop-blur-sm space-y-2 transition-all duration-300
                  hover:border-amber-300 dark:hover:border-amber-500/20
                  shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-800 dark:text-white/90">{refund.clientName || 'Client inconnu'}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-white/40">
                    <Calendar className="h-3 w-3" />
                    {formatDate(refund.date)}
                  </div>
                </div>
                {refund.products?.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white/80 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/[0.06] rounded-lg p-2.5 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-white/70">{p.description}</span>
                      <span className="text-gray-400 dark:text-white/40">x{p.quantityRefunded}</span>
                    </div>
                    <span className="font-black text-amber-700 dark:text-amber-400">{formatCurrency(p.totalRefundPrice)}</span>
                  </div>
                ))}
                <div className="flex justify-end">
                  <span className="font-black text-amber-700 dark:text-amber-400">
                    {formatCurrency(refund.totalRefundPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewRefundsModal;
