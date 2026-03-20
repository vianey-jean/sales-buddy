// Hook personnalisé pour la gestion des clients
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { clientApiService } from '@/services/api';
import { realtimeService } from '@/services/realtimeService';
import { Client, ClientFormData } from '@/types/client';
import { useToast } from '@/hooks/use-toast';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const lastDataRef = useRef<Client[]>([]);
  const { toast } = useToast();

  const fetchClients = useCallback(async (isInitialLoad = false) => {
    try {
      const data = await clientApiService.getAll();
      const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(data);
      
      if (hasChanged || isInitialLoad) {
        setClients(data);
        lastDataRef.current = data;
      }
      
      if (isInitialLoad) {
        setHasInitialLoad(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des clients:', error);
      if (!hasInitialLoad) {
        setClients([]);
        lastDataRef.current = [];
      }
      setIsLoading(false);
    }
  }, [hasInitialLoad]);

  useEffect(() => {
    fetchClients(true);

    const token = localStorage.getItem('token');
    realtimeService.connect(token);

    const unsubscribe = realtimeService.addDataListener((data) => {
      if (data.clients) {
        const newData = data.clients || [];
        const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(newData);
        
        if (hasChanged) {
          setClients(newData);
          lastDataRef.current = newData;
          setIsLoading(false);
        }
      }
    });

    const unsubscribeSync = realtimeService.addSyncListener((event) => {
      if (event.type === 'force-sync') {
        fetchClients(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSync();
    };
  }, [fetchClients]);

  const searchClients = useCallback((query: string): Client[] => {
    if (query.length < 3) return [];
    return clients.filter(client => 
      client.nom.toLowerCase().includes(query.toLowerCase())
    );
  }, [clients]);

  const addClient = useCallback(async (data: ClientFormData): Promise<boolean> => {
    try {
      await clientApiService.create(data);
      toast({
        title: "Succès",
        description: "Client ajouté avec succès",
        className: "notification-success",
      });
      fetchClients(false);
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout",
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    }
  }, [fetchClients, toast]);

  const updateClient = useCallback(async (id: string, data: Partial<ClientFormData>): Promise<boolean> => {
    try {
      await clientApiService.update(id, data);
      toast({
        title: "Succès",
        description: "Client mis à jour avec succès",
        className: "notification-success",
      });
      fetchClients(false);
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    }
  }, [fetchClients, toast]);

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    try {
      await clientApiService.delete(id);
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
        className: "notification-success",
      });
      fetchClients(false);
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    }
  }, [fetchClients, toast]);

  const refetch = useCallback(() => {
    fetchClients(false);
  }, [fetchClients]);

  return {
    clients,
    isLoading: isLoading && !hasInitialLoad,
    searchClients,
    addClient,
    updateClient,
    deleteClient,
    refetch,
  };
};

// Hook pour la pagination des clients
export const useClientsPagination = (clients: Client[], itemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = useMemo(() => {
    if (searchQuery.length < 3) return clients;
    return clients.filter(client =>
      client.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.adresse.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  return {
    filteredClients,
    paginatedClients,
    currentPage,
    totalPages,
    searchQuery,
    setCurrentPage,
    setSearchQuery,
  };
};

export default useClients;
