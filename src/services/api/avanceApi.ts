import api from './api';

export interface Avance {
  id: string;
  travailleurId: string;
  travailleurNom: string;
  entrepriseId: string;
  entrepriseNom: string;
  montant: number;
  totalPointage: number;
  resteApresAvance: number;
  date: string;
  mois: number;
  annee: number;
  createdAt: string;
}

const avanceApi = {
  getAll: () => api.get<Avance[]>('/api/avances'),
  getByTravailleur: (travailleurId: string, month: number, year: number) =>
    api.get<Avance[]>(`/api/avances?travailleurId=${travailleurId}&month=${month}&year=${year}`),
  create: (data: Partial<Avance>) => api.post<Avance>('/api/avances', data),
  delete: (id: string) => api.delete(`/api/avances/${id}`),
};

export default avanceApi;
