import api from './api';

export interface RdvNotification {
  id: string;
  rdvId: string;
  rdvTitre: string;
  rdvClientNom: string;
  rdvClientTelephone: string;
  rdvDate: string;
  rdvHeureDebut: string;
  rdvHeureFin: string;
  rdvLieu: string;
  message: string;
  read: boolean;
  statut: 'actif' | 'reporte' | 'valide' | 'annule';
  createdAt: string;
  updatedAt?: string;
}

export const rdvNotificationsApi = {
  // Récupérer toutes les notifications
  async getAll(): Promise<RdvNotification[]> {
    const response = await api.get('/api/rdv-notifications');
    return response.data;
  },

  // Récupérer les notifications non lues
  async getUnread(): Promise<RdvNotification[]> {
    const response = await api.get('/api/rdv-notifications/unread');
    return response.data;
  },

  // Récupérer le nombre de notifications non lues
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/api/rdv-notifications/count');
    return response.data.count;
  },

  // Vérifier et créer les notifications pour les RDV dans 24h
  async checkAndCreate(): Promise<{ created: number; notifications: RdvNotification[] }> {
    const response = await api.post('/api/rdv-notifications/check');
    return response.data;
  },

  // Marquer comme lu
  async markAsRead(id: string): Promise<boolean> {
    const response = await api.put(`/api/rdv-notifications/${id}/read`);
    return response.data.success;
  },

  // Supprimer une notification
  async delete(id: string): Promise<boolean> {
    const response = await api.delete(`/api/rdv-notifications/${id}`);
    return response.data.success;
  },

  // Récupérer notification par rdv ID
  async getByRdvId(rdvId: string): Promise<RdvNotification | null> {
    try {
      const response = await api.get(`/api/rdv-notifications/by-rdv/${rdvId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Mettre à jour le statut de la notification (validation/annulation/report)
  async updateStatus(rdvId: string, status: string): Promise<boolean> {
    try {
      const response = await api.put(`/api/rdv-notifications/status/${rdvId}`, { status });
      return response.data.success;
    } catch {
      return false;
    }
  },

  // Mettre à jour la notification par rdv ID (pour report)
  async updateByRdvId(rdvId: string, data: Partial<RdvNotification>): Promise<RdvNotification | null> {
    try {
      const response = await api.put(`/api/rdv-notifications/by-rdv/${rdvId}`, data);
      return response.data;
    } catch {
      return null;
    }
  },

  // Supprimer notification par rdv ID
  async deleteByRdvId(rdvId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/api/rdv-notifications/by-rdv/${rdvId}`);
      return response.data.success;
    } catch {
      return false;
    }
  }
};

export default rdvNotificationsApi;
