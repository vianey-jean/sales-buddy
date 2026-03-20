import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  CalendarIcon, Loader2, Wallet, CreditCard, Plus, ArrowUp, ArrowDown,
  Receipt, HandCoins, DollarSign, Sparkles, Award, Users, TrendingDown, TrendingUp, Eye,
  Edit2, Trash2,
  Euro
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pretFamilleService } from '@/service/api';
import { PretFamille } from '@/types';
import PremiumLoading from '@/components/ui/premium-loading';
import { realtimeService } from '@/services/realtimeService';
import ConfirmDeleteDialog from '@/components/dashboard/forms/ConfirmDeleteDialog';

const PretFamilles: React.FC = () => {
  const [prets, setPrets] = useState<PretFamille[]>([]);
  const [loading, setLoading] = useState(false);
  const [remboursementDialogOpen, setRemboursementDialogOpen] = useState(false);
  const [demandePretDialogOpen, setDemandePretDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editRemboursementDialogOpen, setEditRemboursementDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [remboursementIndexToDelete, setRemboursementIndexToDelete] = useState<number>(-1);
  const [selectedPretToDelete, setSelectedPretToDelete] = useState<PretFamille | null>(null);
  const [deletePretDialogOpen, setDeletePretDialogOpen] = useState(false);
  const [editPretDialogOpen, setEditPretDialogOpen] = useState(false);
  const [selectedPretIndex, setSelectedPretIndex] = useState<number>(-1);
  const [editMontantPret, setEditMontantPret] = useState('');
  const [editDatePret, setEditDatePret] = useState<Date>(new Date());
  const [confirmDeletePretDialogOpen, setConfirmDeletePretDialogOpen] = useState(false);
  const [pretIndexToDelete, setPretIndexToDelete] = useState<number>(-1);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<PretFamille[]>([]);
  const [selectedPret, setSelectedPret] = useState<PretFamille | null>(null);
  const [selectedPretForDetail, setSelectedPretForDetail] = useState<PretFamille | null>(null);
  const [selectedRemboursementIndex, setSelectedRemboursementIndex] = useState<number>(-1);
  const [editMontantRemboursement, setEditMontantRemboursement] = useState('');
  const [editDateRemboursement, setEditDateRemboursement] = useState<Date>(new Date());
  const [montantRemboursement, setMontantRemboursement] = useState('');
  const [montantRemboursementError, setMontantRemboursementError] = useState('');
  const [editMontantError, setEditMontantError] = useState('');
  const [nouvNom, setNouvNom] = useState('');
  const [nouvPretTotal, setNouvPretTotal] = useState('');
  const [nouvDate, setNouvDate] = useState<Date>(new Date());
  const [nouvSearchResults, setNouvSearchResults] = useState<PretFamille[]>([]);
  const [selectedFamilleForPret, setSelectedFamilleForPret] = useState<PretFamille | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchPrets = async () => {
      try {
        setLoading(true);
        const data = await pretFamilleService.getPretFamilles();
        // Initialiser remboursements et prets si non présent
        const pretsWithRemboursements = data.map(pret => ({
          ...pret,
          remboursements: pret.remboursements || [],
          prets: pret.prets || []
        }));
        setPrets(pretsWithRemboursements);
      } catch (error) {
        console.error('Erreur lors du chargement des prêts', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les prêts familles',
          variant: 'destructive',
           className: "notification-erreur",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrets();
  }, [toast]);

  // Synchronisation en temps réel pour les prêts familles
  useEffect(() => {
    const unsubscribe = realtimeService.addDataListener((data) => {
      if (data.pretFamilles) {
        console.log('📡 Mise à jour temps réel des prêts familles:', data.pretFamilles);
        const pretsWithRemboursements = data.pretFamilles.map((pret: PretFamille) => ({
          ...pret,
          remboursements: pret.remboursements || [],
          prets: pret.prets || []
        }));
        setPrets(pretsWithRemboursements);
        
        // Mettre à jour le prêt sélectionné pour les détails si nécessaire
        if (selectedPretForDetail) {
          const updatedSelectedPret = pretsWithRemboursements.find(
            (p: PretFamille) => p.id === selectedPretForDetail.id
          );
          if (updatedSelectedPret) {
            setSelectedPretForDetail(updatedSelectedPret);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedPretForDetail]);

  const totalPret = prets.reduce((sum, pret) => sum + pret.pretTotal, 0);
  const totalSolde = prets.reduce((sum, pret) => sum + pret.soldeRestant, 0);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length >= 3) {
      try {
        const results = await pretFamilleService.searchByName(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectFamille = (pret: PretFamille) => {
    setSelectedPret(pret);
    setSearchText(pret.nom);
    setSearchResults([]);
    setMontantRemboursement('');
    setMontantRemboursementError('');
  };

  // Validation du montant de remboursement
  const validateMontantRemboursement = (montant: string) => {
    if (!selectedPret) {
      setMontantRemboursementError('');
      return false;
    }

    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) {
      setMontantRemboursementError('');
      return false;
    }

    if (montantNum > selectedPret.soldeRestant) {
      setMontantRemboursementError(`Ne dépasse pas ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPret.soldeRestant)}`);
      return false;
    }

    setMontantRemboursementError('');
    return true;
  };

  // Validation du montant de modification de remboursement
  const validateEditMontant = (montant: string) => {
    if (!selectedPretForDetail || selectedRemboursementIndex < 0) {
      setEditMontantError('');
      return false;
    }

    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum < 0) {
      setEditMontantError('');
      return false;
    }

    const montantActuel = selectedPretForDetail.remboursements?.[selectedRemboursementIndex]?.montant || 0;
    const resteAPayer = selectedPretForDetail.soldeRestant;
    const maxMontant = resteAPayer + montantActuel;

    if (montantNum > maxMontant) {
      setEditMontantError(`Ne dépasse pas ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(maxMontant)}`);
      return false;
    }

    setEditMontantError('');
    return true;
  };

  const handleRemboursement = async () => {
    if (!selectedPret) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une famille', variant: 'destructive', className: "notification-erreur", });
      return;
    }
    if (!montantRemboursement || parseFloat(montantRemboursement) <= 0) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    if (!validateMontantRemboursement(montantRemboursement)) {
      return;
    }

    const montant = parseFloat(montantRemboursement);

    try {
      setLoading(true);
      const dateAujourdhui = new Date().toISOString().split('T')[0];
      const nouveauRemboursement = {
        date: dateAujourdhui,
        montant: montant
      };
      
      const rembourssementsActuels = selectedPret.remboursements || [];
      const updatedPret: PretFamille = {
        ...selectedPret,
        soldeRestant: selectedPret.soldeRestant - montant,
        dernierRemboursement: montant,
        dateRemboursement: dateAujourdhui,
        remboursements: [...rembourssementsActuels, nouveauRemboursement]
      };
      await pretFamilleService.updatePretFamille(selectedPret.id, updatedPret);
      const updatedPrets = await pretFamilleService.getPretFamilles();
      const pretsWithRemboursements = updatedPrets.map(pret => ({
        ...pret,
        remboursements: pret.remboursements || [],
        prets: pret.prets || []
      }));
      setPrets(pretsWithRemboursements);
      toast({ title: 'Succès', description: 'Remboursement enregistré', variant: 'default', className: 'notification-success' });
      setSelectedPret(null);
      setSearchText('');
      setMontantRemboursement('');
      setMontantRemboursementError('');
      setRemboursementDialogOpen(false);
    } catch (error) {
      console.error('Erreur remboursement', error);
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer le remboursement', variant: 'destructive', className: "notification-erreur", });
    } finally {
      setLoading(false);
    }
  };

  const handleNouvNomSearch = async (text: string) => {
    setNouvNom(text);
    setSelectedFamilleForPret(null);
    
    if (text.length >= 3) {
      try {
        const results = await pretFamilleService.searchByName(text);
        setNouvSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche', error);
        setNouvSearchResults([]);
      }
    } else {
      setNouvSearchResults([]);
    }
  };

  const selectFamilleForPret = (pret: PretFamille) => {
    setSelectedFamilleForPret(pret);
    setNouvNom(pret.nom);
    setNouvSearchResults([]);
  };

  const handleDemandePret = async () => {
    if (!nouvNom) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un nom', variant: 'destructive', className: "notification-erreur", });
      return;
    }
    if (!nouvPretTotal || parseFloat(nouvPretTotal) <= 0) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    try {
      setLoading(true);
      const dateAujourdhui = format(nouvDate, 'yyyy-MM-dd');
      
      // Si une famille existante a été sélectionnée, on ajoute au prêt existant
      if (selectedFamilleForPret) {
        const nouveauMontant = parseFloat(nouvPretTotal);
        const pretsActuels = selectedFamilleForPret.prets || [];
        const nouveauPret = {
          date: dateAujourdhui,
          montant: nouveauMontant
        };
        
        const updatedPret: PretFamille = {
          ...selectedFamilleForPret,
          pretTotal: selectedFamilleForPret.pretTotal + nouveauMontant,
          soldeRestant: selectedFamilleForPret.soldeRestant + nouveauMontant,
          dateRemboursement: dateAujourdhui,
          prets: [...pretsActuels, nouveauPret]
        };
        await pretFamilleService.updatePretFamille(selectedFamilleForPret.id, updatedPret);
        toast({ title: 'Succès', description: `Prêt de ${nouveauMontant}€ ajouté à ${selectedFamilleForPret.nom}`, variant: 'default', className: 'notification-success' });
      } else {
        // Sinon, on crée un nouveau prêt
        const newPret: Omit<PretFamille, 'id'> = {
          nom: nouvNom,
          pretTotal: parseFloat(nouvPretTotal),
          soldeRestant: parseFloat(nouvPretTotal),
          dernierRemboursement: 0,
          dateRemboursement: dateAujourdhui,
          remboursements: [],
          prets: [{
            date: dateAujourdhui,
            montant: parseFloat(nouvPretTotal)
          }]
        };
        await pretFamilleService.addPretFamille(newPret);
        toast({ title: 'Succès', description: 'Nouveau prêt créé', variant: 'default', className: 'notification-success' });
      }
      
      const updatedPrets = await pretFamilleService.getPretFamilles();
      const pretsWithRemboursements = updatedPrets.map(pret => ({
        ...pret,
        remboursements: pret.remboursements || [],
        prets: pret.prets || []
      }));
      setPrets(pretsWithRemboursements);
      setNouvNom('');
      setNouvPretTotal('');
      setNouvDate(new Date());
      setSelectedFamilleForPret(null);
      setNouvSearchResults([]);
      setDemandePretDialogOpen(false);
    } catch (error) {
      console.error('Erreur demande de prêt', error);
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer la demande de prêt', variant: 'destructive' , className: "notification-erreur",});
    } finally {
      setLoading(false);
    }
  };

  const openEditRemboursementDialog = (remboursementIndex: number) => {
    if (!selectedPretForDetail) return;
    
    setSelectedRemboursementIndex(remboursementIndex);
    const remboursement = selectedPretForDetail.remboursements?.[remboursementIndex];
    if (remboursement) {
      setEditMontantRemboursement(remboursement.montant.toString());
      setEditDateRemboursement(new Date(remboursement.date));
    }
    setEditMontantError('');
    setEditRemboursementDialogOpen(true);
  };

  const handleEditRemboursement = async () => {
    if (!selectedPretForDetail || selectedRemboursementIndex < 0) return;
    if (!editMontantRemboursement || parseFloat(editMontantRemboursement) < 0) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide', variant: 'destructive', className: "notification-erreur", });
      return;
    }

    if (!validateEditMontant(editMontantRemboursement)) {
      return;
    }

    try {
      setLoading(true);
      const nouveauMontant = parseFloat(editMontantRemboursement);
      const remboursements = [...(selectedPretForDetail.remboursements || [])];
      
      // 1. Récupérer l'ancien montant à modifier
      const ancienMontant = remboursements[selectedRemboursementIndex].montant;
      
      // 2. Calculer la différence entre ancien et nouveau montant
      const difference = ancienMontant - nouveauMontant;
      
      // 3. Calculer le nouveau reste à payer
      // Si différence positive (réduction du remboursement), on augmente le reste à payer
      // Si différence négative (augmentation du remboursement), on diminue le reste à payer
      const nouveauResteAPayer = selectedPretForDetail.soldeRestant + difference;
      
      // 4. Mettre à jour le montant et la date du remboursement spécifique
      remboursements[selectedRemboursementIndex] = {
        ...remboursements[selectedRemboursementIndex],
        montant: nouveauMontant,
        date: format(editDateRemboursement, 'yyyy-MM-dd')
      };
      
      const updatedPret: PretFamille = {
        ...selectedPretForDetail,
        soldeRestant: nouveauResteAPayer,
        dernierRemboursement: remboursements.length > 0 ? remboursements[remboursements.length - 1].montant : 0,
        remboursements: remboursements
      };
      
      await pretFamilleService.updatePretFamille(selectedPretForDetail.id, updatedPret);
      const updatedPrets = await pretFamilleService.getPretFamilles();
      const pretsWithRemboursements = updatedPrets.map(pret => ({
        ...pret,
        remboursements: pret.remboursements || [],
        prets: pret.prets || []
      }));
      setPrets(pretsWithRemboursements);
      
      // Mettre à jour le prêt sélectionné pour les détails
      const updatedSelectedPret = pretsWithRemboursements.find(p => p.id === selectedPretForDetail.id);
      if (updatedSelectedPret) {
        setSelectedPretForDetail(updatedSelectedPret);
      }
      
      toast({ 
        title: 'Succès', 
        description: 'Remboursement modifié avec succès', 
        variant: 'default',
        className: 'notification-success'
      });
      
      setEditRemboursementDialogOpen(false);
      setEditMontantRemboursement('');
      setEditDateRemboursement(new Date());
      setEditMontantError('');
      setSelectedRemboursementIndex(-1);
    } catch (error) {
      console.error('Erreur lors de la modification du remboursement', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de modifier le remboursement', 
        variant: 'destructive' ,
         className: "notification-erreur",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteRemboursementDialog = (remboursementIndex: number) => {
    setRemboursementIndexToDelete(remboursementIndex);
    setConfirmDeleteDialogOpen(true);
  };

  const handleDeleteRemboursement = async () => {
    if (!selectedPretForDetail || remboursementIndexToDelete < 0) return;

    try {
      setLoading(true);
      const remboursements = [...(selectedPretForDetail.remboursements || [])];
      
      // 1. Récupérer la valeur à supprimer depuis la base de données
      const Valeur = remboursements[remboursementIndexToDelete].montant;
      
      // 2. Récupérer le total remboursé actuel depuis la base de données
      const TotalRembourse = selectedPretForDetail.pretTotal - selectedPretForDetail.soldeRestant;
      
      // 3. Calculer le nouveau total remboursé
      const Rembourse = TotalRembourse - Valeur;
      
      // 4. Calculer le nouveau reste à payer
      const nouveauResteAPayer = selectedPretForDetail.soldeRestant + Valeur;
      
      // 5. Supprimer le remboursement de l'historique
      remboursements.splice(remboursementIndexToDelete, 1);
      
      const updatedPret: PretFamille = {
        ...selectedPretForDetail,
        soldeRestant: nouveauResteAPayer,
        dernierRemboursement: remboursements.length > 0 ? remboursements[remboursements.length - 1].montant : 0,
        remboursements: remboursements
      };
      
      await pretFamilleService.updatePretFamille(selectedPretForDetail.id, updatedPret);
      const updatedPrets = await pretFamilleService.getPretFamilles();
      const pretsWithRemboursements = updatedPrets.map(pret => ({
        ...pret,
        remboursements: pret.remboursements || [],
        prets: pret.prets || []
      }));
      setPrets(pretsWithRemboursements);
      
      // Mettre à jour le prêt sélectionné pour les détails
      const updatedSelectedPret = pretsWithRemboursements.find(p => p.id === selectedPretForDetail.id);
      if (updatedSelectedPret) {
        setSelectedPretForDetail(updatedSelectedPret);
      }
      
      toast({ 
        title: 'Succès', 
        description: `Remboursement de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Valeur)} supprimé avec succès`, 
        variant: 'default',
        className: 'notification-success'
      });

      setConfirmDeleteDialogOpen(false);
      setRemboursementIndexToDelete(-1);
    } catch (error) {
      console.error('Erreur lors de la suppression du remboursement', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de supprimer le remboursement', 
        variant: 'destructive' ,
         className: "notification-erreur",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeletePretDialog = (pret: PretFamille) => {
    setSelectedPretToDelete(pret);
    setDeletePretDialogOpen(true);
  };

  const handleDeletePret = async () => {
    if (!selectedPretToDelete) return;

    try {
      setLoading(true);
      await pretFamilleService.deletePretFamille(selectedPretToDelete.id);
      
      const updatedPrets = await pretFamilleService.getPretFamilles();
      const pretsWithRemboursements = updatedPrets.map(pret => ({
        ...pret,
        remboursements: pret.remboursements || [],
        prets: pret.prets || []
      }));
      setPrets(pretsWithRemboursements);
      
      toast({ 
        title: 'Succès', 
        description: `Prêt de ${selectedPretToDelete.nom} supprimé avec succès`, 
        variant: 'default',
        className: 'notification-success'
      });
      
      setDeletePretDialogOpen(false);
      setSelectedPretToDelete(null);
      
      // Fermer le dialog de détails si c'était le prêt supprimé
      if (selectedPretForDetail?.id === selectedPretToDelete.id) {
        setDetailDialogOpen(false);
        setSelectedPretForDetail(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du prêt', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de supprimer le prêt', 
        variant: 'destructive' ,
         className: "notification-erreur",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le dialogue pour modifier un prêt de l'historique
  const openEditPretDialog = (pretIndex: number) => {
    if (!selectedPretForDetail) return;
    
    setSelectedPretIndex(pretIndex);
    const pret = selectedPretForDetail.prets?.[pretIndex];
    if (pret) {
      setEditMontantPret(pret.montant.toString());
      setEditDatePret(new Date(pret.date));
    }
    setEditPretDialogOpen(true);
  };

  // Modifier un prêt de l'historique
  const handleEditPret = async () => {
    if (!selectedPretForDetail || selectedPretIndex < 0) return;
    if (!editMontantPret || parseFloat(editMontantPret) <= 0) {
      toast({ title: 'Erreur', description: 'Veuillez saisir un montant valide', variant: 'destructive' , className: "notification-erreur",});
      return;
    }

    try {
      setLoading(true);
      const nouveauMontant = parseFloat(editMontantPret);
      const prets = [...(selectedPretForDetail.prets || [])];
      
      // Récupérer l'ancien montant
      const ancienMontant = prets[selectedPretIndex].montant;
      
      // Calculer la différence
      const difference = nouveauMontant - ancienMontant;
      
      // Mettre à jour le montant et la date du prêt spécifique
      prets[selectedPretIndex] = {
        montant: nouveauMontant,
        date: format(editDatePret, 'yyyy-MM-dd')
      };
      
      const updatedPret: PretFamille = {
        ...selectedPretForDetail,
        pretTotal: selectedPretForDetail.pretTotal + difference,
        soldeRestant: selectedPretForDetail.soldeRestant + difference,
        prets: prets
      };
      
      await pretFamilleService.updatePretFamille(selectedPretForDetail.id, updatedPret);
      const updatedPrets = await pretFamilleService.getPretFamilles();
      const pretsWithRemboursements = updatedPrets.map(pret => ({
        ...pret,
        remboursements: pret.remboursements || [],
        prets: pret.prets || []
      }));
      setPrets(pretsWithRemboursements);
      
      // Mettre à jour le prêt sélectionné pour les détails
      const updatedSelectedPret = pretsWithRemboursements.find(p => p.id === selectedPretForDetail.id);
      if (updatedSelectedPret) {
        setSelectedPretForDetail(updatedSelectedPret);
      }
      
      toast({ 
        title: 'Succès', 
        description: 'Prêt modifié avec succès', 
        variant: 'default',
        className: 'notification-success'
      });
      
      setEditPretDialogOpen(false);
      setEditMontantPret('');
      setEditDatePret(new Date());
      setSelectedPretIndex(-1);
    } catch (error) {
      console.error('Erreur lors de la modification du prêt', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de modifier le prêt', 
        variant: 'destructive' ,
         className: "notification-erreur",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le dialogue de confirmation de suppression d'un prêt
  const openDeletePretFromHistoryDialog = (pretIndex: number) => {
    setPretIndexToDelete(pretIndex);
    setConfirmDeletePretDialogOpen(true);
  };

  // Supprimer un prêt de l'historique
  const handleDeletePretFromHistory = async () => {
    if (!selectedPretForDetail || pretIndexToDelete < 0) return;

    try {
      setLoading(true);
      const prets = [...(selectedPretForDetail.prets || [])];
      
      // Récupérer le montant à supprimer
      const montantSuppr = prets[pretIndexToDelete].montant;
      
      // Supprimer le prêt de l'historique
      prets.splice(pretIndexToDelete, 1);
      
      const updatedPret: PretFamille = {
        ...selectedPretForDetail,
        pretTotal: selectedPretForDetail.pretTotal - montantSuppr,
        soldeRestant: selectedPretForDetail.soldeRestant - montantSuppr,
        prets: prets
      };
      
      await pretFamilleService.updatePretFamille(selectedPretForDetail.id, updatedPret);
      const updatedPrets = await pretFamilleService.getPretFamilles();
      const pretsWithRemboursements = updatedPrets.map(pret => ({
        ...pret,
        remboursements: pret.remboursements || [],
        prets: pret.prets || []
      }));
      setPrets(pretsWithRemboursements);
      
      // Mettre à jour le prêt sélectionné pour les détails
      const updatedSelectedPret = pretsWithRemboursements.find(p => p.id === selectedPretForDetail.id);
      if (updatedSelectedPret) {
        setSelectedPretForDetail(updatedSelectedPret);
      }
      
      toast({ 
        title: 'Succès', 
        description: `Prêt de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montantSuppr)} supprimé avec succès`, 
        variant: 'default',
        className: 'notification-success'
      });

      setConfirmDeletePretDialogOpen(false);
      setPretIndexToDelete(-1);
    } catch (error) {
      console.error('Erreur lors de la suppression du prêt', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de supprimer le prêt', 
        variant: 'destructive' ,
         className: "notification-erreur",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Rendu conditionnel pour affichage du loader personnalisé
  if (loading) {
    return (
      <PremiumLoading 
        text="Chargement des Prêts Familles"
        size="md"
        variant="dashboard"
        showText={true}
      />
    );
  }

  // ❗ Le reste de ton composant JSX reste inchangé (header, tableaux, dialogues)
  // 👉 Tu peux maintenant réutiliser ton code existant pour toute l’interface en-dessous de cette condition.

  return (
       <div className="mt-6 space-y-6">
      {/* Header avec design luxueux */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 md:p-4">
              <HandCoins className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Prêts aux Familles</h2>
              <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg hidden sm:block">Gestion premium des prêts familiaux</p>
            </div>
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white animate-pulse" />
          </div>

          {/* Stats rapides */}
         <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-5">
  {/* Carte Familles */}
  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl 
                  bg-gradient-to-br from-white/25 to-white/5 
                  backdrop-blur-xl border border-white/20 
                  shadow-[0_20px_50px_rgba(0,0,0,0.25)]
                  px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-center">
    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

    <div className="flex items-center justify-center gap-2 mb-1">
      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
      <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide">
        {prets.length}
      </div>
    </div>

    <div className="text-white/70 text-xs sm:text-sm uppercase tracking-widest">
      Familles
    </div>
  </div>

  {/* Carte Total prêté */}
  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl 
                  bg-gradient-to-br from-emerald-400/25 to-emerald-900/10 
                  backdrop-blur-xl border border-emerald-300/30 
                  shadow-[0_20px_50px_rgba(16,185,129,0.25)]
                  px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-center">
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 via-transparent to-transparent pointer-events-none" />

    <div className="flex items-center justify-center gap-2 mb-1">
      <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-200" />
      <div className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-emerald-200">
        {new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(totalPret)}
      </div>
    </div>

    <div className="text-white/70 text-xs sm:text-sm uppercase tracking-widest">
      Total prêté
    </div>
  </div>
</div>

{/* Boutons d'action luxe */}
<div className="flex flex-row sm:flex-col gap-3 sm:gap-4 w-full sm:w-auto mt-4">
  {/* Bouton Remboursement */}
  <Button
    onClick={() => setRemboursementDialogOpen(true)}
    className="group relative flex-1 sm:flex-none overflow-hidden
               rounded-xl sm:rounded-2xl
               bg-gradient-to-br from-white/30 to-white/10
               backdrop-blur-xl border border-white/30
               text-white font-medium
               shadow-[0_15px_40px_rgba(0,0,0,0.25)]
               transition-all duration-300
               hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,255,255,0.25)]
               px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm"
  >
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <span className="relative flex items-center justify-center">
      <Receipt className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white/90" />
      <span className="hidden xs:inline">Remboursement</span>
      <span className="xs:hidden">Rembours.</span>
    </span>
  </Button>

  {/* Bouton Nouveau Prêt */}
  <Button
    onClick={() => setDemandePretDialogOpen(true)}
    className="group relative flex-1 sm:flex-none overflow-hidden
               rounded-xl sm:rounded-2xl
               bg-gradient-to-br from-emerald-500 to-emerald-700
               border border-emerald-300/40
               text-white font-semibold
               shadow-[0_15px_40px_rgba(16,185,129,0.45)]
               transition-all duration-300
               hover:scale-105 hover:shadow-[0_20px_60px_rgba(16,185,129,0.6)]
               px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm"
  >
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <span className="relative flex items-center justify-center">
      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
      <span className="hidden xs:inline">Nouveau Prêt</span>
      <span className="xs:hidden">Nouveau</span>
    </span>
  </Button>
</div>

        </div>
      </div>

      {/* Tableau modernisé */}
      <Card className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden -mx-3 sm:mx-0">
        <div className="p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full p-6">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Chargement des données...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Veuillez patienter</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table className="w-full text-xs sm:text-sm md:text-base">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-none hover:bg-gradient-to-r">
                    <TableHead className="font-bold text-indigo-600 dark:text-indigo-400 text-center px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Nom</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400 px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Prêt Total</span>
                        <span className="sm:hidden">Total</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400 px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Solde Restant</span>
                        <span className="sm:hidden">Solde</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400 px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 hidden md:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Dernier Remboursement
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold text-indigo-600 dark:text-indigo-400 px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 hidden lg:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-bold text-indigo-600 dark:text-indigo-400 px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                      <span className="hidden sm:inline">Détails</span>
                      <span className="sm:hidden">...</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prets.map((pret, index) => (
                    <TableRow 
                      key={pret.id} 
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 border-b border-gray-100/50 dark:border-gray-700/50"
                    >
                      <TableCell className="font-medium px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{pret.nom}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full inline-block">
                          <CreditCard className="inline-block mr-1 h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 hidden sm:inline" />
                          <span className="font-bold text-blue-700 dark:text-blue-300">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(pret.pretTotal)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                        <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full inline-block">
                          <ArrowDown className="inline-block mr-1 h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 hidden sm:inline" />
                          <span className="font-bold text-red-700 dark:text-red-300">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(pret.soldeRestant)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 hidden md:table-cell">
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full inline-block">
                          <ArrowUp className="inline-block mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(pret.dernierRemboursement)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 hidden lg:table-cell">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">{pret.dateRemboursement}</span>
                      </TableCell>
                      <TableCell className="text-center px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPretForDetail(pret);
                              setDetailDialogOpen(true);
                            }}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 p-1 sm:p-2"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeletePretDialog(pret)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 p-1 sm:p-2"
                            title="Suppression prêt"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Ligne des totaux avec design premium */}
                  <TableRow className="border-none">
                    <TableCell className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white border-b border-white rounded-bl-3xl">
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5" />
                        <span className="font-bold text-lg">TOTAL</span>
                      </div>
                    </TableCell>

                            <TableCell className="text-right bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white border-b border-white">
                              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                                <span className="font-bold text-lg text-blue-200">
                                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalPret)}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="text-right bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white border-b border-white">
                              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                                <span className="font-bold text-lg text-red-200">
                                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalSolde)}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell colSpan={3} className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white border-b border-white rounded-br-3xl">
                            </TableCell>
                          </TableRow>

                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog pour voir les détails d'un prêt */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                <Eye className="h-5 w-5 text-white" />
              </div>
              Détails du prêt
            </DialogTitle>
          </DialogHeader>
          {selectedPretForDetail && (
            <div className="space-y-6 py-4">
              {/* Info générale */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 rounded-2xl border border-gray-200/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">Informations générales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Famille:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedPretForDetail.nom}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Date de début:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedPretForDetail.dateRemboursement}</span>
                  </div>
                </div>
              </div>

              {/* Résumé financier */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-200/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">Résumé financier</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Montant total du prêt:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPretForDetail.pretTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total remboursé:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPretForDetail.pretTotal - selectedPretForDetail.soldeRestant)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Reste à payer:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPretForDetail.soldeRestant)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Historique des prêts */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-200/50">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Historique des prêts</h3>
                {selectedPretForDetail.prets && selectedPretForDetail.prets.length > 0 ? (
                  <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2">
                    {selectedPretForDetail.prets.map((pret, index) => (
                      <div 
                        key={index}
                        className="flex flex-col xs:flex-row justify-between items-start xs:items-center bg-white/50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg group hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all gap-2 xs:gap-0"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {pret.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 ml-auto xs:ml-0">
                          <span className="font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-base">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pret.montant)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              onClick={() => openEditPretDialog(index)}
                            >
                              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                              onClick={() => openDeletePretFromHistoryDialog(index)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-xs sm:text-sm">
                    Aucun prêt enregistré
                  </p>
                )}
              </div>

              {/* Historique des remboursements */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-200/50">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Historique des remboursements</h3>
                {selectedPretForDetail.remboursements && selectedPretForDetail.remboursements.length > 0 ? (
                  <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2">
                    {selectedPretForDetail.remboursements.map((remboursement, index) => (
                      <div 
                        key={index}
                        className="flex flex-col xs:flex-row justify-between items-start xs:items-center bg-white/50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-lg group hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all gap-2 xs:gap-0"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {remboursement.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 ml-auto xs:ml-0">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-base">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(remboursement.montant)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              onClick={() => openEditRemboursementDialog(index)}
                            >
                              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                              onClick={() => openDeleteRemboursementDialog(index)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-xs sm:text-sm">
                    Aucun remboursement enregistré
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Formulaire de remboursement */}
      <Dialog open={remboursementDialogOpen} onOpenChange={setRemboursementDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              Enregistrer un remboursement
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="nom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom de la famille</Label>
              <div className="relative">
                <Input 
                  id="nom" 
                  value={searchText} 
                  onChange={(e) => handleSearch(e.target.value)} 
                  placeholder="Saisir au moins 3 caractères"
                  className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl mt-2 overflow-hidden">
                    {searchResults.map((result) => (
                      <div 
                        key={result.id} 
                        className="p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 cursor-pointer transition-all duration-200"
                        onClick={() => selectFamille(result)}
                      >
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{result.nom}</div>
                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Reste à payer: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(result.soldeRestant)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="montant" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Montant du remboursement</Label>
              <div className="relative">
                <ArrowUp className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                <Input 
                  id="montant" 
                  type="number" 
                  value={montantRemboursement} 
                  onChange={(e) => {
                    setMontantRemboursement(e.target.value);
                    validateMontantRemboursement(e.target.value);
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={cn(
                    "pl-12 bg-white/50 backdrop-blur-sm border rounded-xl px-4 py-3 focus:ring-2 transition-all duration-200",
                    montantRemboursementError 
                      ? "border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200/50 focus:ring-emerald-500/20"
                  )}
                />
              </div>
              {montantRemboursementError && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {montantRemboursementError}
                </p>
              )}
              {selectedPret && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200/50">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Solde actuel:</span>{' '}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPret.soldeRestant)}
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            {selectedPret && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 rounded-2xl border border-gray-200/50">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Solde actuel:</span>
                    <span className="font-bold text-lg text-red-600 dark:text-red-400">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPret.soldeRestant)}
                    </span>
                  </div>
                  {montantRemboursement && !isNaN(parseFloat(montantRemboursement)) && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Nouveau solde:</span>
                      <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPret.soldeRestant - parseFloat(montantRemboursement))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleRemboursement} 
              disabled={loading || !selectedPret || !montantRemboursement || parseFloat(montantRemboursement) <= 0 || !!montantRemboursementError}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <Receipt className="h-5 w-5 mr-2" />
                  Enregistrer le remboursement
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour modifier un remboursement */}
      <Dialog open={editRemboursementDialogOpen} onOpenChange={setEditRemboursementDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                <Edit2 className="h-5 w-5 text-white" />
              </div>
              Modifier le remboursement
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="editMontant" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nouveau montant du remboursement
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                <Input 
                  id="editMontant" 
                  type="number" 
                  value={editMontantRemboursement} 
                  onChange={(e) => {
                    setEditMontantRemboursement(e.target.value);
                    validateEditMontant(e.target.value);
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={cn(
                    "pl-12 bg-white/50 backdrop-blur-sm border rounded-xl px-4 py-3 focus:ring-2 transition-all duration-200",
                    editMontantError 
                      ? "border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200/50 focus:ring-emerald-500/20"
                  )}
                />
              </div>
              {editMontantError && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {editMontantError}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Date du remboursement
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 hover:bg-white/80 transition-all duration-200",
                      !editDateRemboursement && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDateRemboursement ? format(editDateRemboursement, 'PPP', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDateRemboursement}
                    onSelect={(date) => setEditDateRemboursement(date || new Date())}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {selectedPretForDetail && selectedRemboursementIndex >= 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 rounded-2xl border border-gray-200/50">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Montant actuel:</span>
                    <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                        selectedPretForDetail.remboursements?.[selectedRemboursementIndex]?.montant || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Reste à payer:</span>
                    <span className="font-bold text-lg text-red-600 dark:text-red-400">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPretForDetail.soldeRestant)}
                    </span>
                  </div>
                  {editMontantRemboursement && !isNaN(parseFloat(editMontantRemboursement)) && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Nouveau montant:</span>
                        <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(parseFloat(editMontantRemboursement))}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Nouveau solde restant:</span>
                          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                              selectedPretForDetail.soldeRestant + 
                              (selectedPretForDetail.remboursements?.[selectedRemboursementIndex]?.montant || 0) - 
                              parseFloat(editMontantRemboursement)
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleEditRemboursement} 
              disabled={loading || !editMontantRemboursement || parseFloat(editMontantRemboursement) < 0 || !!editMontantError}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <Edit2 className="h-5 w-5 mr-2" />
                  Modifier le remboursement
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier un prêt de l'historique */}
      <Dialog open={editPretDialogOpen} onOpenChange={setEditPretDialogOpen}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[500px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-2">
                <Edit2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Modifier le prêt
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:gap-6 py-4 sm:py-6">
            <div className="grid gap-3">
              <Label htmlFor="editMontantPret" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Montant du prêt
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <Input 
                  id="editMontantPret" 
                  type="number" 
                  value={editMontantPret} 
                  onChange={(e) => setEditMontantPret(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-10 sm:pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="editDatePret" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Date du prêt
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 hover:bg-white/70 text-sm sm:text-base",
                      !editDatePret && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDatePret ? format(editDatePret, 'dd MMMM yyyy', { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDatePret}
                    onSelect={(date) => date && setEditDatePret(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={handleEditPret} 
              disabled={loading || !editMontantPret || parseFloat(editMontantPret) <= 0}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Modifier le prêt
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression d'un prêt de l'historique */}
      <ConfirmDeleteDialog
        isOpen={confirmDeletePretDialogOpen}
        onClose={() => setConfirmDeletePretDialogOpen(false)}
        onConfirm={handleDeletePretFromHistory}
        title="Supprimer le prêt"
        description="Êtes-vous sûr de vouloir supprimer ce prêt de l'historique ? Cette action est irréversible et ajustera automatiquement le montant total du prêt."
        isSubmitting={loading}
      />
      
      {/* Formulaire de demande de prêt */}
      <Dialog open={demandePretDialogOpen} onOpenChange={setDemandePretDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-2">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              Enregistrer une demande de prêt
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-3 relative">
              <Label htmlFor="nouvNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nom de la famille
                {selectedFamilleForPret && (
                  <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-normal">
                    (Ajout au prêt existant)
                  </span>
                )}
              </Label>
              <Input 
                id="nouvNom" 
                value={nouvNom} 
                onChange={(e) => handleNouvNomSearch(e.target.value)}
                placeholder="Tapez au moins 3 caractères..."
                className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              />
              
              {/* Liste d'autocomplétion */}
              {nouvSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {nouvSearchResults.map((famille) => (
                    <button
                      key={famille.id}
                      type="button"
                      onClick={() => selectFamilleForPret(famille)}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {famille.nom}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Solde: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(famille.soldeRestant)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {selectedFamilleForPret && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200/50">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Prêt actuel:</span>{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedFamilleForPret.pretTotal)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-semibold">Solde restant:</span>{' '}
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedFamilleForPret.soldeRestant)}
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="nouvPretTotal" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Montant du prêt</Label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <Input 
                  id="nouvPretTotal" 
                  type="number" 
                  value={nouvPretTotal} 
                  onChange={(e) => setNouvPretTotal(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-12 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="nouvDate" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-3 hover:bg-white/70 transition-all duration-200",
                      !nouvDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-purple-500" />
                    {nouvDate ? format(nouvDate, 'PP', { locale: fr }) : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={nouvDate}
                    onSelect={(date) => date && setNouvDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button 
              onClick={handleDemandePret} 
              disabled={loading || !nouvNom || !nouvPretTotal || parseFloat(nouvPretTotal) <= 0}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Enregistrer la demande de prêt
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression de remboursement */}
      <ConfirmDeleteDialog
        isOpen={confirmDeleteDialogOpen}
        onClose={() => {
          setConfirmDeleteDialogOpen(false);
          setRemboursementIndexToDelete(-1);
        }}
        onConfirm={handleDeleteRemboursement}
        title="Confirmer la suppression"
        description={
  <>
    Êtes-vous sûr de vouloir supprimer ce remboursement
    {selectedPretForDetail && remboursementIndexToDelete >= 0 && (
      <>
        {' de '}
        <span style={{ fontWeight: 'bold', color: 'red' }}>
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
            selectedPretForDetail.remboursements?.[remboursementIndexToDelete]?.montant || 0
          )}
        </span>
      </>
    )}
    {' ? Cette action est irréversible.'}
  </>
}
        isSubmitting={loading}
      />

      {/* Dialogue de confirmation de suppression de prêt */}
    <ConfirmDeleteDialog
  isOpen={deletePretDialogOpen}
  onClose={() => {
    setDeletePretDialogOpen(false);
    setSelectedPretToDelete(null);
  }}
  onConfirm={handleDeletePret}
  title="Confirmer la suppression du prêt"
  description={
    <>
      Êtes-vous sûr de vouloir supprimer le prêt de{' '}
      <span style={{ fontWeight: 'bold', color: 'green' }}>
        {selectedPretToDelete?.nom || ''}
      </span>{' '}
      
      <span style={{ fontWeight: 'bold', color: 'red' }}>
        (
        {selectedPretToDelete
          ? new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(selectedPretToDelete.pretTotal)
          : ''}
          )
      </span>
       ? Cette action supprimera également tout l'historique des remboursements et est irréversible.
    </>
  }
  isSubmitting={loading}
/>

    </div>
  );
};

export default PretFamilles;
