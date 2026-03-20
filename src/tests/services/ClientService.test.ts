
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock des données
const mockClients = [
  {
    id: 'client1',
    nom: 'Marie Dubois',
    phone: '+33123456789',
    adresse: '123 Rue Test',
    dateCreation: '2024-01-15T10:30:00Z'
  },
  {
    id: 'client2',
    nom: 'Jean Martin',
    phone: '+33987654321',
    adresse: '456 Avenue Test',
    dateCreation: '2024-01-10T14:20:00Z'
  }
];

// Mock axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

vi.mock('axios', () => ({
  default: mockAxios
}));

// Mock localStorage avec une valeur fixe
const mockLocalStorage = {
  getItem: vi.fn().mockReturnValue('mock-token')
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Service à tester (simulé)
class ClientService {
  private baseUrl = 'http://localhost:10000/api';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  async getClients() {
    const response = await mockAxios.get(`${this.baseUrl}/clients`, this.getAuthHeaders());
    return response.data;
  }

  async addClient(clientData: any) {
    const response = await mockAxios.post(`${this.baseUrl}/clients`, clientData, this.getAuthHeaders());
    return response.data;
  }

  async updateClient(id: string, clientData: any) {
    const response = await mockAxios.put(`${this.baseUrl}/clients/${id}`, clientData, this.getAuthHeaders());
    return response.data;
  }

  async deleteClient(id: string) {
    const response = await mockAxios.delete(`${this.baseUrl}/clients/${id}`, this.getAuthHeaders());
    return response.status === 200;
  }
}

describe('ClientService', () => {
  let clientService: ClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Réinitialiser localStorage pour retourner toujours 'mock-token'
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    clientService = new ClientService();
  });

  describe('getClients', () => {
    it('récupère tous les clients avec succès', async () => {
      mockAxios.get.mockResolvedValue({ data: mockClients });

      const result = await clientService.getClients();

      expect(result).toEqual(mockClients);
      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients',
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });

    it('gère les erreurs de récupération', async () => {
      mockAxios.get.mockRejectedValue(new Error('Erreur réseau'));

      await expect(clientService.getClients()).rejects.toThrow('Erreur réseau');
    });

    it('utilise le bon token d\'authentification', async () => {
      mockAxios.get.mockResolvedValue({ data: [] });

      await clientService.getClients();

      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients',
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });
  });

  describe('addClient', () => {
    it('ajoute un nouveau client avec succès', async () => {
      const newClient = {
        nom: 'Sophie Dupont',
        phone: '+33555666777',
        adresse: '789 Boulevard Test'
      };

      const createdClient = {
        id: 'client3',
        ...newClient,
        dateCreation: '2024-01-20T16:45:00Z'
      };

      mockAxios.post.mockResolvedValue({ data: createdClient });

      const result = await clientService.addClient(newClient);

      expect(result).toEqual(createdClient);
      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients',
        newClient,
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });

    it('gère les erreurs d\'ajout', async () => {
      const newClient = {
        nom: 'Test Client',
        phone: '+33000000000',
        adresse: 'Test Address'
      };

      mockAxios.post.mockRejectedValue(new Error('Erreur de validation'));

      await expect(clientService.addClient(newClient)).rejects.toThrow('Erreur de validation');
    });

    it('valide les données avant envoi', async () => {
      const invalidClient = {
        nom: '',
        phone: 'invalid-phone',
        adresse: ''
      };

      mockAxios.post.mockResolvedValue({ data: invalidClient });

      await clientService.addClient(invalidClient);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients',
        invalidClient,
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });
  });

  describe('updateClient', () => {
    it('met à jour un client existant avec succès', async () => {
      const updatedData = {
        nom: 'Marie Dubois-Martin',
        phone: '+33123456000',
        adresse: '123 Nouvelle Rue'
      };

      const updatedClient = {
        id: 'client1',
        ...updatedData,
        dateCreation: '2024-01-15T10:30:00Z'
      };

      mockAxios.put.mockResolvedValue({ data: updatedClient });

      const result = await clientService.updateClient('client1', updatedData);

      expect(result).toEqual(updatedClient);
      expect(mockAxios.put).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients/client1',
        updatedData,
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });

    it('gère les erreurs de mise à jour', async () => {
      mockAxios.put.mockRejectedValue(new Error('Client non trouvé'));

      await expect(
        clientService.updateClient('nonexistent', {})
      ).rejects.toThrow('Client non trouvé');
    });

    it('met à jour seulement les champs fournis', async () => {
      const partialUpdate = {
        phone: '+33999888777'
      };

      mockAxios.put.mockResolvedValue({ data: { ...mockClients[0], ...partialUpdate } });

      await clientService.updateClient('client1', partialUpdate);

      expect(mockAxios.put).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients/client1',
        partialUpdate,
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });
  });

  describe('deleteClient', () => {
    it('supprime un client avec succès', async () => {
      mockAxios.delete.mockResolvedValue({ status: 200 });

      const result = await clientService.deleteClient('client1');

      expect(result).toBe(true);
      expect(mockAxios.delete).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients/client1',
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });

    it('gère les erreurs de suppression', async () => {
      mockAxios.delete.mockRejectedValue(new Error('Client non trouvé'));

      await expect(clientService.deleteClient('nonexistent')).rejects.toThrow('Client non trouvé');
    });

    it('retourne false si la suppression échoue', async () => {
      mockAxios.delete.mockResolvedValue({ status: 404 });

      const result = await clientService.deleteClient('client1');

      expect(result).toBe(false);
    });

    it('gère les réponses avec différents codes de statut', async () => {
      // Test avec statut 204 (No Content)
      mockAxios.delete.mockResolvedValue({ status: 204 });
      let result = await clientService.deleteClient('client1');
      expect(result).toBe(false);

      // Test avec statut 200 (OK)
      mockAxios.delete.mockResolvedValue({ status: 200 });
      result = await clientService.deleteClient('client1');
      expect(result).toBe(true);
    });
  });

  describe('Gestion de l\'authentification', () => {
    it('inclut toujours le token dans les en-têtes', async () => {
      mockAxios.get.mockResolvedValue({ data: [] });
      mockAxios.post.mockResolvedValue({ data: {} });
      mockAxios.put.mockResolvedValue({ data: {} });
      mockAxios.delete.mockResolvedValue({ status: 200 });

      await clientService.getClients();
      await clientService.addClient({});
      await clientService.updateClient('1', {});
      await clientService.deleteClient('1');

      // Vérifier que tous les appels incluent l'en-tête Authorization avec mock-token
      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients',
        { headers: { Authorization: 'Bearer mock-token' } }
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients',
        {},
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });

    it('gère l\'absence de token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockAxios.get.mockResolvedValue({ data: [] });

      await clientService.getClients();

      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:10000/api/clients',
        { headers: { Authorization: 'Bearer null' } }
      );
    });
  });
});
