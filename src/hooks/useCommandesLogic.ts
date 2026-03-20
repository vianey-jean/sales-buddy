/**
 * =============================================================================
 * useCommandesLogic - Hook de logique métier pour CommandesPage
 * =============================================================================
 * 
 * Extrait toute la logique de CommandesPage : chargement des données,
 * gestion des formulaires, soumission, suppression, changement de statut,
 * validation, annulation, report et création de RDV depuis réservation.
 * 
 * @module useCommandesLogic
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Commande, CommandeProduit, CommandeStatut } from '@/types/commande';
import api from '@/service/api';
import { rdvFromReservationService } from '@/services/rdvFromReservationService';
import { reservationRdvSyncService } from '@/services/reservationRdvSyncService';
import tacheApi from '@/services/api/tacheApi';

// ============================================================================
// Types locaux
// ============================================================================

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
}

interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
}

// ============================================================================
// Hook principal
// ============================================================================

export const useCommandesLogic = () => {
  // =========================================================================
  // États principaux
  // =========================================================================
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  
  // =========================================================================
  // États du formulaire client
  // =========================================================================
  const [clientNom, setClientNom] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  
  // =========================================================================
  // États du formulaire type et dates
  // =========================================================================
  const [type, setType] = useState<'commande' | 'reservation'>('commande');
  const [dateArrivagePrevue, setDateArrivagePrevue] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');
  const [horaire, setHoraire] = useState('');
  
  // =========================================================================
  // États du formulaire produits
  // =========================================================================
  const [produitNom, setProduitNom] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [prixVente, setPrixVente] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [produitsListe, setProduitsListe] = useState<CommandeProduit[]>([]);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  
  // =========================================================================
  // États de recherche et tri
  // =========================================================================
  const [commandeSearch, setCommandeSearch] = useState('');
  const [sortDateAsc, setSortDateAsc] = useState(true);
  
  // =========================================================================
  // États des modales de confirmation
  // =========================================================================
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  // =========================================================================
  // États export PDF
  // =========================================================================
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDate, setExportDate] = useState('');
  
  // =========================================================================
  // États modale Reporter
  // =========================================================================
  const [reporterModalOpen, setReporterModalOpen] = useState(false);
  const [reporterCommandeId, setReporterCommandeId] = useState<string | null>(null);
  const [reporterDate, setReporterDate] = useState('');
  const [reporterHoraire, setReporterHoraire] = useState('');
  
  // =========================================================================
  // États création RDV depuis réservation
  // =========================================================================
  const [showRdvConfirmDialog, setShowRdvConfirmDialog] = useState(false);
  const [showRdvFormModal, setShowRdvFormModal] = useState(false);
  const [pendingReservationForRdv, setPendingReservationForRdv] = useState<Commande | null>(null);
  const [isRdvLoading, setIsRdvLoading] = useState(false);

  // =========================================================================
  // États conflit tâche lors création RDV
  // =========================================================================
  const [showTacheConflictModal, setShowTacheConflictModal] = useState(false);
  const [conflictingTache, setConflictingTache] = useState<any>(null);
  const [pendingTacheData, setPendingTacheData] = useState<any>(null);

  // =========================================================================
  // Fonctions de chargement des données
  // =========================================================================

  const fetchCommandes = async () => {
    try {
      const response = await api.get('/api/commandes');
      setCommandes(response.data);
    } catch (error) {
      console.error('Error fetching commandes:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les commandes', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // =========================================================================
  // Effets
  // =========================================================================
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCommandes(), fetchClients(), fetchProducts()]);
      setIsLoading(false);
    };
    loadData();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // =========================================================================
  // Mémos de filtrage
  // =========================================================================

  const filteredCommandes = useMemo(() => {
    const commandesToFilter = commandeSearch.length >= 3 
      ? commandes 
      : commandes.filter(c => c.statut !== 'valide' && c.statut !== 'annule');
    
    let filtered = commandesToFilter;
    if (commandeSearch.length >= 3) {
      const searchLower = commandeSearch.toLowerCase();
      filtered = commandesToFilter.filter(commande => 
        commande.clientNom.toLowerCase().includes(searchLower) ||
        commande.clientPhone.includes(searchLower) ||
        commande.produits.some(p => p.nom.toLowerCase().includes(searchLower))
      );
    }
    
    return [...filtered].sort((a, b) => {
      const dateStrA = a.type === 'commande' ? a.dateArrivagePrevue || '' : a.dateEcheance || '';
      const dateStrB = b.type === 'commande' ? b.dateArrivagePrevue || '' : b.dateEcheance || '';
      const dateA = new Date(dateStrA);
      const dateB = new Date(dateStrB);
      const dateDiff = sortDateAsc ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      if (dateDiff === 0) {
        const horaireA = a.horaire || '23:59';
        const horaireB = b.horaire || '23:59';
        return sortDateAsc ? horaireA.localeCompare(horaireB) : horaireB.localeCompare(horaireA);
      }
      return dateDiff;
    });
  }, [commandes, commandeSearch, sortDateAsc]);

  const filteredClients = useMemo(() => {
    if (clientSearch.length < 3) return [];
    return clients.filter(client => client.nom.toLowerCase().includes(clientSearch.toLowerCase()));
  }, [clientSearch, clients]);

  const filteredProducts = useMemo(() => {
    if (productSearch.length < 3) return [];
    // Calculer la quantité réservée par produit (par nom) dans les commandes actives
    const reservedQuantityByName = new Map<string, number>();
    commandes.forEach(commande => {
      if (editingCommande && commande.id === editingCommande.id) return;
      if (commande.statut === 'valide' || commande.statut === 'annule') return;
      commande.produits.forEach(produit => {
        const key = produit.nom.toLowerCase();
        reservedQuantityByName.set(key, (reservedQuantityByName.get(key) || 0) + produit.quantite);
      });
    });
    return products.filter(product => {
      const matchesSearch = product.description.toLowerCase().includes(productSearch.toLowerCase());
      const reservedQty = reservedQuantityByName.get(product.description.toLowerCase()) || 0;
      const availableQty = product.quantity - reservedQty;
      return matchesSearch && availableQty > 0;
    });
  }, [productSearch, products, commandes, editingCommande]);

  const commandesForExportDate = useMemo(() => {
    if (!exportDate) return [];
    return commandes.filter(c => {
      const dateStr = c.type === 'commande' ? c.dateArrivagePrevue : c.dateEcheance;
      return dateStr === exportDate;
    }).sort((a, b) => (a.horaire || '23:59').localeCompare(b.horaire || '23:59'));
  }, [commandes, exportDate]);

  // =========================================================================
  // Gestion des notifications
  // =========================================================================

  const checkNotifications = useCallback(() => {
    const now = new Date();
    commandes.forEach((commande) => {
      if (commande.type === 'commande' && commande.statut === 'arrive' && !commande.notificationEnvoyee) {
        toast({ title: '📦 Produit arrivé!', description: `Contacter ${commande.clientNom} (${commande.clientPhone})` });
        updateNotificationStatus(commande.id);
      }
      if (commande.type === 'reservation' && commande.dateEcheance) {
        const echeance = new Date(commande.dateEcheance);
        if (now >= echeance && !commande.notificationEnvoyee) {
          toast({ title: '⏰ Réservation échue!', description: `Demander à ${commande.clientNom} s'il veut toujours ce produit` });
          updateNotificationStatus(commande.id);
        }
      }
    });
  }, [commandes]);

  const updateNotificationStatus = async (id: string) => {
    try {
      await api.put(`/api/commandes/${id}`, { notificationEnvoyee: true });
      fetchCommandes();
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  // =========================================================================
  // Gestion de la sélection client/produit
  // =========================================================================

  const handleClientSelect = useCallback((client: Client) => {
    setClientNom(client.nom);
    setClientPhone(client.phone);
    setClientAddress(client.adresse);
    setClientSearch(client.nom);
    setShowClientSuggestions(false);
  }, []);

  // Calculer la quantité disponible d'un produit (stock - réservations actives)
  const getAvailableQuantityForProduct = useCallback((productDescription: string): number => {
    const product = products.find(p => p.description.toLowerCase() === productDescription.toLowerCase());
    if (!product) return 0;
    let reservedQty = 0;
    commandes.forEach(c => {
      if (editingCommande && c.id === editingCommande.id) return;
      if (c.statut === 'valide' || c.statut === 'annule') return;
      if (c.type !== 'reservation') return;
      c.produits.forEach(p => {
        if (p.nom.toLowerCase() === productDescription.toLowerCase()) {
          reservedQty += p.quantite;
        }
      });
    });
    return Math.max(0, product.quantity - reservedQty);
  }, [products, commandes, editingCommande]);

  const [availableQuantityForSelected, setAvailableQuantityForSelected] = useState<number | null>(null);

  const handleProductSelect = useCallback((product: Product) => {
    setProduitNom(product.description);
    setPrixUnitaire(product.purchasePrice.toString());
    setProductSearch(product.description);
    setShowProductSuggestions(false);
    setSelectedProduct(product);
    const availQty = getAvailableQuantityForProduct(product.description);
    setAvailableQuantityForSelected(availQty);
  }, [getAvailableQuantityForProduct]);

  // =========================================================================
  // Validation et reset
  // =========================================================================

  const isFormValid = useCallback(() => {
    return clientNom.trim() !== '' && clientPhone.trim() !== '' && clientAddress.trim() !== '' &&
      produitsListe.length > 0 && (type === 'commande' ? dateArrivagePrevue.trim() !== '' : dateEcheance.trim() !== '');
  }, [clientNom, clientPhone, clientAddress, produitsListe, type, dateArrivagePrevue, dateEcheance]);

  const resetForm = useCallback(() => {
    setClientNom(''); setClientPhone(''); setClientAddress('');
    setProduitNom(''); setPrixUnitaire(''); setQuantite('1'); setPrixVente('');
    setDateArrivagePrevue(''); setDateEcheance(''); setHoraire('');
    setType('commande'); setClientSearch(''); setProductSearch('');
    setProduitsListe([]); setEditingCommande(null); setSelectedProduct(null); setEditingProductIndex(null);
    setAvailableQuantityForSelected(null);
  }, []);

  const resetProductFields = useCallback(() => {
    setProduitNom(''); setPrixUnitaire(''); setQuantite('1'); setPrixVente('');
    setProductSearch(''); setEditingProductIndex(null); setSelectedProduct(null); setAvailableQuantityForSelected(null);
  }, []);

  // =========================================================================
  // Gestion du panier de produits
  // =========================================================================

  const handleAddProduit = useCallback(() => {
    if (!produitNom.trim() || !prixUnitaire.trim() || !quantite.trim() || !prixVente.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs du produit', className: "bg-app-red text-white", variant: 'destructive' });
      return;
    }
    const quantiteInt = parseInt(quantite);
    const existingProduct = products.find(p => p.description.toLowerCase() === produitNom.toLowerCase());
    if (existingProduct) {
      const availableQty = getAvailableQuantityForProduct(produitNom);
      if (availableQty <= 0) {
        toast({ title: 'Stock insuffisant', description: `${produitNom} n'a plus de stock disponible (tout est réservé)`, className: "bg-app-red text-white", variant: 'destructive' });
        return;
      }
      if (quantiteInt > availableQty) {
        toast({ title: 'Quantité insuffisante', description: `Quantité disponible: ${availableQty} unité(s) (stock: ${existingProduct.quantity}, réservé: ${existingProduct.quantity - availableQty})`, className: "bg-app-red text-white", variant: 'destructive' });
        return;
      }
    }
    const nouveauProduit: CommandeProduit = { nom: produitNom, prixUnitaire: parseFloat(prixUnitaire), quantite: quantiteInt, prixVente: parseFloat(prixVente) };
    if (editingProductIndex !== null) {
      const nouveauxProduits = [...produitsListe];
      nouveauxProduits[editingProductIndex] = nouveauProduit;
      setProduitsListe(nouveauxProduits);
      toast({ title: 'Produit modifié', description: `${nouveauProduit.nom} a été mis à jour` });
    } else {
      setProduitsListe([...produitsListe, nouveauProduit]);
      toast({ title: 'Produit ajouté', description: `${nouveauProduit.nom} ajouté au panier` });
    }
    resetProductFields();
  }, [produitNom, prixUnitaire, quantite, prixVente, products, editingProductIndex, produitsListe, resetProductFields, getAvailableQuantityForProduct]);

  const handleEditProduit = useCallback((index: number) => {
    const produit = produitsListe[index];
    setProduitNom(produit.nom); setPrixUnitaire(produit.prixUnitaire.toString());
    setQuantite(produit.quantite.toString()); setPrixVente(produit.prixVente.toString());
    setProductSearch(produit.nom); setEditingProductIndex(index);
    const productFromList = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
    setSelectedProduct(productFromList || null);
  }, [produitsListe, products]);

  const handleRemoveProduit = useCallback((index: number) => {
    setProduitsListe(prev => prev.filter((_, i) => i !== index));
    if (editingProductIndex === index) resetProductFields();
    else if (editingProductIndex !== null && editingProductIndex > index) setEditingProductIndex(editingProductIndex - 1);
    toast({ title: 'Produit retiré', description: 'Le produit a été retiré du panier' });
  }, [editingProductIndex, resetProductFields]);

  // =========================================================================
  // Soumission du formulaire
  // =========================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs et ajouter au moins un produit', className: "bg-app-red text-white", variant: 'destructive' });
      return;
    }
    // Vérifier doublon : même produit, même client, même date pour les réservations
    if (type === 'reservation' && !editingCommande) {
      const dateToCheck = dateEcheance;
      const isDuplicate = commandes.some(c => {
        if (c.statut === 'valide' || c.statut === 'annule') return false;
        if (c.type !== 'reservation') return false;
        if (c.clientNom.toLowerCase() !== clientNom.toLowerCase()) return false;
        if (c.dateEcheance !== dateToCheck) return false;
        return c.produits.some(cp => produitsListe.some(pl => pl.nom.toLowerCase() === cp.nom.toLowerCase()));
      });
      if (isDuplicate) {
        toast({ title: 'Doublon détecté', description: 'Ce client a déjà une réservation avec ce produit à cette date', className: "bg-app-red text-white", variant: 'destructive' });
        return;
      }
    }
    const commandeData: Partial<Commande> = { clientNom, clientPhone, clientAddress, type, produits: produitsListe, dateCommande: new Date().toISOString(), statut: type === 'commande' ? 'en_route' : 'en_attente' };
    if (type === 'commande') commandeData.dateArrivagePrevue = dateArrivagePrevue;
    else commandeData.dateEcheance = dateEcheance;
    if (horaire) commandeData.horaire = horaire;

    try {
      const existingClient = clients.find(c => c.nom.toLowerCase() === clientNom.toLowerCase());
      if (!existingClient) { await api.post('/api/clients', { nom: clientNom, phone: clientPhone, adresse: clientAddress }); await fetchClients(); }
      for (const produit of produitsListe) {
        const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
        if (!existingProduct) { await api.post('/api/products', { description: produit.nom, purchasePrice: produit.prixUnitaire, quantity: produit.quantite }); }
      }
      await fetchProducts();

      if (editingCommande) {
        // Dé-réserver les anciens produits qui ne sont plus dans la liste
        if (editingCommande.type === 'reservation') {
          for (const oldProduit of editingCommande.produits) {
            const stillInList = produitsListe.some(p => p.nom.toLowerCase() === oldProduit.nom.toLowerCase());
            if (!stillInList) {
              const existingProduct = products.find(p => p.description.toLowerCase() === oldProduit.nom.toLowerCase());
              if (existingProduct) {
                try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'non' }); } catch (err) { console.error('Erreur dé-réservation ancien produit:', err); }
              }
            }
          }
        }
        await api.put(`/api/commandes/${editingCommande.id}`, commandeData);
        // Marquer les nouveaux produits comme réservés si c'est une réservation
        if (type === 'reservation') {
          for (const produit of produitsListe) {
            const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
            if (existingProduct) {
              try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'oui' }); } catch (err) { console.error('Erreur marquage réservation produit:', err); }
            }
          }
        }
        if (type === 'reservation' && dateEcheance && horaire) {
          try { await rdvFromReservationService.updateRdvFromCommande({ ...editingCommande, ...commandeData } as Commande); } catch (err) { console.error('Erreur mise à jour RDV:', err); }
        }
        toast({ title: 'Succès', description: 'Commande modifiée avec succès', className: "bg-app-green text-white" });
      } else {
        const response = await api.post('/api/commandes', commandeData);
        const newCommande = response.data as Commande;
        // Marquer les produits comme réservés si c'est une réservation
        if (type === 'reservation') {
          for (const produit of produitsListe) {
            const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
            if (existingProduct) {
              try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'oui' }); } catch (err) { console.error('Erreur marquage réservation produit:', err); }
            }
          }
        }
        if (type === 'reservation' && dateEcheance && horaire) { setPendingReservationForRdv(newCommande); setShowRdvConfirmDialog(true); }
        toast({ title: 'Succès', description: 'Commande ajoutée avec succès', className: "bg-app-green text-white" });
      }
      fetchCommandes(); resetForm(); setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving commande:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder la commande', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  // =========================================================================
  // Édition d'une commande
  // =========================================================================

  const handleEdit = useCallback((commande: Commande) => {
    setEditingCommande(commande); setClientNom(commande.clientNom); setClientPhone(commande.clientPhone);
    setClientAddress(commande.clientAddress); setType(commande.type); setProduitsListe(commande.produits);
    setDateArrivagePrevue(commande.dateArrivagePrevue || ''); setDateEcheance(commande.dateEcheance || '');
    setHoraire(commande.horaire || ''); setClientSearch(commande.clientNom); setIsDialogOpen(true);
  }, []);

  // =========================================================================
  // Suppression
  // =========================================================================

  const handleDelete = async (id: string) => {
    try {
      try { await rdvFromReservationService.deleteRdvFromCommande(id); } catch (err) { console.error('Erreur suppression RDV lié:', err); }
      await api.delete(`/api/commandes/${id}`);
      toast({ title: 'Succès', description: 'Commande supprimée', className: "bg-app-green text-white" });
      fetchCommandes(); setDeleteId(null);
    } catch (error) {
      console.error('Error deleting commande:', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer la commande', className: "bg-app-red text-white", variant: 'destructive' });
    }
  };

  // =========================================================================
  // Gestion des statuts
  // =========================================================================

  const handleStatusChange = async (id: string, newStatus: CommandeStatut | 'reporter') => {
    const commande = commandes.find(c => c.id === id);
    if (!commande) return;
    if (newStatus === 'valide') { setValidatingId(id); return; }
    if (newStatus === 'annule') { setCancellingId(id); return; }
    if (newStatus === 'reporter') {
      const currentDate = commande.type === 'commande' ? commande.dateArrivagePrevue : commande.dateEcheance;
      setReporterDate(currentDate || ''); setReporterHoraire(commande.horaire || '');
      setReporterCommandeId(id); setReporterModalOpen(true); return;
    }
    if (commande.statut === 'valide' && commande.saleId) {
      try {
        await api.delete(`/api/sales/${commande.saleId}`);
        await api.put(`/api/commandes/${id}`, { statut: newStatus, saleId: null });
        toast({ title: 'Succès', description: 'Statut mis à jour et vente annulée', className: "bg-app-green text-white" });
        await Promise.all([fetchCommandes(), fetchProducts()]); return;
      } catch (error) { console.error('Error reverting validation:', error); toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', className: "bg-app-red text-white", variant: 'destructive' }); return; }
    }
    try {
      await api.put(`/api/commandes/${id}`, { statut: newStatus });
      if (commande.type === 'reservation') await reservationRdvSyncService.syncRdvStatus(id, newStatus as CommandeStatut);
      toast({ title: 'Succès', description: 'Statut mis à jour', className: "bg-app-green text-white" }); fetchCommandes();
    } catch (error) { console.error('Error updating status:', error); toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', className: "bg-app-red text-white", variant: 'destructive' }); }
  };

  // =========================================================================
  // Confirmation d'annulation
  // =========================================================================

  const confirmCancellation = async () => {
    if (!cancellingId) return;
    const commande = commandes.find(c => c.id === cancellingId);
    try {
      if (commande && commande.statut === 'valide' && commande.saleId) await api.delete(`/api/sales/${commande.saleId}`);
      await api.put(`/api/commandes/${cancellingId}`, { statut: 'annule', saleId: null });
      // Dé-réserver tous les produits de cette réservation annulée
      if (commande && commande.type === 'reservation') {
        for (const produit of commande.produits) {
          const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
          if (existingProduct) {
            try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'non' }); } catch (err) { console.error('Erreur dé-réservation produit:', err); }
          }
        }
        try { await api.put(`/api/rdv/by-commande/${cancellingId}`, { statut: 'annule' }); } catch (rdvError) { console.log('RDV non trouvé:', rdvError); }
      }
      toast({ title: 'Succès', description: 'Commande annulée', className: "bg-app-green text-white" });
      await Promise.all([fetchCommandes(), fetchProducts()]); setCancellingId(null);
    } catch (error) { console.error('Error cancelling:', error); toast({ title: 'Erreur', description: "Impossible d'annuler", className: "bg-app-red text-white", variant: 'destructive' }); }
  };

  // =========================================================================
  // Confirmation de validation
  // =========================================================================

  const confirmValidation = async () => {
    if (!validatingId) return;
    const commandeToValidate = commandes.find(c => c.id === validatingId);
    if (!commandeToValidate) return;
    try {
      for (const p of commandeToValidate.produits) {
        const existingProduct = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        if (existingProduct && existingProduct.quantity < p.quantite) {
          toast({ title: 'Stock insuffisant', description: `Stock disponible pour ${p.nom}: ${existingProduct.quantity} unités`, className: "bg-app-red text-white", variant: 'destructive' }); return;
        }
      }
      const today = new Date().toISOString().split('T')[0];
      const saleProducts = [];
      for (const p of commandeToValidate.produits) {
        let product = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
        if (!product) { const newProductResponse = await api.post('/api/products', { description: p.nom, purchasePrice: p.prixUnitaire, quantity: p.quantite }); product = newProductResponse.data; }
        saleProducts.push({ productId: product.id, description: p.nom, quantitySold: p.quantite, purchasePrice: p.prixUnitaire * p.quantite, sellingPrice: p.prixVente * p.quantite, profit: (p.prixVente - p.prixUnitaire) * p.quantite, deliveryFee: 0, deliveryLocation: "Saint-Denis" });
      }
      const totalPurchasePrice = commandeToValidate.produits.reduce((sum, p) => sum + (p.prixUnitaire * p.quantite), 0);
      const totalSellingPrice = commandeToValidate.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0);
      const saleData = { date: today, products: saleProducts, totalPurchasePrice, totalSellingPrice, totalProfit: totalSellingPrice - totalPurchasePrice, clientName: commandeToValidate.clientNom, clientAddress: commandeToValidate.clientAddress, clientPhone: commandeToValidate.clientPhone, reste: 0, nextPaymentDate: null };
      if (commandeToValidate.type === 'reservation') { try { await api.put(`/api/rdv/by-commande/${validatingId}`, { statut: 'confirme' }); } catch (rdvError) { console.log('RDV non trouvé:', rdvError); } }
      // Mark associated tache as completed with current time as heureFin
      if (commandeToValidate.type === 'reservation') {
        try {
          const tachesResponse = await tacheApi.getAll();
          const taches = tachesResponse.data || tachesResponse;
          const associatedTache = (taches as any[]).find((t: any) => t.commandeId === validatingId);
          if (associatedTache && !associatedTache.completed) {
            const now = new Date();
            const currentHeureFin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            await tacheApi.update(associatedTache.id, { completed: true, heureFin: currentHeureFin });
          }
        } catch (tacheErr) { console.log('Tâche associée non trouvée:', tacheErr); }
      }
      const saleResponse = await api.post('/api/sales', saleData);
      const createdSale = saleResponse.data;
      await api.put(`/api/commandes/${validatingId}`, { statut: 'valide', saleId: createdSale.id });
      // Dé-réserver les produits et déduire la quantité réservée du stock
      if (commandeToValidate.type === 'reservation') {
        for (const p of commandeToValidate.produits) {
          const existingProduct = products.find(prod => prod.description.toLowerCase() === p.nom.toLowerCase());
          if (existingProduct) {
            const newQuantity = Math.max(0, existingProduct.quantity - p.quantite);
            try { await api.put(`/api/products/${existingProduct.id}`, { reserver: 'non', quantity: newQuantity }); } catch (err) { console.error('Erreur dé-réservation/stock produit:', err); }
          }
        }
      }
      toast({ title: 'Succès', description: 'Commande validée et enregistrée comme vente', className: "bg-app-green text-white" });
      await Promise.all([fetchCommandes(), fetchProducts()]); setValidatingId(null);
    } catch (error) { console.error('Error validating:', error); toast({ title: 'Erreur', description: 'Impossible de valider', className: "bg-app-red text-white", variant: 'destructive' }); }
  };

  // =========================================================================
  // Gestion du report
  // =========================================================================

  const handleReporterConfirm = async () => {
    if (!reporterCommandeId || !reporterDate) { toast({ title: 'Erreur', description: 'Veuillez sélectionner une date', className: "bg-app-red text-white", variant: 'destructive' }); return; }
    try {
      const commande = commandes.find(c => c.id === reporterCommandeId);
      if (!commande) return;
      const updateData: Record<string, unknown> = { statut: 'reporter', horaire: reporterHoraire || undefined };
      if (commande.type === 'commande') updateData.dateArrivagePrevue = reporterDate;
      else updateData.dateEcheance = reporterDate;
      await api.put(`/api/commandes/${reporterCommandeId}`, updateData);
      if (commande.type === 'reservation') {
        try {
          const heureDebut = reporterHoraire || '09:00';
          const [h, m] = heureDebut.split(':').map(Number);
          const endH = (h + 1) % 24;
          const heureFin = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          await api.put(`/api/rdv/by-commande/${reporterCommandeId}`, { date: reporterDate, heureDebut, heureFin, statut: 'reporte' });
        } catch (rdvError) { console.log('RDV non trouvé:', rdvError); }
      }
      toast({ title: 'Succès', description: `Reporté au ${new Date(reporterDate).toLocaleDateString('fr-FR')}${reporterHoraire ? ' à ' + reporterHoraire : ''}`, className: "bg-app-green text-white" });
      fetchCommandes(); setReporterModalOpen(false); setReporterCommandeId(null); setReporterDate(''); setReporterHoraire('');
    } catch (error) { console.error('Error updating date:', error); toast({ title: 'Erreur', description: 'Impossible de reporter', className: "bg-app-red text-white", variant: 'destructive' }); }
  };

  // =========================================================================
  // Gestion de la création RDV depuis réservation
  // =========================================================================

  const handleCreateRdvFromReservation = async (titre: string, description: string) => {
    if (!pendingReservationForRdv) return;
    setIsRdvLoading(true);
    try {
      const heureDebut = pendingReservationForRdv.horaire || '09:00';
      const [hours, minutes] = heureDebut.split(':').map(Number);
      const endHours = (hours + 1) % 24;
      const heureFin = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const rdvData = {
        titre: titre || `Réservation pour ${pendingReservationForRdv.clientNom}`,
        description: description || '', clientNom: pendingReservationForRdv.clientNom,
        clientTelephone: pendingReservationForRdv.clientPhone, clientAdresse: pendingReservationForRdv.clientAddress,
        date: pendingReservationForRdv.dateEcheance, heureDebut, heureFin,
        lieu: pendingReservationForRdv.clientAddress, statut: 'planifie',
        notes: `Créé depuis une réservation`,
        produits: pendingReservationForRdv.produits.map(p => ({ nom: p.nom, quantite: p.quantite, prixUnitaire: p.prixUnitaire, prixVente: p.prixVente })),
        commandeId: pendingReservationForRdv.id,
      };
      await api.post('/api/rdv', rdvData);
      toast({ title: '📅 Rendez-vous créé', description: `Le RDV a été créé pour le ${pendingReservationForRdv.dateEcheance}`, className: "bg-app-green text-white" });

      // Also create as tache - check for time conflicts first
      const tacheData = {
        date: pendingReservationForRdv.dateEcheance || '',
        heureDebut,
        heureFin,
        description: titre || `RDV: ${pendingReservationForRdv.clientNom}`,
        importance: 'pertinent' as const,
        travailleurId: '',
        travailleurNom: '',
        commandeId: pendingReservationForRdv.id,
      };

      try {
        await tacheApi.create(tacheData);
        toast({ title: '📋 Tâche créée', description: 'La tâche correspondante a été ajoutée au calendrier', className: "bg-app-green text-white" });
      } catch (tacheErr: any) {
        if (tacheErr?.response?.status === 409) {
          // Time conflict - check what task conflicts
          const conflictData = tacheErr.response.data;
          const conflictTache = conflictData.conflict;
          
          // Try to find the conflicting tache
          try {
            const existingTaches = await tacheApi.getByDate(tacheData.date);
            const conflicting = existingTaches.data.find((t: any) => {
              const tStart = t.heureDebut.split(':').map(Number);
              const tEnd = t.heureFin.split(':').map(Number);
              const tStartMin = tStart[0] * 60 + tStart[1];
              const tEndMin = tEnd[0] * 60 + tEnd[1];
              const newStartMin = heureDebut.split(':').map(Number);
              const newEndMin = heureFin.split(':').map(Number);
              const nStart = newStartMin[0] * 60 + newStartMin[1];
              const nEnd = newEndMin[0] * 60 + newEndMin[1];
              return nStart <= tEndMin && nEnd >= tStartMin;
            });

            if (conflicting && conflicting.importance !== 'pertinent') {
              setConflictingTache(conflicting);
              setPendingTacheData(tacheData);
              setShowTacheConflictModal(true);
            } else {
              toast({ title: '⚠️ Conflit horaire', description: conflictData.error || 'Ce créneau est déjà occupé par une tâche non déplaçable', className: "bg-app-red text-white", variant: 'destructive' });
            }
          } catch {
            toast({ title: '⚠️ Conflit horaire', description: conflictData.error || 'Ce créneau est déjà occupé', className: "bg-app-red text-white", variant: 'destructive' });
          }
        } else {
          console.error('Erreur création tâche:', tacheErr);
        }
      }
    } catch (err) { console.error('Erreur création RDV:', err); toast({ title: 'Erreur', description: 'Impossible de créer le rendez-vous', className: "bg-app-red text-white", variant: 'destructive' }); }
    finally { setIsRdvLoading(false); setShowRdvFormModal(false); setPendingReservationForRdv(null); }
  };

  const handleRescheduleTacheAndCreate = async (tacheId: string, newDate: string, newHeureDebut: string, newHeureFin: string) => {
    try {
      // Reschedule conflicting tache
      await tacheApi.update(tacheId, { date: newDate, heureDebut: newHeureDebut, heureFin: newHeureFin });
      toast({ title: '✅ Tâche déplacée', description: 'La tâche conflictuelle a été déplacée', className: "bg-app-green text-white" });

      // Now create the new tache
      if (pendingTacheData) {
        try {
          await tacheApi.create(pendingTacheData);
          toast({ title: '📋 Tâche créée', description: 'La tâche RDV a été ajoutée au calendrier', className: "bg-app-green text-white" });
        } catch (err) {
          console.error('Erreur création tâche après reschedule:', err);
          toast({ title: 'Erreur', description: 'Impossible de créer la tâche après le déplacement', className: "bg-app-red text-white", variant: 'destructive' });
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Impossible de déplacer la tâche';
      toast({ title: 'Erreur', description: msg, className: "bg-app-red text-white", variant: 'destructive' });
    } finally {
      setShowTacheConflictModal(false);
      setConflictingTache(null);
      setPendingTacheData(null);
    }
  };

  const handleSkipTacheConflict = () => {
    setShowTacheConflictModal(false);
    setConflictingTache(null);
    setPendingTacheData(null);
    toast({ title: 'ℹ️ Tâche non créée', description: 'Le RDV a été créé sans tâche associée' });
  };

  const handleDeclineRdv = useCallback(() => { setShowRdvConfirmDialog(false); setPendingReservationForRdv(null); }, []);
  const handleAcceptRdv = useCallback(() => { setShowRdvConfirmDialog(false); setShowRdvFormModal(true); }, []);
  const handleCloseRdvModal = useCallback(() => { setShowRdvFormModal(false); setPendingReservationForRdv(null); }, []);

  // =========================================================================
  // Options de statut
  // =========================================================================

  const getStatusOptions = useCallback((commandeType: 'commande' | 'reservation') => {
    if (commandeType === 'commande') {
      return [
        { value: 'en_route', label: '📦 En Route' }, { value: 'arrive', label: '✅ Arrivé' },
        { value: 'valide', label: '💎 Validé' }, { value: 'annule', label: '❌ Annulé' }, { value: 'reporter', label: '📅 Reporter' },
      ];
    }
    return [
      { value: 'en_attente', label: '⏳ En Attente' }, { value: 'valide', label: '💎 Validé' },
      { value: 'annule', label: '❌ Annulé' }, { value: 'reporter', label: '📅 Reporter' },
    ];
  }, []);

  // =========================================================================
  // Export PDF
  // =========================================================================

  const handleExportPDF = useCallback(() => {
    if (commandesForExportDate.length === 0) {
      toast({ title: 'Aucune donnée', description: 'Aucune commande ou réservation pour cette date', className: "bg-app-red text-white", variant: 'destructive' }); return;
    }
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const dateFormatted = new Date(exportDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.text('Commandes & Réservations', 105, 20, { align: 'center' });
    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateFormatted}`, 105, 28, { align: 'center' });
    doc.text(`Total: ${commandesForExportDate.length} entrée(s)`, 105, 35, { align: 'center' });
    const tableData = commandesForExportDate.map(c => {
      const produits = c.produits.map(p => `${p.nom} (x${p.quantite})`).join('\n');
      const prixDetail = c.produits.map(p => `${p.prixVente}€ x ${p.quantite}`).join('\n');
      const total = c.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2);
      const dateEch = c.type === 'commande' ? new Date(c.dateArrivagePrevue || '').toLocaleDateString('fr-FR') : new Date(c.dateEcheance || '').toLocaleDateString('fr-FR');
      return [`${c.clientNom}\n${c.clientAddress}`, c.clientPhone, produits, `${prixDetail}\n\nTotal: ${total}€`, `${dateEch}\n${c.horaire || '-'}`];
    });
    autoTable(doc, {
      startY: 42, head: [['Client', 'Contact', 'Produit', 'Prix', 'Date/Horaire']], body: tableData,
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', valign: 'top' },
      headStyles: { fillColor: [147, 51, 234], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 25 }, 2: { cellWidth: 45 }, 3: { cellWidth: 35 }, 4: { cellWidth: 30 } },
      alternateRowStyles: { fillColor: [245, 243, 255] }
    });
    doc.save(`commandes_${exportDate}.pdf`);
    toast({ title: 'Succès', description: 'Export PDF effectué', className: "bg-app-green text-white" });
    setExportDialogOpen(false); setExportDate('');
  }, [commandesForExportDate, exportDate]);

  return {
    // Données
    commandes, clients, products, isLoading,
    filteredCommandes, filteredClients, filteredProducts, commandesForExportDate,
    // États formulaire
    isDialogOpen, setIsDialogOpen, editingCommande,
    clientNom, setClientNom, clientPhone, setClientPhone, clientAddress, setClientAddress,
    clientSearch, setClientSearch, showClientSuggestions, setShowClientSuggestions,
    type, setType, dateArrivagePrevue, setDateArrivagePrevue, dateEcheance, setDateEcheance, horaire, setHoraire,
    produitNom, setProduitNom, prixUnitaire, setPrixUnitaire, quantite, setQuantite, prixVente, setPrixVente,
    productSearch, setProductSearch, showProductSuggestions, setShowProductSuggestions,
    selectedProduct, produitsListe, editingProductIndex, availableQuantityForSelected,
    // États recherche/tri
    commandeSearch, setCommandeSearch, sortDateAsc, setSortDateAsc,
    // États modales
    deleteId, setDeleteId, validatingId, setValidatingId, cancellingId, setCancellingId,
    exportDialogOpen, setExportDialogOpen, exportDate, setExportDate,
    reporterModalOpen, setReporterModalOpen, reporterDate, setReporterDate, reporterHoraire, setReporterHoraire,
    showRdvConfirmDialog, showRdvFormModal, pendingReservationForRdv, isRdvLoading,
    showTacheConflictModal, conflictingTache,
    // Handlers
    handleClientSelect, handleProductSelect,
    handleAddProduit, handleEditProduit, handleRemoveProduit,
    handleSubmit, handleEdit, handleDelete,
    handleStatusChange, confirmValidation, confirmCancellation,
    handleReporterConfirm, handleExportPDF,
    handleCreateRdvFromReservation, handleDeclineRdv, handleAcceptRdv, handleCloseRdvModal,
    handleRescheduleTacheAndCreate, handleSkipTacheConflict,
    getStatusOptions, resetForm,
  };
};

export default useCommandesLogic;
