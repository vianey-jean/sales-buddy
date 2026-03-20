import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { Product, Sale, User, LoginCredentials, RegisterCredentials, PretFamille, PretProduit, DepenseFixe, DepenseDuMois } from '@/types';

// Configuration de l'URL de base
const getBaseURL = () => {
  return import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
};

// OPTIMIZED: Create axios instance with faster timeouts
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000, // Reduced from 30s to 15s for faster failure detection
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

  // OPTIMIZED: Faster retry logic
  axiosRetry(instance, {
    retries: 2,
    retryDelay: (retryCount) => Math.min(Math.pow(2, retryCount) * 500, 2000), // Faster retry delays
    retryCondition: (error) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
             (error.response?.status === 503);
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
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
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.code !== 'ERR_NETWORK') {
        console.error('API Error:', error);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

// Auth API with database verification
export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string }> = await api.post('/api/auth/login', credentials);
    const data = response.data;
    
    // Store user and token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string }> = await api.post('/api/auth/register', credentials);
    const data = response.data;
    
    // Store user and token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const response: AxiosResponse<{ exists: boolean }> = await api.post('/api/auth/check-email', { email });
    return response.data;
  },

  async resetPassword(data: { email: string; newPassword: string; confirmPassword: string; token?: string }): Promise<{ success: boolean }> {
    const response: AxiosResponse<{ success: boolean }> = await api.post('/api/auth/reset-password', data);
    return response.data;
  },

  // CRITICAL: Verify token against database
  async verifyToken(): Promise<{ user: User; valid: boolean }> {
    const response: AxiosResponse<{ user: User; valid: boolean }> = await api.get('/api/auth/verify');
    return response.data;
  },

  // Fast health check
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    const response: AxiosResponse<{ status: string; timestamp: number }> = await api.get('/api/auth/health');
    return response.data;
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },

  resetPasswordRequest: async (data: { email: string }): Promise<{ exists: boolean; token?: string }> => {
    try {
      const response = await api.post('/api/auth/reset-password-request', data);
      return { exists: response.data.exists || response.data.success, token: response.data.token };
    } catch (error) {
      return { exists: false };
    }
  },
};

