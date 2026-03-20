import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, RotateCcw, CreditCard, Save, Wallet, ArrowUp, ArrowDown, DollarSign, Calendar, Sparkles, Award, TrendingUp, TrendingDown } from 'lucide-react';
import MonthlyResetHandler from './MonthlyResetHandler';
import { useIsMobile } from '@/hooks/use-mobile';
import { depenseService } from '@/service/api';
import { useApp } from '@/contexts/AppContext';
import PremiumLoading from '@/components/ui/premium-loading';

const formatMonthInFrench = (monthIndex: number): string => {
  const months = [
    'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
  ];
  return months[monthIndex - 1] || 'MOIS INCONNU';
};

const DepenseDuMois = () => {
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMouvement, setNewMouvement] = useState({
    description: '',
    categorie: '',
    date: new Date().toISOString().substring(0, 10),
    debit: '',
    credit: '',
  });
  const [editMouvementId, setEditMouvementId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFixeDialogOpen, setIsFixeDialogOpen] = useState(false);
  const [depensesFixe, setDepensesFixe] = useState({
    free: '',
    internetZeop: '',
    assuranceVoiture: '',
    autreDepense: '',
    assuranceVie: '',
  });

  const { currentMonth, currentYear } = useApp();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const solde = Array.isArray(mouvements)
    ? mouvements.reduce((total, m) => total + (parseFloat(m.credit) || 0) - (parseFloat(m.debit) || 0), 0)
    : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const fetchMouvements = async () => {
    try {
      setLoading(true);
      const mouvementsData = await depenseService.getMouvements();
      setMouvements(mouvementsData || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des mouvements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les mouvements",
        variant: "destructive",
         className: "notification-erreur",
      });
      setMouvements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepensesFixe = async () => {
    try {
      const depensesFixeData = await depenseService.getDepensesFixe();
      setDepensesFixe({
        free: (depensesFixeData.free || 0).toString(),
        internetZeop: (depensesFixeData.internetZeop || 0).toString(),
        assuranceVoiture: (depensesFixeData.assuranceVoiture || 0).toString(),
        autreDepense: (depensesFixeData.autreDepense || 0).toString(),
        assuranceVie: (depensesFixeData.assuranceVie || 0).toString(),
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des dépenses fixes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les dépenses fixes",
        variant: "destructive",
         className: "notification-erreur",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMouvement.description || !newMouvement.categorie || (!newMouvement.debit && !newMouvement.credit)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
         className: "notification-erreur",
      });
      return;
    }

    try {
      const mouvementData = {
        ...newMouvement,
        solde: solde + (parseFloat(newMouvement.credit) || 0) - (parseFloat(newMouvement.debit) || 0),
      };

      if (editMouvementId) {
        await depenseService.updateMouvement(editMouvementId, mouvementData);
        toast({
          title: "Succès",
          description: "Mouvement mis à jour avec succès",
          className: "bg-app-green text-white",
        });
      } else {
        await depenseService.addMouvement(mouvementData);
        toast({
          title: "Succès",
          description: "Mouvement ajouté avec succès",
          className: "bg-app-green text-white",
        });
      }

      setNewMouvement({
        description: '',
        categorie: '',
        date: new Date().toISOString().substring(0, 10),
        debit: '',
        credit: '',
      });
      setEditMouvementId(null);
      setIsDialogOpen(false);
      fetchMouvements();
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification du mouvement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await depenseService.deleteMouvement(deleteId);
      toast({
        title: "Succès",
        description: "Mouvement supprimé avec succès",
        className: "bg-app-green text-white",
      });
      setIsDeleteDialogOpen(false);
      fetchMouvements();
    } catch (error) {
      console.error("Erreur lors de la suppression du mouvement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le mouvement",
        variant: "destructive",
         className: "notification-erreur",
      });
    }
  };

  const handleEdit = (mouvement) => {
    setNewMouvement({
      description: mouvement.description,
      categorie: mouvement.categorie,
      date: mouvement.date.substring(0, 10),
      debit: mouvement.debit || '',
      credit: mouvement.credit || '',
    });
    setEditMouvementId(mouvement.id);
    setIsDialogOpen(true);
  };

  const handleUpdateDepensesFixe = async () => {
    try {
      const depensesFixeNumbers = {
        free: parseFloat(depensesFixe.free) || 0,
        internetZeop: parseFloat(depensesFixe.internetZeop) || 0,
        assuranceVoiture: parseFloat(depensesFixe.assuranceVoiture) || 0,
        autreDepense: parseFloat(depensesFixe.autreDepense) || 0,
        assuranceVie: parseFloat(depensesFixe.assuranceVie) || 0,
      };
      await depenseService.updateDepensesFixe(depensesFixeNumbers);
      toast({
        title: "Succès",
        description: "Dépenses fixes mises à jour avec succès",
        className: "bg-app-green text-white",
      });
      setIsFixeDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des dépenses fixes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les dépenses fixes",
        variant: "destructive",
         className: "notification-erreur",
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMouvements(), fetchDepensesFixe()]).finally(() => setLoading(false));
  }, []);

  const handleReset = async () => {
    try {
      await depenseService.resetMouvements();
      toast({
        title: "Succès",
        description: "Tous les mouvements ont été réinitialisés",
        className: "bg-app-blue text-white",
      });
      fetchMouvements();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des mouvements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les mouvements",
        variant: "destructive",
         className: "notification-erreur",
      });
    }
  };

  const handleCategorieChange = (value) => {
    if (value === "chargeFixe") {
      depenseService.getDepensesFixe().then(depensesFixeData => {
        setNewMouvement({
          ...newMouvement,
          categorie: value,
          description: "Charge fixe",
          debit: (depensesFixeData.total || 0).toString(),
          credit: ''
        });
      });
    } else {
      setNewMouvement({
        ...newMouvement,
        categorie: value,
        description: '',
        debit: '',
        credit: ''
      });
    }
  };

  const estPositif = solde >= 0;

  if (loading) {
    return (
      <PremiumLoading
        text="Chargement des Dépense du Mois"
        size="md"
        variant="dashboard"
        showText={true}
      />
    );
  }

  return (
    <div className="space-y-8">
      <MonthlyResetHandler />
      
      {/* Header luxueux avec gradient */}
      <div className="relative overflow-hidden 
                bg-gradient-to-br from-cyan-700 via-blue-700 to-purple-800
                rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem]
                shadow-[0_40px_120px_rgba(0,0,0,0.45)]
                p-5 sm:p-7 md:p-9
                border border-white/25">

  {/* Glow luxe */}
  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

  <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 sm:gap-7">

    {/* Titre */}
    <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
      <div className="relative rounded-full p-3 sm:p-4 md:p-5
                      bg-gradient-to-br from-white/30 to-white/10
                      backdrop-blur-xl
                      border border-white/30
                      shadow-[0_10px_40px_rgba(255,255,255,0.25)]">
        <Wallet className="h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 text-white drop-shadow-lg" />
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 
                       font-extrabold text-white tracking-wide mb-1">
          Dépenses du mois
        </h2>

        <div className="flex items-center gap-2 text-white/90">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
          <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold">
            {formatMonthInFrench(currentMonth)} {currentYear}
          </span>
        </div>
      </div>

      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 
                           text-amber-300 animate-pulse drop-shadow-lg" />
    </div>

    {/* Boutons ultra-luxe */}
    <div className="flex flex-wrap gap-3 sm:gap-4 w-full lg:w-auto">

      {/* Dépenses fixes */}
      <Button
        onClick={() => setIsFixeDialogOpen(true)}
        className="group relative flex-1 sm:flex-none overflow-hidden
                   rounded-xl sm:rounded-2xl
                   bg-gradient-to-br from-white/35 to-white/10
                   backdrop-blur-xl
                   border border-white/30
                   text-white font-medium
                   shadow-[0_20px_60px_rgba(255,255,255,0.25)]
                   transition-all duration-300
                   hover:scale-105 hover:shadow-[0_30px_90px_rgba(255,255,255,0.35)]
                   px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative flex items-center justify-center">
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white/90" />
          <span className="hidden xs:inline">Dépenses fixes</span>
          <span className="xs:hidden">Fixes</span>
        </span>
      </Button>

      {/* Ajouter */}
      <Button
        onClick={() => {
          setEditMouvementId(null);
          setNewMouvement({
            description: '',
            categorie: '',
            date: new Date().toISOString().substring(0, 10),
            debit: '',
            credit: '',
          });
          setIsDialogOpen(true);
        }}
        className="group relative flex-1 sm:flex-none overflow-hidden
                   rounded-xl sm:rounded-2xl
                   bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700
                   border border-emerald-300/40
                   text-white font-semibold
                   shadow-[0_20px_70px_rgba(16,185,129,0.6)]
                   transition-all duration-300
                   hover:scale-105 hover:shadow-[0_35px_100px_rgba(16,185,129,0.75)]
                   px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative flex items-center justify-center">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="hidden xs:inline">Ajouter</span>
          <span className="xs:hidden">+</span>
        </span>
      </Button>

      {/* Reset */}
      <Button
        onClick={handleReset}
        className="group relative flex-1 sm:flex-none overflow-hidden
                   rounded-xl sm:rounded-2xl
                   bg-gradient-to-br from-red-500/90 to-red-700/90
                   border border-red-300/40
                   text-white font-medium
                   shadow-[0_20px_70px_rgba(239,68,68,0.5)]
                   transition-all duration-300
                   hover:scale-105 hover:shadow-[0_35px_100px_rgba(239,68,68,0.7)]
                   px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative flex items-center justify-center">
          <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="hidden sm:inline">Réinitialiser</span>
          <span className="sm:hidden">Reset</span>
        </span>
      </Button>

    </div>
  </div>
