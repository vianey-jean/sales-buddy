
import axios, { AxiosResponse } from 'axios';

interface BeneficeData {
  id?: string;
  productId: string;
  productDescription: string;
  prixAchat: number;
  taxeDouane: number;
  tva: number;
  autresFrais: number;
  coutTotal: number;
  margeDesire: number;
  prixVenteRecommande: number;
  beneficeNet: number;
  tauxMarge: number;
  createdAt?: string;
  updatedAt?: string;
}

const getBaseURL = () => {
  // Utiliser toujours l'URL de production pour éviter les problèmes CORS
  return import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Désactiver les credentials pour éviter les problèmes CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas logger les erreurs répétitives pour éviter le spam console
    if (error.response?.status !== 401) {
      console.error('Benefice API Error:', error);
    }
    return Promise.reject(error);
  }
);

export const beneficeService = {
  async getBenefices(): Promise<BeneficeData[]> {
    try {
      const response: AxiosResponse<BeneficeData[]> = await api.get('/api/benefices');
      return response.data;
    } catch (error) {
      // Retourner un tableau vide silencieusement pour éviter le spam
      return [];
    }
  },

  async getBeneficeByProductId(productId: string): Promise<BeneficeData | null> {
    try {
      const response: AxiosResponse<BeneficeData> = await api.get(`/api/benefices/product/${productId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async createBenefice(beneficeData: Omit<BeneficeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<BeneficeData> {
    const response: AxiosResponse<BeneficeData> = await api.post('/api/benefices', beneficeData);
    return response.data;
  },

  async updateBenefice(id: string, beneficeData: Partial<BeneficeData>): Promise<BeneficeData> {
    const response: AxiosResponse<BeneficeData> = await api.put(`/api/benefices/${id}`, beneficeData);
    return response.data;
  },

  async deleteBenefice(id: string): Promise<boolean> {
    await api.delete(`/api/benefices/${id}`);
    return true;
  }
};
