import api from './api';

export interface PointageEntry {
  id: string;
  date: string;
  entrepriseId: string;
  entrepriseNom: string;
  typePaiement: 'journalier' | 'horaire';
  heures: number;
  prixJournalier: number;
  prixHeure: number;
  montantTotal: number;
  travailleurId?: string;
  travailleurNom?: string;
  createdAt?: string;
}

const pointageApi = {
  getAll: () => api.get<PointageEntry[]>('/api/pointages'),
  getByMonth: (year: number, month: number) => api.get<PointageEntry[]>(`/api/pointages?year=${year}&month=${month}`),
  getByYear: (year: number) => api.get<PointageEntry[]>(`/api/pointages?year=${year}`),
  getByDate: (date: string) => api.get<PointageEntry[]>(`/api/pointages?date=${date}`),
  getById: (id: string) => api.get<PointageEntry>(`/api/pointages/${id}`),
  create: (data: Omit<PointageEntry, 'id' | 'createdAt'>) => api.post<PointageEntry>('/api/pointages', data),
  update: (id: string, data: Partial<PointageEntry>) => api.put<PointageEntry>(`/api/pointages/${id}`, data),
  delete: (id: string) => api.delete(`/api/pointages/${id}`),
};

export default pointageApi;
