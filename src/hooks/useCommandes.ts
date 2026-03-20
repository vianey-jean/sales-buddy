// Hook personnalisé pour la gestion des commandes
import { useState, useEffect, useCallback, useMemo } from 'react';
import { commandeApiService, clientApiService, productApiService } from '@/services/api';
import { Commande, CommandeFormData, CommandeProduit } from '@/types/commande';
import { Client } from '@/types/client';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

export const useCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [commandesData, clientsData, productsData] = await Promise.all([
        commandeApiService.getAll(),
        clientApiService.getAll(),
        productApiService.getAll(),
      ]);
      setCommandes(commandesData);
      setClients(clientsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
        className: "bg-app-red text-white",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createCommande = useCallback(async (data: CommandeFormData): Promise<boolean> => {
    try {
      // Créer le client s'il n'existe pas
      const existingClient = clients.find(c => c.nom.toLowerCase() === data.clientNom.toLowerCase());
      if (!existingClient) {
        await clientApiService.create({
          nom: data.clientNom,
          phone: data.clientPhone,
          adresse: data.clientAddress,
        });
      }

      // Créer les produits s'ils n'existent pas
      for (const produit of data.produits) {
        const existingProduct = products.find(p => p.description.toLowerCase() === produit.nom.toLowerCase());
        if (!existingProduct) {
          await productApiService.create({
            description: produit.nom,
            purchasePrice: produit.prixUnitaire,
            quantity: produit.quantite,
          });
        }
      }

      await commandeApiService.create(data);
      toast({
        title: 'Succès',
        description: 'Commande ajoutée avec succès',
        className: "bg-app-green text-white",
      });
      fetchAll();
      return true;
    } catch (error) {
      console.error('Error creating commande:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la commande',
        variant: 'destructive',
        className: "bg-app-red text-white",
      });
      return false;
    }
  }, [clients, products, fetchAll, toast]);

  const updateCommande = useCallback(async (id: string, data: Partial<Commande>): Promise<boolean> => {
    try {
      await commandeApiService.update(id, data);
      toast({
        title: 'Succès',
        description: 'Commande modifiée avec succès',
        className: "bg-app-green text-white",
      });
      fetchAll();
      return true;
    } catch (error) {
      console.error('Error updating commande:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la commande',
        variant: 'destructive',
        className: "bg-app-red text-white",
      });
      return false;
    }
  }, [fetchAll, toast]);

  const deleteCommande = useCallback(async (id: string): Promise<boolean> => {
    try {
      await commandeApiService.delete(id);
      toast({
        title: 'Succès',
        description: 'Commande supprimée avec succès',
        className: "bg-app-green text-white",
      });
      fetchAll();
      return true;
    } catch (error) {
      console.error('Error deleting commande:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la commande',
        variant: 'destructive',
        className: "bg-app-red text-white",
      });
      return false;
    }
  }, [fetchAll, toast]);

  const validateCommande = useCallback(async (id: string): Promise<boolean> => {
    return updateCommande(id, { statut: 'valide' });
  }, [updateCommande]);

  const cancelCommande = useCallback(async (id: string): Promise<boolean> => {
    return updateCommande(id, { statut: 'annule' });
  }, [updateCommande]);

  const refetch = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    commandes,
    clients,
    products,
    isLoading,
    createCommande,
    updateCommande,
    deleteCommande,
    validateCommande,
    cancelCommande,
    refetch,
  };
};

// Hook pour filtrer et trier les commandes
export const useCommandesFilter = (
  commandes: Commande[],
  searchQuery: string,
  sortDateAsc: boolean
) => {
  return useMemo(() => {
    // Si recherche active, montrer toutes les commandes
    const commandesToFilter = searchQuery.length >= 3
      ? commandes
      : commandes.filter(c => c.statut !== 'valide' && c.statut !== 'annule');

    let filtered = commandesToFilter;
    if (searchQuery.length >= 3) {
      const searchLower = searchQuery.toLowerCase();
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

      const dateDiff = sortDateAsc
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();

      if (dateDiff === 0) {
        const horaireA = a.horaire || '23:59';
        const horaireB = b.horaire || '23:59';
        return sortDateAsc
          ? horaireA.localeCompare(horaireB)
          : horaireB.localeCompare(horaireA);
      }

      return dateDiff;
    });
  }, [commandes, searchQuery, sortDateAsc]);
};

// Hook pour la gestion du panier de produits
export const useCommandeCart = () => {
  const [produitsListe, setProduitsListe] = useState<CommandeProduit[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const addProduit = useCallback((produit: CommandeProduit) => {
    if (editingIndex !== null) {
      const nouveauxProduits = [...produitsListe];
      nouveauxProduits[editingIndex] = produit;
      setProduitsListe(nouveauxProduits);
      setEditingIndex(null);
      toast({
        title: 'Produit modifié',
        description: `${produit.nom} a été mis à jour`,
      });
    } else {
      setProduitsListe([...produitsListe, produit]);
      toast({
        title: 'Produit ajouté',
        description: `${produit.nom} a été ajouté au panier`,
      });
    }
  }, [produitsListe, editingIndex, toast]);

  const editProduit = useCallback((index: number) => {
    setEditingIndex(index);
    toast({
      title: 'Mode édition',
      description: 'Modifiez les champs et cliquez sur "Ajouter ce produit" pour sauvegarder',
    });
  }, [toast]);

  const removeProduit = useCallback((index: number) => {
    setProduitsListe(produitsListe.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
    toast({
      title: 'Produit retiré',
      description: 'Le produit a été retiré du panier',
    });
  }, [produitsListe, editingIndex, toast]);

  const resetCart = useCallback(() => {
    setProduitsListe([]);
    setEditingIndex(null);
  }, []);

  const getEditingProduit = useCallback((): CommandeProduit | null => {
    if (editingIndex === null) return null;
    return produitsListe[editingIndex];
  }, [produitsListe, editingIndex]);

  return {
    produitsListe,
    editingIndex,
    addProduit,
    editProduit,
    removeProduit,
    resetCart,
    getEditingProduit,
    setProduitsListe,
  };
};

export default useCommandes;
