/**
 * Service API pour les fournisseurs
 * 
 * Permet la recherche, la création et la récupération des fournisseurs.
 */

import api from './api';

export interface Fournisseur {
  id: string;
  nom: string;
  dateCreation: string;
}

export const fournisseurApiService = {
  /** Récupérer tous les fournisseurs */
  async getAll(): Promise<Fournisseur[]> {
    const response = await api.get('/api/fournisseurs');
    return response.data;
  },

  /** Rechercher des fournisseurs par nom */
  async search(query: string): Promise<Fournisseur[]> {
    const response = await api.get(`/api/fournisseurs/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /** Créer un fournisseur (s'il n'existe pas déjà) */
  async create(nom: string): Promise<Fournisseur> {
    const response = await api.post('/api/fournisseurs', { nom });
    return response.data;
  },

  /** Supprimer un fournisseur */
  async delete(id: string): Promise<boolean> {
    await api.delete(`/api/fournisseurs/${id}`);
    return true;
  }
};

export default fournisseurApiService;