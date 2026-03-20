import api from '../../service/api';

export interface Indisponibilite {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  journeeComplete: boolean;
  motif: string;
  createdAt: string;
}

export interface DisponibiliteCheck {
  disponible: boolean;
  indisponibilites: Indisponibilite[];
}

const indisponibleApi = {
  async getAll(): Promise<Indisponibilite[]> {
    const response = await api.get('/api/indisponible');
    return response.data;
  },

  async create(data: { date: string; heureDebut?: string; heureFin?: string; motif?: string; journeeComplete?: boolean }): Promise<Indisponibilite> {
    const response = await api.post('/api/indisponible', data);
    return response.data;
  },

  async update(id: string, data: { date?: string; heureDebut?: string; heureFin?: string; motif?: string; journeeComplete?: boolean }): Promise<Indisponibilite> {
    const response = await api.put(`/api/indisponible/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/indisponible/${id}`);
  },

  async checkDisponibilite(date: string, heureDebut?: string, heureFin?: string): Promise<DisponibiliteCheck> {
    const response = await api.post('/api/indisponible/check', { date, heureDebut, heureFin });
    return response.data;
  }
};

export default indisponibleApi;
