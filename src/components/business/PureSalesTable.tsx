
import React from 'react';
import { Sale } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormatService } from '@/services/FormatService';

/**
 * Props pour le composant PureSalesTable (immuables)
 */
interface PureSalesTableProps {
  readonly sales: readonly Sale[];
  readonly onEditSale?: (sale: Sale) => void;
  readonly onDeleteSale?: (saleId: string) => void;
  readonly onRowClick?: (sale: Sale) => void;
  readonly className?: string;
  readonly loading?: boolean;
}

/**
 * Composant pur pour afficher un tableau de ventes
 * - Props immuables uniquement
 * - Aucun état interne
 * - Aucun effet de bord
 * - Mémoïsé pour éviter les re-renders inutiles
 */
const PureSalesTable: React.FC<PureSalesTableProps> = React.memo(({
  sales,
  onEditSale,
  onDeleteSale,
  onRowClick,
  className,
  loading = false
}) => {
  /**
   * Gestionnaire de clic sur une ligne (fonction pure)
   */
  const handleRowClick = React.useCallback((sale: Sale) => {
    onRowClick?.(sale);
  }, [onRowClick]);

  /**
   * Gestionnaire d'édition (fonction pure)
   */
  const handleEdit = React.useCallback((e: React.MouseEvent, sale: Sale) => {
    e.stopPropagation(); // Empêche le clic sur la ligne
    onEditSale?.(sale);
  }, [onEditSale]);

  /**
   * Gestionnaire de suppression (fonction pure)
   */
  const handleDelete = React.useCallback((e: React.MouseEvent, saleId: string) => {
    e.stopPropagation(); // Empêche le clic sur la ligne
    onDeleteSale?.(saleId);
  }, [onDeleteSale]);

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className={cn("text-center py-12 text-muted-foreground", className)}>
        <p>Aucune vente enregistrée pour cette période</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead className="text-right">Prix de vente</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Bénéfice</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow
              key={sale.id}
              className={cn(
                "cursor-pointer hover:bg-muted/50 transition-colors",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => handleRowClick(sale)}
            >
              <TableCell className="font-medium">
                {FormatService.formatDate(sale.date)}
              </TableCell>
              <TableCell>{sale.description}</TableCell>
              <TableCell className="text-right font-medium">
                {FormatService.formatCurrency(sale.sellingPrice)}
              </TableCell>
              <TableCell className="text-right">
                {FormatService.formatNumber(sale.quantitySold)}
              </TableCell>
              <TableCell className={cn(
                "text-right font-medium",
                sale.profit >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {FormatService.formatCurrency(sale.profit)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onEditSale && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(e, sale)}
                      className="h-8 w-8 p-0"
                      aria-label={`Modifier la vente ${sale.description}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDeleteSale && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, sale.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      aria-label={`Supprimer la vente ${sale.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

PureSalesTable.displayName = 'PureSalesTable';

export default PureSalesTable;
