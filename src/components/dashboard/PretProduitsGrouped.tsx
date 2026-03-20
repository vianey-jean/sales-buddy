import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, CalendarIcon, Loader2, Trash2, Plus, CreditCard, TrendingUp, Wallet, CheckCircle, Clock, Search, Phone, ChevronDown, ChevronUp, ArrowRightLeft, UserPlus, Users, Eye, Pencil, X, Package, DollarSign, Percent, ArrowUpRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Product, PretProduit } from '@/types';
import { pretProduitService } from '@/service/api';
import { motion, AnimatePresence } from 'framer-motion';
import PretRetardNotification from './PretRetardNotification';
import PremiumLoading from '@/components/ui/premium-loading';

type StatModalType = 'totalVentes' | 'avances' | 'reste' | 'pretsPayes' | null;

type ProductCategory = 'all' | 'perruque' | 'tissage' | 'extension' | 'autres';

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'perruque', label: 'Perruque' },
  { value: 'tissage', label: 'Tissage' },
  { value: 'extension', label: 'Extension' },
  { value: 'autres', label: 'Autres' },
];

const filterProductsByCategory = (products: Product[], category: ProductCategory): Product[] => {
  if (category === 'all') return products;
  const check = (p: Product) => p.description.toLowerCase();
  switch (category) {
    case 'perruque': return products.filter(p => check(p).includes('perruque'));
    case 'tissage': return products.filter(p => check(p).includes('tissage'));
    case 'extension': return products.filter(p => check(p).includes('extension'));
    case 'autres': return products.filter(p =>
      !check(p).includes('perruque') && !check(p).includes('tissage') && !check(p).includes('extension')
    );
    default: return products;
  }
};

interface GroupedPrets {
  nom: string;
  phone?: string;
  prets: PretProduit[];
  totalPrixVente: number;
  totalAvance: number;
  totalReste: number;
  allPaid: boolean;
}