// Products API
export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      console.log('📦 Fetching products from API...');
      const response: AxiosResponse<Product[]> = await api.get('/api/products');
      console.log(`✅ Retrieved ${response.data.length} products from API`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      console.log('📝 Adding new product:', product);
      const response: AxiosResponse<Product> = await api.post('/api/products', product);
      console.log('✅ Product added successfully with code:', response.data.code, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      throw error;
    }
  },

  async updateProduct(product: Product): Promise<Product> {
    try {
      console.log('📝 Updating product:', product);
      const response: AxiosResponse<Product> = await api.put(`/api/products/${product.id}`, product);
      console.log('✅ Product updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting product with ID:', id);
      await api.delete(`/api/products/${id}`);
      console.log('✅ Product deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  },

  // Upload photos for a product (up to 6)
  async uploadProductPhotos(productId: string, photos: File[], mainPhotoIndex: number): Promise<Product> {
    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
      formData.append('mainPhotoIndex', mainPhotoIndex.toString());
      
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
      const response = await fetch(`${baseURL}/api/products/${productId}/photos`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    } catch (error) {
      console.error('❌ Error uploading product photos:', error);
      throw error;
    }
  },

  // Replace all photos for a product
  async replaceProductPhotos(productId: string, newPhotos: File[], existingPhotoUrls: string[], mainPhotoIndex: number): Promise<Product> {
    try {
      const formData = new FormData();
      newPhotos.forEach((photo) => {
        formData.append('photos', photo);
      });
      formData.append('photosJson', JSON.stringify(existingPhotoUrls));
      formData.append('mainPhotoIndex', mainPhotoIndex.toString());
      
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
      const response = await fetch(`${baseURL}/api/products/${productId}/photos`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    } catch (error) {
      console.error('❌ Error replacing product photos:', error);
      throw error;
    }
  },

  // Générer les codes pour les produits existants qui n'en ont pas
  async generateCodesForExistingProducts(): Promise<{ message: string; updatedCount: number }> {
    try {
      console.log('🔧 Generating codes for existing products...');
      const response = await api.post('/api/products/generate-codes');
      console.log('✅ Codes generated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error generating codes:', error);
      throw error;
    }
  },
};

// Sales API
export const salesService = {
  async getSales(month?: number, year?: number): Promise<Sale[]> {
    let url = '/api/sales';
    if (month !== undefined && year !== undefined) {
      url += `/by-month?month=${month}&year=${year}`;
    }
    const response: AxiosResponse<Sale[]> = await api.get(url);
    return response.data;
  },

  // Nouvelle méthode pour récupérer TOUTES les ventes historiques
  async getAllSales(): Promise<Sale[]> {
    const response: AxiosResponse<Sale[]> = await api.get('/api/sales');
    return response.data;
  },

  async addSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
    const response: AxiosResponse<Sale> = await api.post('/api/sales', sale);
    return response.data;
  },

  async updateSale(sale: Sale): Promise<Sale> {
    const response: AxiosResponse<Sale> = await api.put(`/api/sales/${sale.id}`, sale);
    return response.data;
  },

  async deleteSale(id: string): Promise<boolean> {
    await api.delete(`/api/sales/${id}`);
    return true;
  },

  async exportMonth(month: number, year: number): Promise<boolean> {
    await api.post('/api/sales/export-month', { month, year });
    return true;
  },
};

// Depense Service
export const depenseService = {
  async getMouvements(): Promise<DepenseDuMois[]> {
    const response: AxiosResponse<DepenseDuMois[]> = await api.get('/api/depenses/mouvements');
    return response.data;
  },

  async addMouvement(mouvement: Omit<DepenseDuMois, 'id'>): Promise<DepenseDuMois> {
    const response: AxiosResponse<DepenseDuMois> = await api.post('/api/depenses/mouvements', mouvement);
    return response.data;
  },

  async updateMouvement(id: string, mouvement: Partial<DepenseDuMois>): Promise<DepenseDuMois> {
    const response: AxiosResponse<DepenseDuMois> = await api.put(`/api/depenses/mouvements/${id}`, mouvement);
    return response.data;
  },

  async deleteMouvement(id: string): Promise<boolean> {
    await api.delete(`/api/depenses/mouvements/${id}`);
    return true;
  },

  async getDepensesFixe(): Promise<DepenseFixe> {
    const response: AxiosResponse<DepenseFixe> = await api.get('/api/depenses/fixe');
    return response.data;
  },

  async updateDepensesFixe(depensesFixe: Partial<DepenseFixe>): Promise<DepenseFixe> {
    const response: AxiosResponse<DepenseFixe> = await api.put('/api/depenses/fixe', depensesFixe);
    return response.data;
  },

  async resetMouvements(): Promise<boolean> {
    await api.post('/api/depenses/reset');
    return true;
  },
};

// PretFamille Service
export const pretFamilleService = {
  async getPretFamilles(): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await api.get('/api/pretfamilles');
    return response.data;
  },

  async addPretFamille(pret: Omit<PretFamille, 'id'>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.post('/api/pretfamilles', pret);
    return response.data;
  },

  async updatePretFamille(id: string, pret: Partial<PretFamille>): Promise<PretFamille> {
    const response: AxiosResponse<PretFamille> = await api.put(`/api/pretfamilles/${id}`, pret);
    return response.data;
  },

  async deletePretFamille(id: string): Promise<boolean> {
    await api.delete(`/api/pretfamilles/${id}`);
    return true;
  },

  async searchByName(name: string): Promise<PretFamille[]> {
    const response: AxiosResponse<PretFamille[]> = await api.get(`/api/pretfamilles/search/nom?q=${encodeURIComponent(name)}`);
    return response.data;
  },
};

// PretProduit Service
export const pretProduitService = {
  async getPretProduits(): Promise<PretProduit[]> {
    const response: AxiosResponse<PretProduit[]> = await api.get('/api/pretproduits');
    return response.data;
  },

  async addPretProduit(pret: Omit<PretProduit, 'id'>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.post('/api/pretproduits', pret);
    return response.data;
  },

  async updatePretProduit(id: string, pret: Partial<PretProduit>): Promise<PretProduit> {
    const response: AxiosResponse<PretProduit> = await api.put(`/api/pretproduits/${id}`, pret);
    return response.data;
  },

  async deletePretProduit(id: string): Promise<boolean> {
    await api.delete(`/api/pretproduits/${id}`);
    return true;
  },

  async transferPrets(fromName: string, toName: string, pretIds: string[]): Promise<{ message: string; transferred: number }> {
    const response: AxiosResponse<{ message: string; transferred: number }> = await api.post('/api/pretproduits/transfer', {
      fromName,
      toName,
      pretIds
    });
    return response.data;
  },
};

// Benefice Service
export const beneficeService = {
  async getBenefices(): Promise<any[]> {
    try {
      console.log('📊 Fetching benefices from API...');
      const response = await api.get('/api/benefices');
      console.log(`✅ Retrieved ${response.data.length} benefices from API`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching benefices:', error);
      throw error;
    }
  },

  async getBeneficeByProductId(productId: string): Promise<any> {
    try {
      const response = await api.get(`/api/benefices/product/${productId}`);
      return response.data;
    } catch (error) {
      console.log('Aucune donnée de bénéfice existante pour ce produit');
      return null;
    }
  },

  async createBenefice(beneficeData: any): Promise<any> {
    try {
      console.log('📝 Adding new benefice:', beneficeData);
      const response = await api.post('/api/benefices', beneficeData);
      console.log('✅ Benefice added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding benefice:', error);
      throw error;
    }
  },

  async updateBenefice(id: string, beneficeData: any): Promise<any> {
    try {
      console.log('📝 Updating benefice:', beneficeData);
      const response = await api.put(`/api/benefices/${id}`, beneficeData);
      console.log('✅ Benefice updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating benefice:', error);
      throw error;
    }
  },

  async deleteBenefice(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting benefice with ID:', id);
      await api.delete(`/api/benefices/${id}`);
      console.log('✅ Benefice deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting benefice:', error);
      throw error;
    }
  },
};

// Marketing Service
export const marketingService = {
  async generateDescription(productData: {
    productDescription: string;
    purchasePrice?: number;
    sellingPrice?: number;
    quantity?: number;
  }): Promise<{ success: boolean; description?: string; error?: string }> {
    const response: AxiosResponse<{ success: boolean; description?: string; error?: string }> = await api.post('/api/marketing/generate-description', productData);
    return response.data;
  }
};

// Commandes Service
export const commandeService = {
  async getCommandes(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await api.get('/api/commandes');
    return response.data;
  },

  async getCommandeById(id: string): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/api/commandes/${id}`);
    return response.data;
  },

  async createCommande(commande: any): Promise<any> {
    const response: AxiosResponse<any> = await api.post('/api/commandes', commande);
    return response.data;
  },

  async updateCommande(id: string, commande: any): Promise<any> {
    const response: AxiosResponse<any> = await api.put(`/api/commandes/${id}`, commande);
    return response.data;
  },

  async deleteCommande(id: string): Promise<boolean> {
    await api.delete(`/api/commandes/${id}`);
    return true;
  },
};

// Clients Service
export const clientService = {
  async getClients(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await api.get('/api/clients');
    return response.data;
  },

  async getClientById(id: string): Promise<any> {
    const response: AxiosResponse<any> = await api.get(`/api/clients/${id}`);
    return response.data;
  },

  async createClient(client: any): Promise<any> {
    const response: AxiosResponse<any> = await api.post('/api/clients', client);
    return response.data;
  },

  async updateClient(id: string, client: any): Promise<any> {
    const response: AxiosResponse<any> = await api.put(`/api/clients/${id}`, client);
    return response.data;
  },

  async deleteClient(id: string): Promise<boolean> {
    await api.delete(`/api/clients/${id}`);
    return true;
  },
};

// Export the api instance for direct use if needed
export { api };
export default api;
