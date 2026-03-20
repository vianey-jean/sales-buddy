import api from './api';

export interface ObjectifData {
  objectif: number;
  totalVentesMois: number;
  mois: number;
  annee: number;
}

export interface MonthlyData {
  mois: number;
  annee: number;
  totalVentesMois: number;
  objectif: number;
  pourcentage: number;
}

export interface ObjectifChange {
  date: string;
  ancienObjectif: number;
  nouveauObjectif: number;
  mois: number;
  annee: number;
}

export interface BeneficeMensuel {
  mois: number;
  annee: number;
  totalBenefice: number;
  updatedAt: string;
}

export interface ObjectifHistorique {
  currentData: ObjectifData;
  historique: MonthlyData[];
  objectifChanges: ObjectifChange[];
  beneficesHistorique: BeneficeMensuel[];
  annee: number;
}

export const objectifApi = {
  get: async (): Promise<ObjectifData> => {
    const response = await api.get('/api/objectif');
    return response.data;
  },
  
  updateObjectif: async (objectif: number): Promise<ObjectifData> => {
    const response = await api.put('/api/objectif/objectif', { objectif });
    return response.data;
  },
  
  recalculate: async (): Promise<ObjectifData> => {
    const response = await api.post('/api/objectif/recalculate');
    return response.data;
  },

  getHistorique: async (): Promise<ObjectifHistorique> => {
    const response = await api.get('/api/objectif/historique');
    return response.data;
  },

  saveMonthlyData: async (): Promise<ObjectifHistorique> => {
    const response = await api.post('/api/objectif/save-monthly');
    return response.data;
  }
};

export default objectifApi;
