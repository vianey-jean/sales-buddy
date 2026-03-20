// Service API pour les bénéfices
import api from './api';
import { AxiosResponse } from 'axios';

export interface Benefice {
  id: string;
  productId: string;
  productDescription: string;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  margin: number;
  date: string;
}

export const beneficeApiService = {
  async getAll(): Promise<Benefice[]> {
    console.log('📊 Fetching benefices from API...');
    const response: AxiosResponse<Benefice[]> = await api.get('/api/benefices');
    console.log(`✅ Retrieved ${response.data.length} benefices from API`);
    return response.data;
  },

  async getByProductId(productId: string): Promise<Benefice | null> {
    try {
      const response: AxiosResponse<Benefice> = await api.get(`/api/benefices/product/${productId}`);
      return response.data;
    } catch {
      console.log('Aucune donnée de bénéfice existante pour ce produit');
      return null;
    }
  },

  async create(data: Omit<Benefice, 'id'>): Promise<Benefice> {
    console.log('📝 Adding new benefice:', data);
    const response: AxiosResponse<Benefice> = await api.post('/api/benefices', data);
    console.log('✅ Benefice added successfully:', response.data);
    return response.data;
  },

  async update(id: string, data: Partial<Benefice>): Promise<Benefice> {
    console.log('📝 Updating benefice:', data);
    const response: AxiosResponse<Benefice> = await api.put(`/api/benefices/${id}`, data);
    console.log('✅ Benefice updated successfully:', response.data);
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    console.log('🗑️ Deleting benefice with ID:', id);
    await api.delete(`/api/benefices/${id}`);
    console.log('✅ Benefice deleted successfully');
    return true;
  },
};

export default beneficeApiService;
