// Service API pour les dépenses
import api from './api';
import { DepenseDuMois, DepenseFixe } from '@/types/depense';
import { AxiosResponse } from 'axios';

export const depenseApiService = {
  // Mouvements (dépenses du mois)
  async getMouvements(): Promise<DepenseDuMois[]> {
    const response: AxiosResponse<DepenseDuMois[]> = await api.get('/api/depenses/mouvements');
    return response.data;
  },

  async createMouvement(data: Omit<DepenseDuMois, 'id'>): Promise<DepenseDuMois> {
    const response: AxiosResponse<DepenseDuMois> = await api.post('/api/depenses/mouvements', data);
    return response.data;
  },

  async updateMouvement(id: string, data: Partial<DepenseDuMois>): Promise<DepenseDuMois> {
    const response: AxiosResponse<DepenseDuMois> = await api.put(`/api/depenses/mouvements/${id}`, data);
    return response.data;
  },

  async deleteMouvement(id: string): Promise<boolean> {
    await api.delete(`/api/depenses/mouvements/${id}`);
    return true;
  },

  async resetMouvements(): Promise<boolean> {
    await api.post('/api/depenses/reset');
    return true;
  },

  // Dépenses fixes
  async getDepensesFixe(): Promise<DepenseFixe> {
    const response: AxiosResponse<DepenseFixe> = await api.get('/api/depenses/fixe');
    return response.data;
  },

  async updateDepensesFixe(data: Partial<DepenseFixe>): Promise<DepenseFixe> {
    const response: AxiosResponse<DepenseFixe> = await api.put('/api/depenses/fixe', data);
    return response.data;
  },
};

export default depenseApiService;