const PretProduitsGrouped: React.FC = () => {
  const [prets, setPrets] = useState<PretProduit[]>([]);
  const [groupedPrets, setGroupedPrets] = useState<GroupedPrets[]>([]);
  const [expandedSection, setExpandedSection] = useState<'paid' | 'pending' | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ajoutAvanceDialogOpen, setAjoutAvanceDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [datePret, setDatePret] = useState<Date>(new Date());
  const [datePaiement, setDatePaiement] = useState<Date | undefined>();
  const [description, setDescription] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [prixVente, setPrixVente] = useState('');
  const [avanceRecue, setAvanceRecue] = useState('');
  const [ajoutAvance, setAjoutAvance] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState<ProductCategory>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPret, setSelectedPret] = useState<PretProduit | null>(null);
  const [selectedGroupForTransfer, setSelectedGroupForTransfer] = useState<GroupedPrets | null>(null);
  const [selectedPretsForTransfer, setSelectedPretsForTransfer] = useState<Set<string>>(new Set());
  const [transferTargetName, setTransferTargetName] = useState('');
  const [isNewClient, setIsNewClient] = useState(true);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState<any[]>([]);
  const [editPaiementDialogOpen, setEditPaiementDialogOpen] = useState(false);
  const [deletePaiementDialogOpen, setDeletePaiementDialogOpen] = useState(false);
  const [selectedPaiementIndex, setSelectedPaiementIndex] = useState<number | null>(null);
  const [editPaiementMontant, setEditPaiementMontant] = useState('');
  const [statModalOpen, setStatModalOpen] = useState<StatModalType>(null);
  const { products, searchProducts } = useApp();
  const { toast } = useToast();

  const reste = React.useMemo(() => {
    const prix = parseFloat(prixVente) || 0;
    const avance = parseFloat(avanceRecue) || 0;
    return prix - avance;
  }, [prixVente, avanceRecue]);

  const nouveauReste = React.useMemo(() => {
    if (!selectedPret) return 0;
    const prix = selectedPret.prixVente || 0;
    const avanceActuelle = selectedPret.avanceRecue || 0;
    const nouvelleAvance = parseFloat(ajoutAvance) || 0;
    return prix - (avanceActuelle + nouvelleAvance);
  }, [selectedPret, ajoutAvance]);

  const montantDepasse = React.useMemo(() => {
    return nouveauReste < 0;
  }, [nouveauReste]);

  const estPaye = reste <= 0;

  const isDatePaiementDepassee = (datePaiement: string) => {
    const date = new Date(datePaiement);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < aujourdhui;
  };

  const getDatePaiementClass = (pret: PretProduit) => {
    if (!pret.datePaiement) return "font-bold text-green-600";
    const isDepassee = isDatePaiementDepassee(pret.datePaiement);
    if (pret.estPaye) return "font-bold text-green-600";
    return isDepassee ? "font-bold text-red-600 animate-pulse" : "font-bold text-green-600";
  };

  const fetchPrets = async () => {
    try {
      setLoading(true);
      const data = await pretProduitService.getPretProduits();
      
      // Initialiser le champ paiements pour les prêts qui n'en ont pas
      const dataWithPaiements = data.map(pret => ({
        ...pret,
        paiements: pret.paiements || (pret.avanceRecue > 0 ? [{
          date: pret.date,
          montant: pret.avanceRecue
        }] : [])
      }));
      
      setPrets(dataWithPaiements);
      groupPretsByPerson(dataWithPaiements);
    } catch (error) {
      console.error('Erreur lors du chargement des prêts produits', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prêts produits',
        variant: 'destructive', className: "notification-erreur",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupPretsByPerson = (pretsList: PretProduit[]) => {
    const grouped = pretsList.reduce((acc, pret) => {
      const key = pret.nom || 'Sans nom';
      if (!acc[key]) {
        acc[key] = {
          nom: key,
          phone: pret.phone,
          prets: [],
          totalPrixVente: 0,
          totalAvance: 0,
          totalReste: 0,
          allPaid: true
        };
      }
      acc[key].prets.push(pret);
      acc[key].totalPrixVente += pret.prixVente;
      acc[key].totalAvance += pret.avanceRecue;
      acc[key].totalReste += pret.reste;
      if (!pret.estPaye) acc[key].allPaid = false;
      
      return acc;
    }, {} as Record<string, GroupedPrets>);

    // Trier les groupes: "Tous payé" d'abord, puis "En cours", chacun par ordre alphabétique
    const sortedGroups = Object.values(grouped).sort((a, b) => {
      // Si les statuts sont différents, mettre "Tous payé" (allPaid = true) avant "En cours" (allPaid = false)
      if (a.allPaid !== b.allPaid) {
        return a.allPaid ? -1 : 1;
      }
      // Si les statuts sont identiques, trier par ordre alphabétique du nom
      return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
    });
    
    setGroupedPrets(sortedGroups);
  };

  useEffect(() => {
    fetchPrets();
  }, []);

  const toggleGroup = (nom: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(nom)) {
      newExpanded.delete(nom);
    } else {
      newExpanded.add(nom);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleSection = (section: 'paid' | 'pending') => {
    if (expandedSection === section) {
      setExpandedSection(null);
      setExpandedGroups(new Set());
    } else {
      setExpandedSection(section);
      setExpandedGroups(new Set());
    }
  };

  const paidGroups = groupedPrets.filter(g => g.allPaid);
  const pendingGroups = groupedPrets.filter(g => !g.allPaid);

  const totalReste = prets.reduce((sum, pret) => sum + pret.reste, 0);
  const totalAvances = prets.reduce((sum, pret) => sum + pret.avanceRecue, 0);
  const totalVentes = prets.reduce((sum, pret) => sum + pret.prixVente, 0);
  const pretsPayes = prets.filter(pret => pret.estPaye).length;

  const handleSearch = async (text: string) => {
    setDescription(text);
    if (text.length >= 3) {
      try {
        const results = await searchProducts(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche de produits', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setDescription(product.description);
    setPrixVente(product.purchasePrice.toString());
    setSearchResults([]);
  };

  const selectPretForEdit = (pret: PretProduit) => {
    setSelectedPret(pret);
    setDatePret(new Date(pret.date));
    setDatePaiement(pret.datePaiement ? new Date(pret.datePaiement) : undefined);
    setDescription(pret.description);
    setNom(pret.nom || '');
    setPhone(pret.phone || '');
    setPrixVente(pret.prixVente.toString());
    setAvanceRecue(pret.avanceRecue.toString());
    setEditDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!description) {
      toast({ title: 'Erreur', description: 'Veuillez saisir une description', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    if (!prixVente || parseFloat(prixVente) <= 0) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un prix de vente valide', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    try {
      setLoading(true);
      
      // Créer l'historique des paiements avec la date actuelle du jour
      const aujourdHui = new Date();
      const dateAujourdhui = format(aujourdHui, 'yyyy-MM-dd');
      
      const paiements = [];
      if (parseFloat(avanceRecue) > 0) {
        paiements.push({
          date: dateAujourdhui,
          montant: parseFloat(avanceRecue)
        });
      }
      
      const newPret: Omit<PretProduit, 'id'> = {
        date: format(datePret, 'yyyy-MM-dd'),
        datePaiement: datePaiement ? format(datePaiement, 'yyyy-MM-dd') : undefined,
        description,
        nom,
        phone,
        prixVente: parseFloat(prixVente),
        avanceRecue: parseFloat(avanceRecue) || 0,
        reste,
        estPaye,
        productId: selectedProduct?.id,
        paiements
      };
      await pretProduitService.addPretProduit(newPret);
      await fetchPrets();
      toast({ title: 'Succès', description: 'Prêt enregistré avec succès', variant: 'default', className: 'notification-success' });
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du prêt', error);
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer le prêt', variant: 'destructive', className: "notification-erreur", });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPret) return;
    try {
      setLoading(true);
      const updatedPret: PretProduit = {
        ...selectedPret,
        datePaiement: datePaiement ? format(datePaiement, 'yyyy-MM-dd') : undefined,
        nom,
        phone,
        avanceRecue: parseFloat(avanceRecue) || 0,
        reste,
        estPaye
      };
      await pretProduitService.updatePretProduit(selectedPret.id, updatedPret);
      await fetchPrets();
      toast({ title: 'Succès', description: 'Prêt mis à jour avec succès', variant: 'default', className: 'notification-success' });
      resetForm();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prêt', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le prêt', variant: 'destructive', className: "notification-erreur", });
    } finally {
      setLoading(false);
    }
  };

  const handleAjoutAvance = async () => {
    if (!selectedPret) return;
    if (!ajoutAvance || parseFloat(ajoutAvance) <= 0) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    try {
      setLoading(true);
      const nouvelleAvanceRecue = selectedPret.avanceRecue + parseFloat(ajoutAvance);
      const nouveauReste = selectedPret.prixVente - nouvelleAvanceRecue;
      const nouveauEstPaye = nouveauReste <= 0;
      
      // Récupérer la date actuelle du jour depuis l'ordinateur
      const aujourdHui = new Date();
      const dateAujourdhui = format(aujourdHui, 'yyyy-MM-dd');
      
      // Ajouter le nouveau paiement à l'historique avec la date du jour
      const nouveauPaiement = {
        date: dateAujourdhui,
        montant: parseFloat(ajoutAvance)
      };
      
      // Initialiser le tableau de paiements s'il n'existe pas
      const paiementsExistants = selectedPret.paiements || [];
      const nouveauxPaiements = [...paiementsExistants, nouveauPaiement];
      
      const updatedPret: PretProduit = { 
        ...selectedPret, 
        avanceRecue: nouvelleAvanceRecue, 
        reste: nouveauReste, 
        estPaye: nouveauEstPaye,
        paiements: nouveauxPaiements
      };
      
      console.log('Mise à jour du prêt avec les paiements:', updatedPret);
      
      await pretProduitService.updatePretProduit(selectedPret.id, updatedPret);
      await fetchPrets();
      toast({ title: 'Succès', description: `Avance de ${formatCurrency(parseFloat(ajoutAvance))} ajoutée avec succès`, variant: 'default', className: 'notification-success' });
      setAjoutAvance('');
      setSelectedPret(null);
      setAjoutAvanceDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avance', error);
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'avance', variant: 'destructive' , className: "notification-erreur",});
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPret) return;
    try {
      setLoading(true);
      await pretProduitService.deletePretProduit(selectedPret.id);
      await fetchPrets();
      toast({ title: 'Succès', description: 'Prêt supprimé avec succès', variant: 'default', className: 'notification-success' });
      resetForm();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du prêt', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer le prêt', variant: 'destructive', className: "notification-erreur", });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedGroupForTransfer || selectedPretsForTransfer.size === 0) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner au moins un prêt à transférer', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    if (!transferTargetName || transferTargetName.trim() === '') {
      toast({ title: 'Erreur', description: 'Veuillez saisir le nom de la personne de destination', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    if (transferTargetName === selectedGroupForTransfer.nom) {
      toast({ title: 'Erreur', description: 'La personne de destination doit être différente de la personne source', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    try {
      setLoading(true);
      const pretIds = Array.from(selectedPretsForTransfer);
      await pretProduitService.transferPrets(selectedGroupForTransfer.nom, transferTargetName, pretIds);
      await fetchPrets();
      toast({ 
        title: 'Succès', 
        description: `${pretIds.length} prêt${pretIds.length > 1 ? 's' : ''} transféré${pretIds.length > 1 ? 's' : ''} avec succès vers ${transferTargetName}`, 
        variant: 'default', 
        className: 'notification-success' 
      });
      resetTransferForm();
      setTransferDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors du transfert des prêts', error);
      toast({ title: 'Erreur', description: 'Impossible de transférer les prêts', variant: 'destructive', className: "notification-erreur", });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPret(null);
    setDatePret(new Date());
    setDatePaiement(undefined);
    setDescription('');
    setNom('');
    setPhone('');
    setPrixVente('');
    setAvanceRecue('');
    setAjoutAvance('');
    setSelectedProduct(null);
    setIsNewClient(true);
    setClientSearchQuery('');
    setClientSearchResults([]);
  };

  const handleClientSearch = (query: string) => {
    setClientSearchQuery(query);
    if (query.length >= 3) {
      // Chercher dans les prêts produits existants
      const queryLower = query.toLowerCase();
      const matchingPrets = prets.filter(pret => 
        pret.nom.toLowerCase().includes(queryLower)
      );
      
      // Extraire les noms uniques avec leur téléphone
      const uniqueClients = new Map<string, { id: string; nom: string; phone: string }>();
      
      matchingPrets.forEach(pret => {
        if (!uniqueClients.has(pret.nom)) {
          uniqueClients.set(pret.nom, {
            id: pret.nom, // Utiliser le nom comme ID unique
            nom: pret.nom,
            phone: pret.phone || ''
          });
        }
      });
      
      setClientSearchResults(Array.from(uniqueClients.values()));
    } else {
      setClientSearchResults([]);
    }
  };

  const selectClient = (client: any) => {
    setNom(client.nom);
    setPhone(client.phone || '');
    setClientSearchQuery('');
    setClientSearchResults([]);
  };

  const resetTransferForm = () => {
    setSelectedGroupForTransfer(null);
    setSelectedPretsForTransfer(new Set());
    setTransferTargetName('');
  };

  const openEditPaiementDialog = (index: number, montant: number) => {
    setSelectedPaiementIndex(index);
    setEditPaiementMontant(montant.toString());
    setEditPaiementDialogOpen(true);
  };

  const openDeletePaiementDialog = (index: number) => {
    setSelectedPaiementIndex(index);
    setDeletePaiementDialogOpen(true);
  };

  const handleEditPaiement = async () => {
    if (!selectedPret || selectedPaiementIndex === null) return;
    
    const newMontant = parseFloat(editPaiementMontant);
    if (isNaN(newMontant) || newMontant <= 0) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    try {
      setLoading(true);
      
      const paiementsUpdated = [...(selectedPret.paiements || [])];
      const oldMontant = paiementsUpdated[selectedPaiementIndex].montant;
      paiementsUpdated[selectedPaiementIndex] = {
        ...paiementsUpdated[selectedPaiementIndex],
        montant: newMontant
      };

      // Recalculer le total payé
      const nouvelleAvanceRecue = paiementsUpdated.reduce((sum, p) => sum + p.montant, 0);
      const nouveauReste = selectedPret.prixVente - nouvelleAvanceRecue;
      const nouveauEstPaye = nouveauReste <= 0;

      const updatedPret: PretProduit = {
        ...selectedPret,
        paiements: paiementsUpdated,
        avanceRecue: nouvelleAvanceRecue,
        reste: nouveauReste,
        estPaye: nouveauEstPaye
      };

      await pretProduitService.updatePretProduit(selectedPret.id, updatedPret);
      await fetchPrets();
      
      // Mettre à jour le prêt sélectionné pour le dialog
      setSelectedPret(updatedPret);
      
      toast({ 
        title: 'Succès', 
        description: `Paiement modifié de ${formatCurrency(oldMontant)} à ${formatCurrency(newMontant)}`, 
        variant: 'default', 
        className: 'notification-success' 
      });
      
      setEditPaiementDialogOpen(false);
      setSelectedPaiementIndex(null);
      setEditPaiementMontant('');
    } catch (error) {
      console.error('Erreur lors de la modification du paiement', error);
      toast({ title: 'Erreur', description: 'Impossible de modifier le paiement', variant: 'destructive', className: "notification-erreur", });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaiement = async () => {
    if (!selectedPret || selectedPaiementIndex === null) return;

    try {
      setLoading(true);
      
      const paiementsUpdated = [...(selectedPret.paiements || [])];
      const deletedMontant = paiementsUpdated[selectedPaiementIndex].montant;
      paiementsUpdated.splice(selectedPaiementIndex, 1);

      // Recalculer le total payé
      const nouvelleAvanceRecue = paiementsUpdated.reduce((sum, p) => sum + p.montant, 0);
      const nouveauReste = selectedPret.prixVente - nouvelleAvanceRecue;
      const nouveauEstPaye = nouveauReste <= 0;

      const updatedPret: PretProduit = {
        ...selectedPret,
        paiements: paiementsUpdated,
        avanceRecue: nouvelleAvanceRecue,
        reste: nouveauReste,
        estPaye: nouveauEstPaye
      };

      await pretProduitService.updatePretProduit(selectedPret.id, updatedPret);
      await fetchPrets();
      
      // Mettre à jour le prêt sélectionné pour le dialog
      setSelectedPret(updatedPret);
      
      toast({ 
        title: 'Succès', 
        description: `Paiement de ${formatCurrency(deletedMontant)} supprimé avec succès`, 
        variant: 'default', 
        className: 'notification-success' 
      });
      
      setDeletePaiementDialogOpen(false);
      setSelectedPaiementIndex(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du paiement', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer le paiement', variant: 'destructive', className: "notification-erreur", });
    } finally {
      setLoading(false);
    }
  };

  const togglePretSelection = (pretId: string) => {
    const newSelection = new Set(selectedPretsForTransfer);
    if (newSelection.has(pretId)) {
      newSelection.delete(pretId);
    } else {
      newSelection.add(pretId);
    }
    setSelectedPretsForTransfer(newSelection);
  };

  const selectAllPrets = (group: GroupedPrets) => {
    const allPretIds = group.prets.map(p => p.id);
    setSelectedPretsForTransfer(new Set(allPretIds));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (loading && prets.length === 0) {
    return (
      <PremiumLoading
        text="Chargement des Prêts Produits"
        size="md"
        variant="dashboard"
        showText={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900 p-6">
      <PretRetardNotification prets={prets} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Hero Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-sm rounded-full text-purple-600 dark:text-purple-400 text-sm font-semibold mb-6 border border-purple-200/50 dark:border-purple-800/50"
          >
            <CreditCard className="h-5 w-5 mr-2 animate-pulse" />
            Gestion Premium des Prêts
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Prêts Produits
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gérez vos prêts par personne avec élégance
          </p>
        </div>

        {/* Stats Cards - Cliquables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            onClick={() => setStatModalOpen('totalVentes')}
            className="cursor-pointer group"
          >
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-emerald-500/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-100 text-sm">Total Ventes</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalVentes)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-3 w-3" />
                  <span>Voir les détails</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onClick={() => setStatModalOpen('avances')}
            className="cursor-pointer group"
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-blue-500/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Avances Reçues</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalAvances)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-3 w-3" />
                  <span>Voir les détails</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onClick={() => setStatModalOpen('reste')}
            className="cursor-pointer group"
          >
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-orange-500/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-orange-100 text-sm">Reste à Payer</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalReste)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-orange-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-3 w-3" />
                  <span>Voir les détails</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            onClick={() => setStatModalOpen('pretsPayes')}
            className="cursor-pointer group"
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-purple-500/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100 text-sm">Prêts Payés</p>
                    <p className="text-2xl font-bold">{pretsPayes}/{prets.length}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-3 w-3" />
                  <span>Voir les détails</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Modals for Stats */}
        {/* Modal Total Ventes */}
        <Dialog open={statModalOpen === 'totalVentes'} onOpenChange={(open) => !open && setStatModalOpen(null)}>
          <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Détails - Total Ventes
                </span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                {/* Stats globales */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Montant Total</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                      {formatCurrency(totalVentes)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-400">Nombre de Prêts</span>
                    </div>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                      {prets.length}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-700 dark:text-purple-400">Clients</span>
                    </div>
                    <p className="text-xl font-bold text-purple-800 dark:text-purple-300">
                      {groupedPrets.length}
                    </p>
                  </div>
                </div>

                {/* Liste par client */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Répartition par Client
                </h3>
                <div className="space-y-2">
                  {groupedPrets.map(group => (
                    <div 
                      key={group.nom}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                          {group.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{group.nom}</span>
                          <p className="text-xs text-gray-500">{group.prets.length} prêt{group.prets.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-700 dark:text-emerald-400 font-bold">{formatCurrency(group.totalPrixVente)}</p>
                        {group.allPaid && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs">
                            Soldé
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Modal Avances Reçues */}
        <Dialog open={statModalOpen === 'avances'} onOpenChange={(open) => !open && setStatModalOpen(null)}>
          <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Détails - Avances Reçues
                </span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-400">Total Avances</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                      {formatCurrency(totalAvances)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Taux de Paiement</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                      {totalVentes > 0 ? ((totalAvances / totalVentes) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>

                {/* Liste par client */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Avances par Client
                </h3>
                <div className="space-y-2">
                  {groupedPrets.map(group => (
                    <div 
                      key={group.nom}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                          {group.nom.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{group.nom}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-700 dark:text-blue-400 font-bold">{formatCurrency(group.totalAvance)}</p>
                        <p className="text-xs text-gray-500">
                          {group.totalPrixVente > 0 ? ((group.totalAvance / group.totalPrixVente) * 100).toFixed(0) : 0}% payé
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Modal Reste à Payer */}
        <Dialog open={statModalOpen === 'reste'} onOpenChange={(open) => !open && setStatModalOpen(null)}>
          <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Détails - Reste à Payer
                </span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200/50 dark:border-orange-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span className="text-xs text-orange-700 dark:text-orange-400">Montant Restant</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                      {formatCurrency(totalReste)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-700 dark:text-amber-400">Clients en Attente</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                      {pendingGroups.length}
                    </p>
                  </div>
                </div>

                {/* Liste clients avec reste */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Montants en Attente par Client
                </h3>
                <div className="space-y-2">
                  {pendingGroups.map(group => (
                    <div 
                      key={group.nom}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          {group.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{group.nom}</span>
                          <p className="text-xs text-gray-500">{group.prets.filter(p => !p.estPaye).length} prêt(s) en attente</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-700 dark:text-orange-400 font-bold">{formatCurrency(group.totalReste)}</p>
                        <p className="text-xs text-gray-500">
                          sur {formatCurrency(group.totalPrixVente)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {pendingGroups.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Aucun paiement en attente 🎉</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Modal Prêts Payés */}
        <Dialog open={statModalOpen === 'pretsPayes'} onOpenChange={(open) => !open && setStatModalOpen(null)}>
          <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Détails - Prêts Soldés
                </span>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 py-2">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-700 dark:text-purple-400">Prêts Soldés</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                      {pretsPayes}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200/50 dark:border-orange-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-xs text-orange-700 dark:text-orange-400">En Attente</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                      {prets.length - pretsPayes}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Taux</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                      {prets.length > 0 ? ((pretsPayes / prets.length) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progression</span>
                    <span className="text-lg font-bold text-purple-600">
                      {pretsPayes}/{prets.length}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${prets.length > 0 ? (pretsPayes / prets.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Liste des clients soldés */}
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mt-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Clients Entièrement Soldés
                </h3>
                <div className="space-y-2">
                  {paidGroups.map(group => (
                    <div 
                      key={group.nom}
                      className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{group.nom}</span>
                          <p className="text-xs text-gray-500">{group.prets.length} prêt{group.prets.length > 1 ? 's' : ''} soldé{group.prets.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-700 dark:text-purple-400 font-bold">{formatCurrency(group.totalPrixVente)}</p>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs">
                          100% payé
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {paidGroups.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Aucun client entièrement soldé</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <Button 
            onClick={() => setDialogOpen(true)} 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-xl font-semibold"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Nouveau Prêt
          </Button>
        </motion.div>
        
        {/* Section Headers - Tous payés / En cours */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Section "Tous payés" */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all"
              onClick={() => toggleSection('paid')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {expandedSection === 'paid' ? (
                    <ChevronUp className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-emerald-600" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      Tous payés
                    </h2>
                  </div>
                </div>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {paidGroups.length} personne{paidGroups.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {expandedSection === 'paid' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 space-y-4 mt-4">
                    {paidGroups.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aucune personne avec tous les prêts payés</p>
                    ) : (
                      paidGroups.map((group) => (
                        <Card key={group.nom} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
                            onClick={() => toggleGroup(group.nom)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-2">
                                  {expandedGroups.has(group.nom) ? (
                                    <ChevronUp className="h-5 w-5 text-purple-600" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-purple-600" />
                                  )}
                                  <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {group.nom}
                                  </h3>
                                </div>
                                
                                {group.phone && (
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-bold text-blue-600">{group.phone}</span>
                                  </div>
                                )}

                                <span className="text-sm font-bold text-orange-500 dark:text-orange-400">
                                  {group.prets.length} prêt{group.prets.length > 1 ? 's' : ''}
                                </span>
                              </div>

                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Déjà fini
                              </span>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedGroups.has(group.nom) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                                  <div className="mt-4 space-y-3">
                                    {group.prets.map((pret) => (
                                      <div 
                                        key={pret.id}
                                        className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                      >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
                                            <div className="col-span-2 sm:col-span-1">
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{pret.description}</p>
                                            </div>
                                            
                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Date prêt</p>
                                              <p className="font-medium text-sm">{format(new Date(pret.date), 'dd/MM/yyyy')}</p>
                                            </div>

                                            <div className="hidden lg:block">
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Date paiement</p>
                                              <p className={`${getDatePaiementClass(pret)} text-sm`}>
                                                {pret.datePaiement ? format(new Date(pret.datePaiement), 'dd/MM/yyyy') : '-'}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                <span className="hidden sm:inline">Prix / Avance</span>
                                                <span className="sm:hidden">Prix/Av.</span>
                                              </p>
                                              <p className="font-semibold text-xs sm:text-sm">
                                                {formatCurrency(pret.prixVente).replace(',00', '')}
                                                <span className="hidden sm:inline"> / </span>
                                                <span className="sm:hidden">/</span>
                                                {formatCurrency(pret.avanceRecue).replace(',00', '')}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Reste</p>
                                              <p className="font-bold text-emerald-600 text-sm">{formatCurrency(pret.reste).replace(',00', '')}</p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1 sm:gap-2 ml-0 sm:ml-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                                            <span className="inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              <span className="hidden xs:inline">Déjà fini</span>
                                            </span>

                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPret(pret);
                                                setDetailDialogOpen(true);
                                              }} 
                                              className="p-1.5 sm:p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
                                              title="Voir détails"
                                            >
                                              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>

                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPret(pret);
                                                setDeleteDialogOpen(true);
                                              }} 
                                              className="p-1.5 sm:p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                              title="Supprimer"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total vente</p>
                                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(group.totalPrixVente)}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total avances</p>
                                        <p className="text-lg font-bold text-blue-600">{formatCurrency(group.totalAvance)}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total reste</p>
                                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(group.totalReste)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Section "En cours" */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-900/20 transition-all"
              onClick={() => toggleSection('pending')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {expandedSection === 'pending' ? (
                    <ChevronUp className="h-6 w-6 text-orange-600" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-orange-600" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      En cours
                    </h2>
                  </div>
                </div>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                  {pendingGroups.length} personne{pendingGroups.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {expandedSection === 'pending' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 space-y-4 mt-4">
                    {pendingGroups.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aucune personne avec des prêts en cours</p>
                    ) : (
                      pendingGroups.map((group) => (
                        <Card key={group.nom} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
                            onClick={() => toggleGroup(group.nom)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-2">
                                  {expandedGroups.has(group.nom) ? (
                                    <ChevronUp className="h-5 w-5 text-purple-600" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-purple-600" />
                                  )}
                                  <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {group.nom}
                                  </h3>
                                </div>
                                
                                {group.phone && (
                                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-bold text-blue-600">{group.phone}</span>
                                  </div>
                                )}

                                <span className="text-sm font-bold text-orange-500 dark:text-orange-400">
                                  {group.prets.length} prêt{group.prets.length > 1 ? 's' : ''}
                                </span>
                              </div>

                              <div className="flex items-center gap-6">
                                <motion.div className="text-right">
                                  <p className="text-sm text-gray-500 font-bold dark:text-gray-400">
                                    Total Reste à payer
                                  </p>
                                  <motion.p
                                    key={group.totalReste}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    className="text-lg font-bold text-red-600 dark:text-red-400"
                                  >
                                    {formatCurrency(group.totalReste)}
                                  </motion.p>
                                </motion.div>
                                
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-300 text-red-800 dark:bg-red-900/30 dark:text-red-600">
                                  <Clock className="h-4 w-4 mr-1" />
                                  En cours
                                </span>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedGroups.has(group.nom) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                                  <div className="mt-4 space-y-3">
                                    {group.prets.map((pret) => (
                                      <div 
                                        key={pret.id}
                                        className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                      >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
                                            <div className="col-span-2 sm:col-span-1">
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                                              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{pret.description}</p>
                                            </div>
                                            
                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Date prêt</p>
                                              <p className="font-medium text-sm">{format(new Date(pret.date), 'dd/MM/yyyy')}</p>
                                            </div>

                                            <div className="hidden lg:block">
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Date paiement</p>
                                              <p className={`${getDatePaiementClass(pret)} text-sm`}>
                                                {pret.datePaiement ? format(new Date(pret.datePaiement), 'dd/MM/yyyy') : '-'}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                <span className="hidden sm:inline">Prix / Avance</span>
                                                <span className="sm:hidden">Prix/Av.</span>
                                              </p>
                                              <p className="font-semibold text-xs sm:text-sm">
                                                {formatCurrency(pret.prixVente).replace(',00', '')}
                                                <span className="hidden sm:inline"> / </span>
                                                <span className="sm:hidden">/</span>
                                                {formatCurrency(pret.avanceRecue).replace(',00', '')}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">Reste</p>
                                              <p className="font-bold text-orange-600 text-sm">{formatCurrency(pret.reste).replace(',00', '')}</p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1 sm:gap-2 ml-0 sm:ml-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                                            <span className={`inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs font-semibold ${
                                              pret.estPaye 
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                            }`}>
                                              {pret.estPaye ? (
                                                <>
                                                  <CheckCircle className="h-3 w-3 mr-1" />
                                                  <span className="hidden xs:inline">Payé</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Clock className="h-3 w-3 mr-1" />
                                                  <span className="hidden xs:inline">En cours</span>
                                                </>
                                              )}
                                            </span>

                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPret(pret);
                                                setDetailDialogOpen(true);
                                              }} 
                                              className="p-1.5 sm:p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors"
                                              title="Voir détails"
                                            >
                                              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>

                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPret(pret);
                                                setAjoutAvance('');
                                                setAjoutAvanceDialogOpen(true);
                                              }} 
                                              className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
                                              title="Ajouter une avance"
                                            >
                                              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>

                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                selectPretForEdit(pret);
                                              }} 
                                              className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors hidden sm:block"
                                              title="Modifier"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </button>

                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPret(pret);
                                                setDeleteDialogOpen(true);
                                              }} 
                                              className="p-1.5 sm:p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                              title="Supprimer"
                                            >
                                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total vente</p>
                                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(group.totalPrixVente)}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total avances</p>
                                        <p className="text-lg font-bold text-blue-600">{formatCurrency(group.totalAvance)}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total reste</p>
                                        <p className="text-lg font-bold text-orange-600">{formatCurrency(group.totalReste)}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-center">
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedGroupForTransfer(group);
                                          setSelectedPretsForTransfer(new Set());
                                          setTransferTargetName('');
                                          setTransferDialogOpen(true);
                                        }}
                                        variant="outline"
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-300"
                                      >
                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                        Transférer les prêts
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Dialog Nouveau Prêt */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Ajouter un prêt de produit
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            {/* Type de client */}
            <div className="grid gap-4">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type de client</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={isNewClient ? "default" : "outline"}
                  onClick={() => {
                    setIsNewClient(true);
                    setNom('');
                    setPhone('');
                    setClientSearchQuery('');
                    setClientSearchResults([]);
                  }}
                  className={cn(
                    "w-full",
                    isNewClient && "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  )}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nouveau client
                </Button>
                <Button
                  type="button"
                  variant={!isNewClient ? "default" : "outline"}
                  onClick={() => {
                    setIsNewClient(false);
                    setNom('');
                    setPhone('');
                  }}
                  className={cn(
                    "w-full",
                    !isNewClient && "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Client existant
                </Button>
              </div>
            </div>

            {/* Recherche client existant */}
            {!isNewClient && (
              <div className="grid gap-2">
                <Label htmlFor="clientSearch" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Rechercher un client (min. 3 caractères)
                </Label>
                <Input
                  id="clientSearch"
                  value={clientSearchQuery}
                  onChange={(e) => handleClientSearch(e.target.value)}
                  placeholder="Tapez le nom du client..."
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
                {clientSearchQuery.length >= 3 && (
                  <>
                    {clientSearchResults.length > 0 ? (
                      <div className="border rounded-md max-h-40 overflow-y-auto bg-white dark:bg-gray-800 z-50">
                        {clientSearchResults.map((client) => (
                          <div
                            key={client.id}
                            className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b last:border-b-0"
                            onClick={() => selectClient(client)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">{client.nom}</div>
                                {client.phone && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3" />
                                    {client.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                        <p className="text-sm text-orange-700 dark:text-orange-400 text-center">
                          Aucun client trouvé avec les caractères "{clientSearchQuery}"
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="datePret" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date de prêt</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600",
                        !datePret && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datePret ? format(datePret, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={datePret}
                      onSelect={(newDate) => setDatePret(newDate || new Date())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="datePaiement" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date de paiement prévue</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600",
                        !datePaiement && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datePaiement ? format(datePaiement, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={datePaiement}
                      onSelect={setDatePaiement}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description du produit</Label>
              
              {/* Filtre par catégorie */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Filtre :</span>
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setProductCategoryFilter(option.value)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 border ${
                      productCategoryFilter === option.value
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:text-purple-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <Input
                id="description"
                value={description}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tapez pour rechercher un produit..."
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
              />
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
                  {filterProductsByCategory(searchResults, productCategoryFilter).map((product) => (
                    <div
                      key={product.id}
                      className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => selectProduct(product)}
                    >
                      <div className="text-sm font-medium">{product.description}</div>
                      <div className="text-xs text-gray-500">Prix: {formatCurrency(product.purchasePrice)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom du client</Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom du client"
                  disabled={!isNewClient && nom !== ''}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600 disabled:opacity-70"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+262 692 123 456"
                  disabled={!isNewClient && phone !== ''}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600 disabled:opacity-70"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prixVente" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prix de vente (€)</Label>
                <Input
                  id="prixVente"
                  type="number"
                  step="0.01"
                  value={prixVente}
                  onChange={(e) => setPrixVente(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="avanceRecue" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Avance reçue (€)</Label>
                <Input
                  id="avanceRecue"
                  type="number"
                  step="0.01"
                  value={avanceRecue}
                  onChange={(e) => setAvanceRecue(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {(prixVente || avanceRecue) && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Reste à payer:</span>
                  <span className={`font-bold text-lg ${reste <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(reste)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                  <span className={`text-sm font-semibold ${estPaye ? 'text-green-600' : 'text-orange-600'}`}>
                    {estPaye ? 'Entièrement payé' : 'Paiement en cours'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier Prêt */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Modifier un prêt
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editDatePaiement">Date de paiement prévue</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !datePaiement && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {datePaiement ? format(datePaiement, 'PP', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={datePaiement}
                    onSelect={setDatePaiement}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editNom">Nom du client</Label>
                <Input
                  id="editNom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom du client"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPhone">Téléphone</Label>
                <Input
                  id="editPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+262 692 123 456"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editAvanceRecue">Avance reçue (€)</Label>
              <Input
                id="editAvanceRecue"
                type="number"
                step="0.01"
                value={avanceRecue}
                onChange={(e) => setAvanceRecue(e.target.value)}
              />
            </div>

            {selectedPret && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Reste à payer:</span>
                  <span className={`font-bold text-lg ${reste <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(reste)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Ajouter Avance */}
      <Dialog open={ajoutAvanceDialogOpen} onOpenChange={setAjoutAvanceDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ajouter une avance</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedPret && (
              <>
                <div className="grid gap-2">
                  <Label>Client</Label>
                  <Input value={selectedPret.nom || '-'} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input value={selectedPret.description} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Avance actuelle</Label>
                  <Input value={formatCurrency(selectedPret.avanceRecue)} disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ajoutAvance">Montant à ajouter (€)</Label>
                  <Input
                    id="ajoutAvance"
                    type="number"
                    step="0.01"
                    value={ajoutAvance}
                    onChange={(e) => setAjoutAvance(e.target.value)}
                    placeholder="0.00"
                    className={montantDepasse ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                </div>
                {ajoutAvance && montantDepasse && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      ⚠️ Vous avez ajouté beaucoup trop de montant
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      Vous ne devez pas dépasser : <span className="font-bold">{formatCurrency(selectedPret.reste)}</span>
                    </p>
                  </div>
                )}
                {ajoutAvance && !montantDepasse && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Nouveau reste:</span>
                      <span className={`font-bold ${nouveauReste <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatCurrency(nouveauReste)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAjoutAvanceDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAjoutAvance} disabled={loading || montantDepasse || !ajoutAvance || parseFloat(ajoutAvance) <= 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Supprimer */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir supprimer ce prêt ?</p>
          {selectedPret && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="font-semibold">{selectedPret.description}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPret.nom}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails du prêt */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              <div className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-600" />
                Détails du prêt
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPret && (
            <div className="py-4 space-y-4">
              {/* Informations générales */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedPret.nom || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedPret.description}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date du prêt</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {format(new Date(selectedPret.date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date prévue de paiement</p>
                    <p className={getDatePaiementClass(selectedPret)}>
                      {selectedPret.datePaiement ? format(new Date(selectedPret.datePaiement), 'dd/MM/yyyy') : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Résumé financier */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Prix total</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedPret.prixVente)}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total payé</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedPret.avanceRecue)}</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reste à payer</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(selectedPret.reste)}</p>
                </div>
              </div>

              {/* Historique des paiements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Historique des paiements
                  </Label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedPret.paiements?.length || 0} paiement{(selectedPret.paiements?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {selectedPret.paiements && selectedPret.paiements.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2 sm:p-3 bg-gray-50 dark:bg-gray-900/50">
                    {selectedPret.paiements.map((paiement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex-shrink-0">
                            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              Avance {index + 1}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(paiement.date), 'dd/MM/yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className="text-sm sm:text-lg font-bold text-emerald-600 whitespace-nowrap">
                            +{formatCurrency(paiement.montant)}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              onClick={() => openEditPaiementDialog(index, paiement.montant)}
                            >
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => openDeletePaiementDialog(index)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aucun paiement enregistré pour ce prêt
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Modifier Paiement */}
      <AlertDialog open={editPaiementDialogOpen} onOpenChange={setEditPaiementDialogOpen}>
        <AlertDialogContent className="sm:max-w-[450px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-blue-600" />
              Modifier le paiement
            </AlertDialogTitle>
            <AlertDialogDescription>
              Modifiez le montant de ce paiement. Le total payé et le reste à payer seront automatiquement recalculés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="editMontant" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nouveau montant (€)
            </Label>
            <Input
              id="editMontant"
              type="number"
              step="0.01"
              value={editPaiementMontant}
              onChange={(e) => setEditPaiementMontant(e.target.value)}
              className="mt-2"
              placeholder="Saisissez le nouveau montant"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setEditPaiementDialogOpen(false);
              setSelectedPaiementIndex(null);
              setEditPaiementMontant('');
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEditPaiement}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog Supprimer Paiement */}
      <AlertDialog open={deletePaiementDialogOpen} onOpenChange={setDeletePaiementDialogOpen}>
        <AlertDialogContent className="sm:max-w-[450px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Supprimer le paiement
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible. 
              Le total payé et le reste à payer seront automatiquement recalculés.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeletePaiementDialogOpen(false);
              setSelectedPaiementIndex(null);
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePaiement}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Transfert */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6 text-indigo-600" />
                Transférer des prêts
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedGroupForTransfer && (
            <div className="py-4 space-y-6">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Source</p>
                <p className="text-lg font-bold text-indigo-600">{selectedGroupForTransfer.nom}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedGroupForTransfer.prets.length} prêt{selectedGroupForTransfer.prets.length > 1 ? 's' : ''} au total
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Sélectionnez les prêts à transférer
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectAllPrets(selectedGroupForTransfer)}
                    className="text-xs"
                  >
                    Tout sélectionner
                  </Button>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50">
                  {selectedGroupForTransfer.prets.map((pret) => (
                    <div
                      key={pret.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Checkbox
                        checked={selectedPretsForTransfer.has(pret.id)}
                        onCheckedChange={() => togglePretSelection(pret.id)}
                      />
                      <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{pret.description}</p>
                          <p className="text-xs text-gray-500">{format(new Date(pret.date), 'dd/MM/yyyy')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">Prix</p>
                          <p className="font-semibold">{formatCurrency(pret.prixVente)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600 dark:text-gray-400">Reste</p>
                          <p className="font-bold text-orange-600">{formatCurrency(pret.reste)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPretsForTransfer.size} prêt{selectedPretsForTransfer.size > 1 ? 's' : ''} sélectionné{selectedPretsForTransfer.size > 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferTarget" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nom de la personne de destination
                </Label>
                <div className="space-y-2">
                  <Input
                    id="transferTarget"
                    value={transferTargetName}
                    onChange={(e) => setTransferTargetName(e.target.value)}
                    placeholder="Saisissez le nom de la personne..."
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                  />
                  
                  {groupedPrets.length > 0 && transferTargetName === '' && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Personnes existantes:</p>
                      <div className="flex flex-wrap gap-2">
                        {groupedPrets
                          .filter(g => g.nom !== selectedGroupForTransfer.nom)
                          .map(g => (
                            <button
                              key={g.nom}
                              onClick={() => setTransferTargetName(g.nom)}
                              className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                              {g.nom}
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedPretsForTransfer.size > 0 && transferTargetName && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Résumé du transfert:</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {selectedPretsForTransfer.size} prêt{selectedPretsForTransfer.size > 1 ? 's' : ''} de{' '}
                    <span className="text-indigo-600">{selectedGroupForTransfer.nom}</span> vers{' '}
                    <span className="text-purple-600">{transferTargetName}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setTransferDialogOpen(false);
              resetTransferForm();
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleTransfer} 
              disabled={loading || selectedPretsForTransfer.size === 0 || !transferTargetName}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRightLeft className="h-4 w-4 mr-2" />}
              Transférer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PretProduitsGrouped;
