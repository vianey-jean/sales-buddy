import api from '../../service/api';

export interface PrixPointage {
  prixHeure: number;
  prixJournalier: number;
}

export interface ParametreTache {
  autoCompleteOnDone: boolean;
  tachesTerminees: boolean;
}

const parametresApi = {
  async getPrixPointage(): Promise<PrixPointage> {
    const response = await api.get('/api/parametres/prixpointage');
    return response.data;
  },

  async updatePrixPointage(data: Partial<PrixPointage>): Promise<PrixPointage> {
    const response = await api.put('/api/parametres/prixpointage', data);
    return response.data;
  },

  async getParametreTache(): Promise<ParametreTache> {
    const response = await api.get('/api/parametres/parametretache');
    return response.data;
  },

  async updateParametreTache(data: Partial<ParametreTache>): Promise<ParametreTache> {
    const response = await api.put('/api/parametres/parametretache', data);
    return response.data;
  },
};

export default parametresApi;
