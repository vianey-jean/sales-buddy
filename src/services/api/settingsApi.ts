import api from '../../service/api';

export interface AppSettings {
  siteName: string;
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  notifications: {
    rdvReminder: boolean;
    rdvReminderMinutes: number;
    tacheReminder: boolean;
    emailNotifications: boolean;
    soundEnabled: boolean;
  };
  display: {
    itemsPerPage: number;
    theme: string;
    compactMode: boolean;
    showWelcomeMessage: boolean;
  };
  security: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    requireStrongPassword: boolean;
  };
  backup: {
    lastBackupDate: string | null;
    autoBackup: boolean;
    autoBackupIntervalDays: number;
  };
}

const settingsApi = {
  async getSettings(): Promise<{ settings: AppSettings; isAdmin: boolean }> {
    const response = await api.get('/api/settings');
    return response.data;
  },

  async updateSettings(data: Partial<AppSettings>): Promise<{ success: boolean; settings: AppSettings }> {
    const response = await api.put('/api/settings', data);
    return response.data;
  },

  async backupData(encryptionCode: string): Promise<{ success: boolean; backup: any; filename: string }> {
    const response = await api.post('/api/settings/backup', { encryptionCode });
    return response.data;
  },

  async restoreData(encryptedData: any, decryptionCode: string): Promise<{ success: boolean; message: string; status?: 'updated' | 'unchanged'; updatedFilesCount?: number; unchangedFilesCount?: number; totalAddedEntries?: number }> {
    const response = await api.post('/api/settings/restore', { encryptedData, decryptionCode });
    return response.data;
  },

  async deleteAllData(password: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/api/settings/delete-all', { password });
    return response.data;
  },

  async verifyPassword(password: string): Promise<{ valid: boolean }> {
    const response = await api.post('/api/settings/verify-password', { password });
    return response.data;
  }
};

export default settingsApi;
