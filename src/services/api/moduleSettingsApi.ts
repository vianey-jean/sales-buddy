import api from '../../service/api';

export interface ModuleSettings {
  commandes: {
    autoCreateRdv: boolean;
    autoCreateTache: boolean;
    defaultStatut: string;
    notifierClient: boolean;
  };
  pointage: {
    defaultTypePaiement: string;
    defaultPrixHeure: number;
    defaultPrixJournalier: number;
    arrondiHeures: boolean;
  };
  taches: {
    defaultImportance: string;
    autoCompleteOnDone: boolean;
    showCompletedTasks: boolean;
  };
  notes: {
    defaultColor: string;
    autoSave: boolean;
    showTimestamp: boolean;
  };
}

const moduleSettingsApi = {
  async getAll(): Promise<ModuleSettings> {
    const response = await api.get('/api/module-settings');
    return response.data;
  },

  async getModule(module: string): Promise<any> {
    const response = await api.get(`/api/module-settings/${module}`);
    return response.data;
  },

  async updateModule(module: string, data: any): Promise<{ success: boolean; settings: any }> {
    const response = await api.put(`/api/module-settings/${module}`, data);
    return response.data;
  }
};

export default moduleSettingsApi;
