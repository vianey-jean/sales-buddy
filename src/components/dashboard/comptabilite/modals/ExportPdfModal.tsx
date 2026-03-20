/**
 * ExportPdfModal - Modal pour exporter les données en PDF
 */

import React, { useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import nouvelleAchatApiService from '@/services/api/nouvelleAchatApi';
import { Sale } from '@/types/sale';
import { toast } from '@/hooks/use-toast';
import { MONTHS } from '@/hooks/useComptabilite';

export interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportMonth: number;
  exportYear: number;
  setExportMonth: (month: number) => void;
  setExportYear: (year: number) => void;
  allSales: Sale[];
}

const currentYear = new Date().getFullYear(); // année en cours
const years = Array.from({ length: 7 }, (_, i) => currentYear - 4 + i);
// commence 4 ans avant, puis +1 chaque fois, jusqu'à 2 ans après

const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  exportMonth,
  exportYear,
  setExportMonth,
  setExportYear,
  allSales
}) => {
  const handleExportPDF = useCallback(async () => {
    try {
      const exportAchats = await nouvelleAchatApiService.getByMonthYear(exportYear, exportMonth);

      const exportSales = allSales.filter(sale => {
        const date = new Date(sale.date);
        return date.getMonth() + 1 === exportMonth && date.getFullYear() === exportYear;
      });

      // Calculs
      const salesTotal = exportSales.reduce((sum, sale) => {
        if (sale.products && Array.isArray(sale.products)) {
          return sum + (sale.totalSellingPrice || 0);
        }
        return sum + sale.sellingPrice * sale.quantitySold;
      }, 0);

      const salesProfit = exportSales.reduce((sum, sale) => {
        if (sale.products && Array.isArray(sale.products)) {
          return sum + (sale.totalProfit || 0);
        }
        return sum + sale.profit;
      }, 0);

      const achatsProducts = exportAchats.filter(a => a.type === 'achat_produit');
      const depenses = exportAchats.filter(a => a.type !== 'achat_produit');

      const achatsTotal = achatsProducts.reduce((sum, a) => sum + a.totalCost, 0);
      const depensesTotal = depenses.reduce((sum, a) => sum + a.totalCost, 0);
      const beneficeReel = salesProfit - (achatsTotal + depensesTotal);

      // Création du PDF
      const doc = new jsPDF();
      const monthName = MONTHS[exportMonth - 1];

      doc.setFontSize(20);
      doc.setTextColor(0, 90, 0);
      doc.text(`Comptabilité - ${monthName} ${exportYear}`, 105, 20, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Document privé - Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 28, { align: 'center' });

      doc.setDrawColor(180, 180, 180);
      doc.line(14, 32, 196, 32);

      let yPosition = 40;

      // Section Ventes
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 0);
      doc.text('VENTES', 14, yPosition);
      yPosition += 5;

      if (exportSales.length > 0) {
        const salesData = exportSales.map(sale => {
          const productName = sale.products && Array.isArray(sale.products)
            ? sale.products.map(p => p.description).join(', ')
            : sale.description || 'Produit';
          const qty = sale.products && Array.isArray(sale.products)
            ? sale.products.reduce((sum, p) => sum + (p.quantitySold || 0), 0)
            : sale.quantitySold || 0;
          const total = sale.products && Array.isArray(sale.products)
            ? sale.totalSellingPrice || 0
            : (sale.sellingPrice || 0) * (sale.quantitySold || 0);
          const profit = sale.products && Array.isArray(sale.products)
            ? sale.totalProfit || 0
            : sale.profit || 0;

          return [
            new Date(sale.date).toLocaleDateString('fr-FR'),
            productName.substring(0, 30),
            qty.toString(),
            `${total.toFixed(2)} €`,
            `${profit.toFixed(2)} €`
          ];
        });

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Produit', 'Qté', 'Total', 'Bénéfice']],
          body: salesData,
          theme: 'striped',
          headStyles: { fillColor: [34, 139, 34] },
          styles: { fontSize: 8 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('Aucune vente', 14, yPosition + 5);
        yPosition += 15;
      }

      // Section Dépenses
      doc.setFontSize(14);
      doc.setTextColor(180, 0, 0);
      doc.text('DÉPENSES', 14, yPosition);
      yPosition += 5;

      const allExpenses = [...achatsProducts, ...depenses];

      if (allExpenses.length > 0) {
        const expenseData = allExpenses.map(expense => {
          const typeLabel = expense.type === 'achat_produit' ? 'Achat'
            : expense.type === 'taxes' ? 'Taxes'
            : expense.type === 'carburant' ? 'Carburant' : 'Autre';

          return [
            new Date(expense.date).toLocaleDateString('fr-FR'),
            typeLabel,
            (expense.productDescription || expense.description || '').substring(0, 35),
            `${expense.totalCost.toFixed(2)} €`
          ];
        });

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Type', 'Description', 'Montant']],
          body: expenseData,
          theme: 'striped',
          headStyles: { fillColor: [220, 53, 69] },
          styles: { fontSize: 8 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      } else {
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('Aucune dépense', 14, yPosition + 5);
        yPosition += 15;
      }

      // Résumé financier
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 120);
      doc.text('RÉSUMÉ FINANCIER', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Description', 'Montant']],
        body: [
          ['Total ventes', `${salesTotal.toFixed(2)} €`],
          ['Bénéfice brut', `${salesProfit.toFixed(2)} €`],
          ['Achats produits', `- ${achatsTotal.toFixed(2)} €`],
          ['Autres dépenses', `- ${depensesTotal.toFixed(2)} €`],
          ['Total dépenses', `- ${(achatsTotal + depensesTotal).toFixed(2)} €`],
          ['BÉNÉFICE RÉEL', `${beneficeReel.toFixed(2)} €`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 120] },
        styles: { fontSize: 10 },
        didParseCell: data => {
          if (data.row.index === 5) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = beneficeReel >= 0 ? [210, 245, 210] : [255, 220, 220];
            data.cell.styles.textColor = beneficeReel >= 0 ? [0, 100, 0] : [150, 0, 0];
          }
        }
      });

      // Mentions légales
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        'Document comptable strictement confidentiel.\n' +
        'Réservé exclusivement à un usage interne.\n' +
        'Toute diffusion, reproduction ou transmission à des tiers\n' +
        'sans autorisation écrite est formellement interdite.',
        14,
        pageHeight - 40
      );

      const signatureY = pageHeight - 30;
      const signatureX = pageWidth - 20;

      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text('Responsable Comptable', signatureX, signatureY - 8, { align: 'right' });

      doc.setFontSize(12);
      doc.setTextColor(160, 0, 0);
      doc.text('La Direction', signatureX, signatureY, { align: 'right' });

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, signatureX, signatureY + 8, { align: 'right' });

      doc.save(`comptabilite_${monthName}_${exportYear}.pdf`);
      onClose();

      toast({
        title: 'Export réussi',
        description: `PDF de ${monthName} ${exportYear} téléchargé`,
        className: 'bg-green-600 text-white border-green-700'
      });
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le PDF',
        variant: 'destructive'
      });
    }
  }, [exportMonth, exportYear, allSales, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="sm:max-w-md bg-[#F2E4E4] text-[#1f2937] border border-[#e5e7eb] shadow-xl rounded-2xl">
  <DialogHeader>
    <DialogTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
      <div className="p-2 rounded-lg bg-white border border-[#e5e7eb] shadow-sm">
        <FileDown className="h-5 w-5 text-[#7c3aed]" />
      </div>
      Exporter en PDF
    </DialogTitle>

    <DialogDescription className="text-sm text-[#6b7280]">
      Sélectionnez la période à exporter
    </DialogDescription>
  </DialogHeader>

  <div className="grid gap-5 py-6">
    <div className="grid grid-cols-2 gap-4">
      
      <div className="space-y-2">
        <Label className="text-[#374151] font-medium">Mois</Label>
        <Select
          value={exportMonth.toString()}
          onValueChange={(v) => setExportMonth(parseInt(v))}
        >
          <SelectTrigger className="bg-white border text-red-600 border-[#e5e7eb] rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500">
            <SelectValue />
          </SelectTrigger >
          <SelectContent className="bg-white text-red-600 border border-[#e5e7eb] shadow-lg rounded-xl">
            {MONTHS.map((month, index) => (
              <SelectItem
                key={index}
                value={(index + 1).toString()}
                className="focus:bg-violet-50"
              >
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[#374151] font-medium">Année</Label>
        <Select
          value={exportYear.toString()}
          onValueChange={(v) => setExportYear(parseInt(v))}
        >
          <SelectTrigger className="bg-white border text-red-600 border-[#e5e7eb] rounded-xl shadow-sm focus:ring-2 focus:ring-violet-500">
            <SelectValue />
          </SelectTrigger>

        <SelectContent className="bg-white text-red-600 border border-[#e5e7eb] shadow-lg rounded-xl">
        {years.map((year) => (
          <SelectItem
            key={year}
            value={year.toString()}
            className="focus:bg-violet-50"
          >
            {year}
          </SelectItem>
        ))}
      </SelectContent>
          
        </Select>
      </div>

    </div>
  </div>

  <DialogFooter className="gap-2">
    <Button
      variant="outline"
      onClick={onClose}
      className="rounded-xl border-[#d1d5db] text-[#374151] hover:bg-[#e5e7eb]"
    >
      Annuler
    </Button>

    <Button
      onClick={handleExportPDF}
      className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:opacity-90"
    >
      <FileDown className="h-4 w-4 mr-2" />
      Télécharger
    </Button>
  </DialogFooter>
</DialogContent>

    </Dialog>
  );
};

export default ExportPdfModal;
