// Service API pour les commandes
import api from './api';
import { Commande, CommandeFormData } from '@/types/commande';
import { AxiosResponse } from 'axios';

export const commandeApiService = {
  async getAll(): Promise<Commande[]> {
    const response: AxiosResponse<Commande[]> = await api.get('/api/commandes');
    return response.data;
  },

  async getById(id: string): Promise<Commande> {
    const response: AxiosResponse<Commande> = await api.get(`/api/commandes/${id}`);
    return response.data;
  },

  async create(data: CommandeFormData): Promise<Commande> {
    const commandeData = {
      ...data,
      dateCommande: new Date().toISOString(),
      statut: data.type === 'commande' ? 'en_route' : 'en_attente',
    };
    const response: AxiosResponse<Commande> = await api.post('/api/commandes', commandeData);
    return response.data;
  },

  async update(id: string, data: Partial<Commande>): Promise<Commande> {
    const response: AxiosResponse<Commande> = await api.put(`/api/commandes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    await api.delete(`/api/commandes/${id}`);
    return true;
  },

  async updateStatus(id: string, statut: string): Promise<Commande> {
    const response: AxiosResponse<Commande> = await api.put(`/api/commandes/${id}`, { statut });
    return response.data;
  },

  async markNotificationSent(id: string): Promise<Commande> {
    const response: AxiosResponse<Commande> = await api.put(`/api/commandes/${id}`, { notificationEnvoyee: true });
    return response.data;
  },
};

export default commandeApiService;
