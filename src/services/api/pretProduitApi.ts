// Service API pour les prêts produits
import api from './api';
import { PretProduit } from '@/types/pret';
import { AxiosResponse } from 'axios';

export const pretProduitApiService = {
  async getAll(): Promise<PretProduit[]> {
    const response: AxiosResponse<PretProduit[]> = await api.get('/api/pretproduits');
    return response.data;
  },

  async getById(id: string): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.get(`/api/pretproduits/${id}`);
    return response.data;
  },

  async create(data: Omit<PretProduit, 'id'>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.post('/api/pretproduits', data);
    return response.data;
  },

  async update(id: string, data: Partial<PretProduit>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.put(`/api/pretproduits/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    await api.delete(`/api/pretproduits/${id}`);
    return true;
  },

  async transfer(fromName: string, toName: string, pretIds: string[]): Promise<{ message: string; transferred: number }> {
    const response: AxiosResponse<{ message: string; transferred: number }> = await api.post('/api/pretproduits/transfer', {
      fromName,
      toName,
      pretIds
    });
    return response.data;
  },
};

export default pretProduitApiService;
