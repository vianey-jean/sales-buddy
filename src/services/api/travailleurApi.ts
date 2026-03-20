import api from './api';

export interface Travailleur {
  id: string;
  nom: string;
  prenom: string;
  adresse: string;
  phone: string;
  genre: 'homme' | 'femme';
  role?: 'administrateur' | 'autre';
  createdAt?: string;
}

const travailleurApi = {
  getAll: () => api.get<Travailleur[]>('/api/travailleurs'),
  search: (query: string) => api.get<Travailleur[]>(`/api/travailleurs?search=${encodeURIComponent(query)}`),
  getById: (id: string) => api.get<Travailleur>(`/api/travailleurs/${id}`),
  create: (data: Omit<Travailleur, 'id' | 'createdAt'>) => api.post<Travailleur>('/api/travailleurs', data),
  update: (id: string, data: Partial<Travailleur>) => api.put<Travailleur>(`/api/travailleurs/${id}`, data),
  delete: (id: string) => api.delete(`/api/travailleurs/${id}`),
};

export default travailleurApi;