</div>

      {/* Affichage du solde modernisé */}
      <div className="relative overflow-hidden
                bg-gradient-to-br from-white/95 via-gray-50/95 to-gray-100/95
                dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95
                backdrop-blur-2xl
                rounded-[2.5rem]
                shadow-[0_40px_120px_rgba(0,0,0,0.25)]
                border border-white/30
                p-8">

  {/* Halo luxe */}
  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />

  <div className="relative flex items-center justify-between">

    {/* Partie gauche */}
    <div className="flex items-center gap-6">

      {/* Icône principale luxe */}
      <div className="relative rounded-full p-5
                      bg-gradient-to-br from-emerald-200/70 via-teal-100/60 to-white/40
                      dark:from-emerald-900/40 dark:via-teal-900/30 dark:to-gray-800/30
                      backdrop-blur-xl
                      border border-white/40
                      shadow-[0_20px_60px_rgba(16,185,129,0.35)]">
        <DollarSign className="h-9 w-9 text-emerald-700 dark:text-emerald-400 drop-shadow-lg" />
      </div>

      <div>
        <h3 className="text-xl font-semibold tracking-wide text-gray-700 dark:text-gray-300 mb-2">
          Solde actuel
        </h3>

        <div className="flex items-center gap-5">

          {/* Montant */}
          <span
            className={`text-4xl font-extrabold tracking-tight drop-shadow-sm ${
              estPositif ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {formatAmount(solde)}
          </span>

          {/* Badge statut luxe */}
          <div
            className={`group relative overflow-hidden
                        flex items-center gap-3
                        px-5 py-2.5 rounded-full
                        border backdrop-blur-xl
                        shadow-[0_15px_40px_rgba(0,0,0,0.15)]
                        ${
                          estPositif
                            ? 'bg-gradient-to-r from-emerald-100 via-teal-100 to-white/70 \
                               text-emerald-700 border-emerald-300/40 \
                               dark:from-emerald-900/40 dark:via-teal-900/30 dark:to-gray-800/40 dark:text-emerald-300'
                            : 'bg-gradient-to-r from-red-100 via-orange-100 to-white/70 \
                               text-red-700 border-red-300/40 \
                               dark:from-red-900/40 dark:via-orange-900/30 dark:to-gray-800/40 dark:text-red-300'
                        }`}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <span className="relative flex items-center gap-2">
              {estPositif ? (
                <TrendingUp className="h-5 w-5 drop-shadow-md" />
              ) : (
                <TrendingDown className="h-5 w-5 drop-shadow-md" />
              )}

              <span className="font-bold text-lg tracking-wide">
                {estPositif ? 'Bonne situation' : 'Découvert'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Icône prestige */}
    <div className="hidden lg:block">
      <div className="relative rounded-full p-4
                      bg-gradient-to-br from-gray-200/60 to-white/40
                      dark:from-gray-700/40 dark:to-gray-800/40
                      backdrop-blur-xl
                      border border-white/30
                      shadow-[0_15px_50px_rgba(0,0,0,0.2)]">
        <Award className="h-12 w-12 text-amber-400 drop-shadow-lg" />
      </div>
    </div>

  </div>
</div>

      
      {/* Tableau des mouvements modernisé */}
      <div className="relative overflow-hidden
                bg-gradient-to-br from-white/95 via-gray-50/95 to-gray-100/95
                dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95
                backdrop-blur-2xl
                rounded-2xl sm:rounded-3xl
                shadow-[0_40px_120px_rgba(0,0,0,0.25)]
                border border-white/30
                overflow-hidden -mx-3 sm:mx-0">

  {/* Header luxe */}
  <div className="relative bg-gradient-to-r from-white/80 via-gray-50/80 to-white/80
                  dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80
                  backdrop-blur-xl
                  p-4 sm:p-6
                  border-b border-white/30">
    <div className="flex items-center gap-4">
      <div className="relative rounded-full p-3
                      bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600
                      shadow-[0_15px_40px_rgba(99,102,241,0.5)]">
        <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide text-gray-800 dark:text-gray-200">
        Mouvements du mois
      </h3>
    </div>
  </div>

  <div className="overflow-x-auto">
    <Table className="text-xs sm:text-sm md:text-base">

      {/* En-têtes */}
      <TableHeader>
        <TableRow className="border-none bg-gradient-to-r from-gray-50/70 to-white/70
                             dark:from-gray-800/70 dark:to-gray-700/70">
          {[
            { icon: Calendar, label: 'Date' },
            { icon: Edit, label: 'Description' },
          ].map(({ icon: Icon, label }) => (
            <TableHead
              key={label}
              className="px-3 py-3 font-bold text-indigo-600 dark:text-indigo-400"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden xs:inline">{label}</span>
              </div>
            </TableHead>
          ))}

          <TableHead className="hidden md:table-cell px-3 py-3 font-bold text-indigo-600 dark:text-indigo-400">
            Catégorie
          </TableHead>

          <TableHead className="text-right px-3 py-3 font-bold text-indigo-600 dark:text-indigo-400">
            <div className="flex items-center justify-end gap-2">
              <ArrowDown className="h-4 w-4" />
              <span className="hidden xs:inline">Débit</span>
            </div>
          </TableHead>

          <TableHead className="text-right px-3 py-3 font-bold text-indigo-600 dark:text-indigo-400">
            <div className="flex items-center justify-end gap-2">
              <ArrowUp className="h-4 w-4" />
              <span className="hidden xs:inline">Crédit</span>
            </div>
          </TableHead>

          <TableHead className="text-right px-3 py-3 font-bold text-indigo-600 dark:text-indigo-400">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {!Array.isArray(mouvements) || mouvements.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full p-6
                                bg-gradient-to-br from-indigo-200/60 via-purple-200/60 to-white/40
                                dark:from-indigo-900/40 dark:via-purple-900/30 dark:to-gray-800/40
                                shadow-[0_20px_60px_rgba(99,102,241,0.35)]">
                  <Wallet className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    Aucun mouvement enregistré
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Commencez à ajouter vos premiers mouvements
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          mouvements.map((mouvement, index) => (
            <TableRow
              key={mouvement.id}
              className="group border-b border-gray-100/50 dark:border-gray-700/50
                         hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50
                         dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20
                         transition-all duration-300"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center
                                  bg-gradient-to-br from-indigo-500 to-purple-600
                                  shadow-md">
                    <span className="text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {formatDate(mouvement.date)}
                  </span>
                </div>
              </TableCell>

              <TableCell className="font-semibold text-gray-800 dark:text-gray-200">
                {mouvement.description}
              </TableCell>

              <TableCell>
                <span className="inline-block px-4 py-1 rounded-full
                                 bg-gradient-to-r from-purple-100 to-pink-100
                                 dark:from-purple-900/40 dark:to-pink-900/40
                                 text-purple-700 dark:text-purple-300
                                 font-bold text-sm">
                  {mouvement.categorie}
                </span>
              </TableCell>

              <TableCell className="text-right">
                {mouvement.debit ? (
                  <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full
                                   bg-gradient-to-r from-red-100 to-orange-100
                                   dark:from-red-900/40 dark:to-orange-900/40
                                   text-red-700 dark:text-red-300 font-bold">
                    <ArrowDown className="h-4 w-4" />
                    {formatAmount(mouvement.debit)}
                  </span>
                ) : <span className="text-gray-400">-</span>}
              </TableCell>

              <TableCell className="text-right">
                {mouvement.credit ? (
                  <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full
                                   bg-gradient-to-r from-emerald-100 to-teal-100
                                   dark:from-emerald-900/40 dark:to-teal-900/40
                                   text-emerald-700 dark:text-emerald-300 font-bold">
                    <ArrowUp className="h-4 w-4" />
                    {formatAmount(mouvement.credit)}
                  </span>
                ) : <span className="text-gray-400">-</span>}
              </TableCell>

              {/* Actions ultra-luxe */}
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(mouvement)}
                  className="rounded-full p-2
                             bg-gradient-to-br from-blue-100/70 to-white/40
                             dark:from-blue-900/30 dark:to-gray-800/40
                             hover:scale-110 transition-all
                             shadow-[0_10px_30px_rgba(59,130,246,0.35)]"
                >
                  <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDeleteId(mouvement.id);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="rounded-full p-2
                             bg-gradient-to-br from-red-100/70 to-white/40
                             dark:from-red-900/30 dark:to-gray-800/40
                             hover:scale-110 transition-all
                             shadow-[0_10px_30px_rgba(239,68,68,0.35)]"
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
</div>

      {/* Dialogue d'ajout/modification de mouvement */}
     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="sm:max-w-md bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95
                             backdrop-blur-2xl border border-white/30 shadow-[0_40px_120px_rgba(0,0,0,0.25)] rounded-2xl sm:rounded-3xl">
    
    <DialogHeader>
      <DialogTitle className="flex items-center gap-3 text-xl font-extrabold text-gray-800 dark:text-gray-200">
        <div className="rounded-full p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-500 shadow-lg">
          {editMouvementId ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
        </div>
        {editMouvementId ? 'Modifier le mouvement' : 'Ajouter un mouvement'}
      </DialogTitle>
    </DialogHeader>
    
    <form onSubmit={handleSubmit} className="space-y-6 py-6">
      <div className="grid grid-cols-1 gap-6">

        {/* Catégorie */}
        <div className="space-y-2">
          <Label htmlFor="categorie" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Catégorie</Label>
          <Select
            value={newMouvement.categorie}
            onValueChange={handleCategorieChange}
            required
          >
            <SelectTrigger id="categorie" className="bg-white/50 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-inner">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chargeFixe">Charge Fixe</SelectItem>
              <SelectItem value="Autres">Autres</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</Label>
          <Input
            id="description"
            value={newMouvement.description}
            onChange={(e) => setNewMouvement({...newMouvement, description: e.target.value})}
            required
            disabled={newMouvement.categorie === "chargeFixe"}
            className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-inner"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</Label>
          <Input
            id="date"
            type="date"
            value={newMouvement.date}
            onChange={(e) => setNewMouvement({...newMouvement, date: e.target.value})}
            required
            className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-inner"
          />
        </div>

        {/* Débit & Crédit */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'debit', label: 'Débit (€)', icon: ArrowDown, color: 'text-red-500', value: newMouvement.debit, onChange: (v) => setNewMouvement({...newMouvement, debit: v, credit: ''}), disabled: newMouvement.categorie === 'chargeFixe' || !!newMouvement.credit },
            { id: 'credit', label: 'Crédit (€)', icon: ArrowUp, color: 'text-emerald-500', value: newMouvement.credit, onChange: (v) => setNewMouvement({...newMouvement, credit: v, debit: ''}), disabled: newMouvement.categorie === 'chargeFixe' || !!newMouvement.debit },
          ].map(({id, label, icon: Icon, color, value, onChange, disabled}) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id} className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</Label>
              <div className="relative">
                <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${color}`} />
                <Input
                  id={id}
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="pl-10 px-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-inner"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDialogOpen(false)}
          className="bg-white/50 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-inner"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
        >
          {editMouvementId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editMouvementId ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

{/* Dialogue suppression */}
<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <DialogContent className="sm:max-w-md bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95
                             backdrop-blur-2xl border border-white/30 shadow-[0_40px_120px_rgba(0,0,0,0.25)] rounded-2xl sm:rounded-3xl">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-3 text-xl font-extrabold text-gray-800 dark:text-gray-200">
        <div className="rounded-full p-3 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 shadow-lg">
          <Trash2 className="h-5 w-5 text-white" />
        </div>
        Confirmer la suppression
      </DialogTitle>
    </DialogHeader>
    <p className="py-6 text-gray-700 dark:text-gray-300">Êtes-vous sûr de vouloir supprimer ce mouvement ? Cette action est irréversible.</p>
    <DialogFooter className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsDeleteDialogOpen(false)}
        className="bg-white/50 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-inner"
      >
        Annuler
      </Button>
      <Button
        type="button"
        onClick={handleDelete}
        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
      >
        Supprimer
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Dialogue dépenses fixes */}
<Dialog open={isFixeDialogOpen} onOpenChange={setIsFixeDialogOpen}>
  <DialogContent className="sm:max-w-md bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95
                             backdrop-blur-2xl border border-white/30 shadow-[0_40px_120px_rgba(0,0,0,0.25)] rounded-2xl sm:rounded-3xl">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-3 text-xl font-extrabold text-gray-800 dark:text-gray-200">
        <div className="rounded-full p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-fuchsia-500 shadow-lg">
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        Dépenses fixes mensuelles
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-6 py-6">
      {Object.entries(depensesFixe).map(([key, val]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key} className="text-sm font-semibold text-gray-700 dark:text-gray-300">{key}</Label>
          <div className="relative">
            <ArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
            <Input
              id={key}
              type="number"
              min="0"
              step="0.01"
              value={val}
              onChange={(e) => setDepensesFixe({...depensesFixe, [key]: e.target.value})}
              className="pl-10 px-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-inner"
            />
          </div>
        </div>
      ))}
    </div>

    <DialogFooter className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsFixeDialogOpen(false)}
        className="bg-white/50 backdrop-blur-xl border border-gray-200/40 rounded-2xl shadow-inner"
      >
        Annuler
      </Button>
      <Button
        type="button"
        onClick={handleUpdateDepensesFixe}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
      >
        <Save className="h-4 w-4" /> Enregistrer
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default DepenseDuMois;
