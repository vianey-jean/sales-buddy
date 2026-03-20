// Types pour les clients

export interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
  dateCreation: string;
}

export interface ClientFormData {
  nom: string;
  phone: string;
  adresse: string;
}

export interface ClientSearchResult {
  clients: Client[];
  total: number;
}
