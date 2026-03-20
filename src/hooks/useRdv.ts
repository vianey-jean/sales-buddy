import { useState, useCallback, useEffect } from 'react';
import { RDV, RDVFormData } from '@/types/rdv';
import rdvApiService from '@/services/api/rdvApi';
import { rdvNotificationsApi } from '@/services/api/rdvNotificationsApi';
import { useToast } from '@/hooks/use-toast';

export function useRdv() {
  const [rdvs, setRdvs] = useState<RDV[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger tous les RDV
  const fetchRdvs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rdvApiService.getAll();
      setRdvs(data);
    } catch (err) {
      setError('Erreur lors du chargement des rendez-vous');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un RDV
  const createRdv = useCallback(async (data: RDVFormData): Promise<RDV | null> => {
    setLoading(true);
    try {
      const newRdv = await rdvApiService.create(data);
      setRdvs(prev => [...prev, newRdv]);
      
      // La notification est créée automatiquement côté serveur
      
      toast({
        title: 'Succès',
        description: 'Rendez-vous créé avec succès',
        className: "bg-app-green text-white",
      });
      return newRdv;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le rendez-vous',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Mettre à jour un RDV
  const updateRdv = useCallback(async (id: string, data: Partial<RDVFormData>): Promise<RDV | null> => {
    setLoading(true);
    try {
      const updatedRdv = await rdvApiService.update(id, data);
      setRdvs(prev => prev.map(rdv => rdv.id === id ? updatedRdv : rdv));
      
      // La synchronisation notification est gérée côté serveur
      
      toast({
        title: 'Succès',
        description: 'Rendez-vous modifié avec succès',
        className: "bg-app-green text-white",
      });
      return updatedRdv;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le rendez-vous',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Supprimer un RDV
  const deleteRdv = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      // La notification est supprimée automatiquement côté serveur
      await rdvApiService.delete(id);
      setRdvs(prev => prev.filter(rdv => rdv.id !== id));
      toast({
        title: 'Succès',
        description: 'Rendez-vous supprimé avec succès',
        className: "bg-app-green text-white",
      });
      return true;
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le rendez-vous',
        className: "bg-app-red text-white",
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Marquer comme notifié
  const markAsNotified = useCallback(async (id: string): Promise<boolean> => {
    try {
      await rdvApiService.update(id, { notificationEnvoyee: true, rappelEnvoye: true });
      setRdvs(prev => prev.map(rdv => 
        rdv.id === id 
          ? { ...rdv, notificationEnvoyee: true, rappelEnvoye: true } 
          : rdv
      ));
      return true;
    } catch (err) {
      console.error('Erreur marquage notification:', err);
      return false;
    }
  }, []);

  // Rechercher des RDV
  const searchRdvs = useCallback(async (query: string): Promise<RDV[]> => {
    if (!query.trim()) {
      return rdvs;
    }
    try {
      const results = await rdvApiService.search(query);
      return results;
    } catch (err) {
      console.error('Erreur recherche:', err);
      // Recherche locale en fallback
      const lowerQuery = query.toLowerCase();
      return rdvs.filter(rdv =>
        rdv.titre.toLowerCase().includes(lowerQuery) ||
        rdv.clientNom.toLowerCase().includes(lowerQuery) ||
        rdv.description?.toLowerCase().includes(lowerQuery) ||
        rdv.lieu?.toLowerCase().includes(lowerQuery)
      );
    }
  }, [rdvs]);

  // Vérifier les conflits
  const checkConflicts = useCallback(async (
    date: string,
    heureDebut: string,
    heureFin: string,
    excludeId?: string
  ): Promise<RDV[]> => {
    try {
      return await rdvApiService.checkConflicts(date, heureDebut, heureFin, excludeId);
    } catch (err) {
      // Vérification locale en fallback
      return rdvs.filter(rdv => {
        if (excludeId && rdv.id === excludeId) return false;
        if (rdv.date !== date) return false;
        if (rdv.statut === 'annule' || rdv.statut === 'termine') return false;
        
        const start1 = rdv.heureDebut;
        const end1 = rdv.heureFin;
        const start2 = heureDebut;
        const end2 = heureFin;
        
        return (start1 < end2 && end1 > start2);
      });
    }
  }, [rdvs]);

  // Charger au montage
  useEffect(() => {
    fetchRdvs();
  }, [fetchRdvs]);

  return {
    rdvs,
    loading,
    error,
    fetchRdvs,
    createRdv,
    updateRdv,
    deleteRdv,
    markAsNotified,
    searchRdvs,
    checkConflicts,
  };
}

export default useRdv;
