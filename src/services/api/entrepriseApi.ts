import api from './api';

export interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  typePaiement: 'journalier' | 'horaire';
  prix: number;
  createdAt?: string;
}

const entrepriseApi = {
  getAll: () => api.get<Entreprise[]>('/api/entreprises'),
  getById: (id: string) => api.get<Entreprise>(`/api/entreprises/${id}`),
  create: (data: Omit<Entreprise, 'id' | 'createdAt'>) => api.post<Entreprise>('/api/entreprises', data),
  update: (id: string, data: Partial<Entreprise>) => api.put<Entreprise>(`/api/entreprises/${id}`, data),
  delete: (id: string) => api.delete(`/api/entreprises/${id}`),
};

export default entrepriseApi;
