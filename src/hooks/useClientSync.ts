
import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService } from '@/services/realtimeService';
import axios from 'axios';

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
  dateCreation: string;
}

export const useClientSync = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const lastDataRef = useRef<Client[]>([]);

  const fetchClients = useCallback(async (isInitialLoad = false) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
      
      const response = await axios.get(`${API_BASE_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Clients chargés:', response.data);
      
      // Conserver les données si elles sont identiques
      const newData = response.data || [];
      const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(newData);
      
      if (hasChanged || isInitialLoad) {
        setClients(newData);
        lastDataRef.current = newData;
      }
      
      if (isInitialLoad) {
        setHasInitialLoad(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des clients:', error);
      
      // Ne pas effacer les données existantes en cas d'erreur, sauf si c'est le premier chargement
      if (!hasInitialLoad) {
        setClients([]);
        lastDataRef.current = [];
      }
      setIsLoading(false);
    }
  }, [hasInitialLoad]);

  useEffect(() => {
    console.log('🔌 Initialisation du hook useClientSync avec synchronisation temps réel');
    
    // Chargement initial
    fetchClients(true);

    // Connexion au service de synchronisation en temps réel
    const token = localStorage.getItem('token');
    realtimeService.connect(token);

    // Écouter les changements en temps réel pour les clients
    const unsubscribe = realtimeService.addDataListener((data) => {
      console.log('📡 Données reçues en temps réel:', data);
      
      if (data.clients) {
        console.log('👥 Mise à jour des clients en temps réel:', data.clients);
        
        // Vérifier si les données ont vraiment changé
        const newData = data.clients || [];
        const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(newData);
        
        if (hasChanged) {
          setClients(newData);
          lastDataRef.current = newData;
          setIsLoading(false);
        }
      }
    });

    // Écouter les événements de synchronisation
    const unsubscribeSync = realtimeService.addSyncListener((event) => {
      console.log('🔄 Événement de sync reçu:', event);
      
      if (event.type === 'force-sync') {
        console.log('🚀 Force sync détecté, rechargement des clients');
        // Ne pas mettre isLoading à true pour éviter de cacher les données existantes
        fetchClients(false);
      }
    });

    return () => {
      console.log('🔌 Nettoyage du hook useClientSync');
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

  const refetch = useCallback(() => {
    // Refetch sans effacer les données existantes
    fetchClients(false);
  }, [fetchClients]);

  return {
    clients,
    isLoading: isLoading && !hasInitialLoad, // Afficher le loading seulement pour le premier chargement
    searchClients,
    refetch
  };
};
