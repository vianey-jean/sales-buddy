// Service API pour les prêts familles
import api from './api';
import { PretFamille } from '@/types/pret';
import { AxiosResponse } from 'axios';

export const pretFamilleApiService = {
  async getAll(): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await api.get('/api/pretfamilles');
    return response.data;
  },

  async getById(id: string): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.get(`/api/pretfamilles/${id}`);
    return response.data;
  },

  async create(data: Omit<PretFamille, 'id'>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.post('/api/pretfamilles', data);
    return response.data;
  },

  async update(id: string, data: Partial<PretFamille>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.put(`/api/pretfamilles/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    await api.delete(`/api/pretfamilles/${id}`);
    return true;
  },

  async searchByName(name: string): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await api.get(`/api/pretfamilles/search/nom?q=${encodeURIComponent(name)}`);
    return response.data;
  },
};

export default pretFamilleApiService;
