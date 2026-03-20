import api from './api';
import { getBaseURL } from './api';

export interface ShareLink {
  id: string;
  token: string;
  accessCode: string;
  type: 'notes' | 'pointage' | 'taches';
  createdAt: string;
}

const shareLinksApi = {
  generate: (type: 'notes' | 'pointage' | 'taches') =>
    api.post<{ token: string; accessCode: string; type: string; createdAt: string }>('/api/share-links/generate', { type }),

  list: (type?: string) =>
    api.get<ShareLink[]>(`/api/share-links/list${type ? `?type=${type}` : ''}`),

  revoke: (id: string) =>
    api.delete(`/api/share-links/revoke/${id}`),

  // Public (no auth)
  verify: async (token: string, accessCode: string) => {
    const base = getBaseURL();
    const res = await fetch(`${base}/api/share-links/verify/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erreur de vérification');
    }
    return res.json();
  },

  // Public (no auth)
  viewData: async (token: string) => {
    const base = getBaseURL();
    const res = await fetch(`${base}/api/share-links/view/${token}`);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Accès refusé');
    }
    return res.json();
  },
};

export default shareLinksApi;
