/**
 * InvoiceGenerator.tsx
 * 
 * Composant React pour générer et afficher des factures de ventes.
 * 
 * ========================= DESIGN ULTRA-LUXE / IPHONE =========================
 * Objectif : créer une interface premium, élégante et immersive, inspirée des iPhone et apps modernes.
 * 
 * 1️⃣ Effet miroir / glassmorphism :
 *      - Cartes (Card), Modals (Dialog) et sections utilisent :
 *          * backdrop-blur-xl pour effet vitre transparente
 *          * bg-white/80 ou dark:bg-gray-900/30 pour contraste doux
 *          * Bordures arrondies très larges : rounded-3xl / rounded-[32px]
 *      - Ombres profondes et dynamiques : shadow-2xl, hover:shadow-3xl
 * 
 * 2️⃣ Boutons ronds premium :
 *      - bg-gradient-to-r avec couleurs vives (pink → purple → indigo)
 *      - Hover : scale-105 + shadow-2xl
 *      - Icônes Lucide intégrées et animées (ex: Sparkles animate-pulse)
 * 
 * 3️⃣ Typography / couleurs :
 *      - Titres ultra-bold et contrastés : font-extrabold, text-xl
 *      - Couleurs vives et saturées pour les accents (emerald, indigo, purple)
 *      - Textes secondaires gris subtil pour hiérarchie visuelle
 * 
 * 4️⃣ Layout & UX :
 *      - ScrollArea pour contenu long avec smooth scroll
 *      - Espacement généreux (space-y-6 / space-y-10) pour lisibilité
 *      - Cartes cliquables avec bordure colorée pour retour visuel
 *      - Responsive : sm:max-w-5xl pour modal principal
 * 
 * ========================= FONCTIONNALITÉS =========================
 * - Filtrage des ventes :
 *      * Par année
 *      * Par nom de client (>= 3 caractères)
 * - Sélection d’une vente pour voir détails complets
 * - Calcul des totaux : produits, livraison, TVA (0%), bénéfice
 * - Génération PDF ultra-luxe avec jsPDF + autoTable :
 *      * Header premium avec couleurs et typographie
 *      * Table produits avec styles modernes et couleurs dégradées
 *      * Totaux et informations paiement stylisées
 * 
 * ========================= MINI-SCHÉMA VISUEL =========================
 * 
 * Modal Principal (sm:max-w-5xl) ────────────────────────────────┐
 * ┌─────────────────────────────────────────────────────────────┐ │
 * │ Header gradient (purple → pink → indigo)                    │ │
 * │   BrandLogo + Premium Badge / Sparkles                      │ │
 * └─────────────────────────────────────────────────────────────┘ │
 * ┌─────────────────────────────────────────────────────────────┐ │
 * │ ScrollArea : contenu filtrage + ventes                       │ │
 * │ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │ │
 * │ │ Card Glass    │  │ Card Glass    │  │ Card Glass    │     │ │
 * │ │ année / filtre│  │ recherche     │  │ ventes liste  │     │ │
 * │ └───────────────┘  └───────────────┘  └───────────────┘     │ │
 * └─────────────────────────────────────────────────────────────┘ │
 * 
 * Modal Détails Vente (sm:max-w-3xl) ────────────────────────────┐
 * ┌─────────────────────────────────────────────────────────────┐ │
 * │ Header : Eye icon + Gradient Text (emerald → teal)           │ │
 * └─────────────────────────────────────────────────────────────┘ │
 * ┌───────────────┐  ┌───────────────┐                             │
 * │ Card Client   │  │ Card Détails  │                             │
 * │ Glass / Blur  │  │ Glass / Blur  │                             │
 * └───────────────┘  └───────────────┘                             │
 * ┌─────────────────────────────────────────────────────────────┐ │
 * │ Button Générer PDF : dégradé + icônes + hover scale/shine     │ │
 * └─────────────────────────────────────────────────────────────┘ │
 * 
 * =======================================================================
 * 
 * Objectif global : allier esthétique ultra-moderne, expérience premium
 * et fonctionnalités complètes de facturation pour utilisateurs exigeants.
 */


