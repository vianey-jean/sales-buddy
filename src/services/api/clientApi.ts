// Service API pour les clients
import api from './api';
import { Client, ClientFormData } from '@/types/client';
import { AxiosResponse } from 'axios';

export const clientApiService = {
  async getAll(): Promise<Client[]> {
    const response: AxiosResponse<Client[]> = await api.get('/api/clients');
    return response.data;
  },

  async getById(id: string): Promise<Client> {
    const response: AxiosResponse<Client> = await api.get(`/api/clients/${id}`);
    return response.data;
  },

  async create(data: ClientFormData): Promise<Client> {
    const response: AxiosResponse<Client> = await api.post('/api/clients', data);
    return response.data;
  },

  async update(id: string, data: Partial<ClientFormData>): Promise<Client> {
    const response: AxiosResponse<Client> = await api.put(`/api/clients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    await api.delete(`/api/clients/${id}`);
    return true;
  },

  async search(query: string): Promise<Client[]> {
    const response: AxiosResponse<Client[]> = await api.get(`/api/clients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default clientApiService;
