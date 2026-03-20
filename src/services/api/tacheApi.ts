import api from './api';

export interface Tache {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  description: string;
  importance: 'pertinent' | 'optionnel';
  travailleurId: string;
  travailleurNom: string;
  completed?: boolean;
  parentId?: string;
  commandeId?: string;
  createdAt?: string;
}

const tacheApi = {
  getAll: () => api.get<Tache[]>('/api/taches'),
  getByDate: (date: string) => api.get<Tache[]>(`/api/taches?date=${date}`),
  getByMonth: (year: number, month: number) => api.get<Tache[]>(`/api/taches?year=${year}&month=${month}`),
  getByWeek: (startDate: string, endDate: string) => api.get<Tache[]>(`/api/taches?startDate=${startDate}&endDate=${endDate}`),
  getById: (id: string) => api.get<Tache>(`/api/taches/${id}`),
  create: (data: Omit<Tache, 'id' | 'createdAt'>) => api.post<Tache>('/api/taches', data),
  update: (id: string, data: Partial<Tache>) => api.put<Tache>(`/api/taches/${id}`, data),
  delete: (id: string) => api.delete(`/api/taches/${id}`),
};

export default tacheApi;