import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Sale, SaleProduct } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Search, Calendar, User, MapPin,
  Phone, Download, Eye, Sparkles, Crown,
  CreditCard
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

/* =========================
   BRAND LOGO ULTRA LUXE
========================= */
const BrandLogo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="
      w-12 h-12 rounded-3xl
      bg-gradient-to-tr from-pink-400 via-purple-500 to-indigo-500
      shadow-2xl shadow-purple-400/30
      flex items-center justify-center
      transform hover:scale-105 transition-transform duration-300
    ">
      <Crown className="h-6 w-6 text-white" />
    </div>
    <span className="font-extrabold tracking-wide text-xl text-gray-900 dark:text-white">
      Riziky Beauté
    </span>
  </div>
);

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ isOpen, onClose }) => {
  const { allSales } = useApp();
  const { toast } = useToast();
  const { formatEuro } = useCurrencyFormatter();

  const [searchYear, setSearchYear] = useState('2025');
  const [searchName, setSearchName] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  const filteredSalesByYear = allSales.filter(
    sale => new Date(sale.date).getFullYear().toString() === searchYear
  );

  const filteredSalesByName =
    searchName.length >= 3
      ? filteredSalesByYear.filter(sale =>
          sale.clientName?.toLowerCase().includes(searchName.toLowerCase())
        )
      : [];

  const handleSaleSelect = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

  const generateInvoicePDF = (sale: Sale) => {
    if (!sale.clientName) {
      toast({
        title: 'Erreur',
        description: 'Nom du client manquant.',
        variant: 'destructive',
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    const date = new Date(sale.date);
    const invoiceNumber = `${date.getFullYear()}-${sale.id.toString().padStart(3, '0')}`;
    const dueDate = new Date(date);
    dueDate.setFullYear(dueDate.getFullYear() + 1);
    dueDate.setDate(dueDate.getDate() - 1);

    // === EN-TÊTE ULTRA LUXE MODERNE ===
    doc.setFillColor(18, 18, 40);
    doc.rect(0, 0, pageWidth, 55, 'F');
    doc.setFillColor(250, 215, 70);
    doc.rect(0, 53, pageWidth, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26).setFont('helvetica', 'bold');
    doc.text('Riziky Beauté', 20, 22);
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 220);
    doc.text('Votre partenaire beauté à La Réunion', 20, 32);
    doc.text('10 Allée des Beryls Bleus, 97400 Saint-Denis', 20, 40);
    doc.text('Tél: 0692 19 87 01 • SIRET: 123 456 789 00010', 20, 48);

    doc.setTextColor(239, 68, 68);
    doc.setFontSize(32).setFont('helvetica', 'bold');
    doc.text('FACTURE', pageWidth - 20, 30, { align: 'right' });
    doc.setFontSize(11).setTextColor(180, 180, 200);
    doc.text(`N° ${invoiceNumber}`, pageWidth - 20, 42, { align: 'right' });

    let y = 68;
    doc.setFontSize(10).setTextColor(100, 100, 120);
    doc.text(`Date : ${date.toLocaleDateString('fr-FR')}`, 20, y);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(`Échéance : ${dueDate.toLocaleDateString('fr-FR')}`, 20, y + 8);

    const clientY = y + 20;
    doc.setFillColor(245, 247, 250);
    doc.rect(20, clientY, pageWidth - 40, 32, 'F');
    doc.setFillColor(139, 92, 246);
    doc.rect(20, clientY, 4, 32, 'F');

    doc.setTextColor(139, 92, 246).setFontSize(9).setFont('helvetica', 'bold');
    doc.text('FACTURER À', 30, clientY + 8);
    doc.setTextColor(30, 30, 50).setFontSize(12).setFont('helvetica', 'bold');
    doc.text(sale.clientName || '', 30, clientY + 18);
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100, 100, 120);
    if (sale.clientAddress) doc.text(sale.clientAddress, 30, clientY + 26);
    if (sale.clientPhone) {
      doc.setTextColor(239, 68, 68).setFont('helvetica', 'bold');
      doc.text(`Tél: ${sale.clientPhone}`, pageWidth - 60, clientY + 18);
    }

    const saleProducts: SaleProduct[] =
      sale.products && sale.products.length > 0
        ? sale.products
        : [{
            description: sale.description || '',
            quantitySold: sale.quantitySold || 0,
            sellingPrice: sale.sellingPrice || 0,
            deliveryFee: sale.deliveryFee || 0
          } as SaleProduct];

    const tableData = saleProducts.map(prod => [
      prod.description || '',
      (prod.quantitySold || 0).toString(),
      formatEuro(prod.quantitySold ? (prod.sellingPrice || 0) / prod.quantitySold : 0),
      formatEuro(prod.sellingPrice || 0),
      formatEuro(prod.deliveryFee || 0)
    ]);

    autoTable(doc, {
      startY: clientY + 40,
      head: [['DESCRIPTION', 'QTÉ', 'PRIX UNIT.', 'MONTANT', 'LIVRAISON']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 9 },
      bodyStyles: { textColor: [30, 30, 50], fontSize: 9, cellPadding: 5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { overflow: 'linebreak', halign: 'center', lineColor: [220, 220, 230], lineWidth: 0.3 },
      columnStyles: { 0: { halign: 'left', cellWidth: 60 } }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    const totalAmount = saleProducts.reduce((sum: number, product: SaleProduct) => sum + (product.sellingPrice || 0), 0);
    const totalDeliveryFee = saleProducts.reduce((sum: number, product: SaleProduct) => sum + (product.deliveryFee || 0), 0);

    const totalsX = pageWidth - 90;
    doc.setFontSize(10).setTextColor(80, 80, 100);
    doc.text('Sous-total HT:', totalsX - 20, finalY);
    doc.text(formatEuro(totalAmount), totalsX + 30, finalY, { align: 'right' });
    doc.text('Frais livraison:', totalsX - 20, finalY + 9);
    doc.text(formatEuro(totalDeliveryFee), totalsX + 30, finalY + 9, { align: 'right' });
    doc.text('TVA (0%):', totalsX - 20, finalY + 18);
    doc.text('0,00 €', totalsX + 30, finalY + 18, { align: 'right' });

    doc.setFillColor(18, 18, 40);
    doc.rect(totalsX - 25, finalY + 24, 60, 14, 'F');
    doc.setTextColor(250, 215, 70).setFontSize(12).setFont('helvetica', 'bold');
    doc.text('Total TTC:', totalsX - 20, finalY + 33);
    doc.setTextColor(255, 255, 255);
    doc.text(formatEuro(totalAmount + totalDeliveryFee), totalsX + 30, finalY + 33, { align: 'right' });

    doc.setDrawColor(139, 92, 246).setLineWidth(1);
    doc.line(20, pageHeight - 48, pageWidth - 20, pageHeight - 48);

    doc.setTextColor(80, 80, 100).setFont('helvetica', 'bold').setFontSize(10);
    doc.text('Informations de paiement :', 20, pageHeight - 40);
    doc.setFont('helvetica', 'normal').setFontSize(9);
    doc.text(`Date de paiement : ${date.toLocaleDateString('fr-FR')}`, 20, pageHeight - 32);
    doc.text('Mode de paiement : Espèces', 20, pageHeight - 24);

    doc.setFontSize(8).setTextColor(120, 120, 120);
    doc.text('Document comptable strictement confidentiel.\nRéservé exclusivement à un usage interne.', 20, pageHeight - 14);

    doc.setFontSize(9).setTextColor(90, 90, 90);
    doc.text('Responsable Comptable', pageWidth - 20, pageHeight - 36, { align: 'right' });
    doc.setFontSize(12).setTextColor(160, 0, 0);
    doc.text('La Direction', pageWidth - 20, pageHeight - 28, { align: 'right' });
    doc.setFontSize(8).setTextColor(120, 120, 120);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, pageHeight - 20, { align: 'right' });
    doc.text('TVA non applicable - Article 293B du CGI', pageWidth - 20, pageHeight - 12, { align: 'right' });

    doc.save(`Facture_${sale.clientName?.replace(/\s+/g, '_')}_${sale.id}.pdf`);
    toast({
      title: 'Facture générée',
      description: `La facture pour ${sale.clientName} a été générée avec succès.`,
    });
  }

  return (
    <>
      {/* ================= MODAL PRINCIPAL ================= */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
  className="
    sm:max-w-5xl p-0 overflow-hidden
    rounded-[32px]
    bg-gray-500/30 dark:bg-gray-900/40
    backdrop-blur-md
    border border-white/20 dark:border-white/10
    shadow-[0_35px_140px_-25px_rgba(0,0,0,0.5)]
    animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-500
  "
>

          {/* ===== Header ===== */}
          <DialogHeader
            className="
              px-8 py-6
              bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500
              text-white
              shadow-lg
            "
          >
            <DialogTitle className="flex items-center justify-between">
              <BrandLogo />
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="font-semibold tracking-wide">
                  Facturation Premium
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-120px)] px-8 py-8">
            <div className="space-y-10">

              {/* ===== Sélection Année ===== */}
              <Card
  className="
    rounded-3xl
    bg-gray-500/30 dark:bg-gray-900/40
    backdrop-blur-md
    shadow-2xl hover:shadow-3xl
  "
>

                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-red-600 dark:text-indigo-400">
                    <Calendar className="h-5 w-5" />
                    Année
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={searchYear}
                    onChange={(e) => {
                      setSearchYear(e.target.value);
                      setSearchName('');
                    }}
                    className="
                      w-32 text-center font-bold
                      rounded-xl
                      border-indigo-300 dark:border-indigo-600
                      bg-white/80 dark:bg-black/30
                    "
                  />
                  <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                    {filteredSalesByYear.length} ventes
                  </Badge>
                </CardContent>
              </Card>

              {/* ===== Recherche Client ===== */}
            <Card
  className="
    rounded-3xl
    bg-gray-500/30 dark:bg-gray-900/40
    backdrop-blur-md
    shadow-2xl
    transition-all duration-300
  "
>

                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <Search className="h-5 w-5" />
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Nom du client"
                    className="
                      flex-1 rounded-xl
                      bg-white/80 dark:bg-black/30
                      border-emerald-300 dark:border-emerald-600
                    "
                  />
                  {searchName.length >= 3 && (
                    <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      {filteredSalesByName.length} résultats
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* ===== Résultats Ventes ===== */}
              {searchName.length >= 3 && (
              <Card
  className="
    border-2 border-gray-300/40 dark:border-gray-700/40
    bg-gray-500/30 dark:bg-gray-900/40
    backdrop-blur-md
    shadow-2xl
    rounded-2xl
  "
>

                  <CardHeader className="pb-3">
                    <CardTitle
  className="
    text-lg
    flex items-center gap-2
    font-bold
    text-gray-800 dark:text-gray-100
  "
>

                      <User className="h-5 w-5" />
                      Ventes de : {searchName} en {searchYear}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] w-full">
                      <div className="space-y-3">
                        {filteredSalesByName.map((sale) => (
                          <Card
                            key={sale.id}
                            className="cursor-pointer hover:shadow-3xl transition-all duration-300 border-l-4 border-l-purple-500 hover:border-l-pink-500 rounded-xl bg-white/80 dark:bg-gray-900/30 backdrop-blur-md"
                            onClick={() => handleSaleSelect(sale)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-purple-500" />
                                    <span className="font-semibold text-purple-700 dark:text-purple-300">{sale.clientName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(sale.date).toLocaleDateString('fr-FR')}
                                  </div>
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {sale.products && sale.products.length > 0
                                      ? `${sale.products.length} produit${sale.products.length > 1 ? 's' : ''}`
                                      : sale.description}
                                  </div>

                                  {sale.clientPhone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                      <Phone className="h-4 w-4" />
                                      {sale.clientPhone}
                                    </div>
                                  )}
                                </div>

                                <div className="text-right">
                                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    {sale.products && sale.products.length > 0
                                      ? formatEuro(sale.totalSellingPrice || 0)
                                      : formatEuro(sale.sellingPrice || 0)}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Qté: {sale.products && sale.products.length > 0
                                      ? sale.products.reduce((sum: number, p) => sum + (p.quantitySold || 0), 0)
                                      : (sale.quantitySold || 0)}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {filteredSalesByName.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune vente trouvée pour "{searchName}" en {searchYear}</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL DÉTAIL VENTE ================= */}
      <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
      <DialogContent
  className="
    sm:max-w-3xl
    rounded-[32px]

    bg-white/20 dark:bg-white/10
    backdrop-blur-2xl
    border border-white/30 dark:border-white/10

    shadow-2xl
    animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-500
    p-0
  "
>

          <DialogHeader className="pb-4 pt-6 px-6 text-center">
            <DialogTitle className="flex items-center justify-center gap-3 text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              Détails de la Vente
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-100px)] px-6 pb-6">
            {selectedSale ? (
              <div className="space-y-6">

                {/* Informations Client */}
                <Card className="border-2 border-gradient-to-r from-blue-200 to-indigo-200 rounded-xl bg-white/80 dark:bg-gray-900/30 backdrop-blur-md shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <User className="h-5 w-5" />
                      Informations Client
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{selectedSale.clientName}</span>
                    </div>
                    {selectedSale.clientAddress && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{selectedSale.clientAddress}</span>
                      </div>
                    )}
                    {selectedSale.clientPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span>{selectedSale.clientPhone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Détails de la Vente */}
                <Card className="border-2 border-gradient-to-r from-emerald-200 to-teal-200 rounded-xl bg-white/80 dark:bg-gray-900/30 backdrop-blur-md shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CreditCard className="h-5 w-5" />
                      Détails de la Vente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Date et Quantité Totale */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</Label>
                        <div className="text-lg font-semibold">{new Date(selectedSale.date).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Quantité Totale</Label>
                        <div className="text-lg font-semibold">
                          {selectedSale.products && selectedSale.products.length > 0
                            ? selectedSale.products.reduce((sum: number, p) => sum + (p.quantitySold || 0), 0)
                            : (selectedSale.quantitySold || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Produits */}
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {selectedSale.products && selectedSale.products.length > 0 ? 'Produits' : 'Produit'}
                      </Label>
                      {selectedSale.products && selectedSale.products.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedSale.products.map((product, index) => (
                            <div key={index} className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-md flex justify-between items-center shadow-md hover:shadow-lg transition-all">
                              <div className="font-medium">{product.description}</div>
                              <div className="text-gray-600 dark:text-gray-300">
                                Qté: {product.quantitySold} - {formatEuro(product.sellingPrice || 0)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-lg font-semibold">{selectedSale.description}</div>
                      )}
                    </div>

                    {/* Prix Total et Bénéfice */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Prix Total</Label>
                        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {selectedSale.products && selectedSale.products.length > 0
                            ? formatEuro(selectedSale.totalSellingPrice || 0)
                            : formatEuro(selectedSale.sellingPrice || 0)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Bénéfice</Label>
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedSale.products && selectedSale.products.length > 0
                            ? formatEuro(selectedSale.totalProfit || 0)
                            : formatEuro(selectedSale.profit || 0)}
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* Bouton Générer Facture PDF */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => generateInvoicePDF(selectedSale)}
                    className="
                      w-full sm:w-auto py-4 px-6 rounded-3xl font-black tracking-wide
                      bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600
                      shadow-2xl hover:shadow-3xl
                      hover:scale-105
                      transition-all duration-300
                      flex items-center gap-3 justify-center
                    "
                  >
                    <Download className="h-5 w-5 text-white" />
                    Générer Facture PDF
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  </Button>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Aucune vente sélectionnée</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default InvoiceGenerator;
