
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/service/api';
import { useAuth } from '@/contexts/AuthContext';
import { realtimeService } from '@/services/realtimeService';

export interface Message {
  id: string;
  expediteurNom: string;
  expediteurEmail: string;
  expediteurTelephone?: string;
  sujet: string;
  contenu: string;
  destinataireId: string;
  dateEnvoi: string;
  lu: boolean;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Récupérer les messages
  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await api.get('/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Récupérer le compteur de messages non lus
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/api/messages/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Erreur lors de la récupération du compteur:', error);
    }
  }, [isAuthenticated]);

  // Marquer un message comme lu
  const markAsRead = async (messageId: string) => {
    try {
      await api.put(`/api/messages/${messageId}/read`);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, lu: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  // Marquer un message comme non lu
  const markAsUnread = async (messageId: string) => {
    try {
      await api.put(`/api/messages/${messageId}/unread`);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, lu: false } : msg
        )
      );
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors du marquage comme non lu:', error);
    }
  };

  // Supprimer un message
  const deleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/api/messages/${messageId}`);
      const messageToDelete = messages.find(msg => msg.id === messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      if (messageToDelete && !messageToDelete.lu) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Envoyer un nouveau message
  const sendMessage = async (messageData: Omit<Message, 'id' | 'dateEnvoi' | 'lu'>) => {
    try {
      const response = await api.post('/api/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  };

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const unsubscribe = realtimeService.addDataListener((data) => {
      if (data.messages) {
        // Filtrer les messages pour l'utilisateur connecté
        const userMessages = data.messages.filter(
          (msg: Message) => msg.destinataireId === user.id
        );
        setMessages(userMessages);
        
        // Mettre à jour le compteur
        const unreadMessages = userMessages.filter((msg: Message) => !msg.lu);
        setUnreadCount(unreadMessages.length);
      }
    });

    return unsubscribe;
  }, [isAuthenticated, user]);

  // Charger les données initiales
  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchMessages, fetchUnreadCount]);

  return {
    messages,
    unreadCount,
    isLoading,
    markAsRead,
    markAsUnread,
    deleteMessage,
    sendMessage,
    refreshMessages: fetchMessages
  };
};
