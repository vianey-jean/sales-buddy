// Types pour les commandes

export interface CommandeProduit {
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixVente: number;
}

export type CommandeType = 'commande' | 'reservation';
export type CommandeStatut = 'en_attente' | 'en_route' | 'arrive' | 'valide' | 'annule' | 'reporter';

export interface Commande {
  id: string;
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: CommandeType;
  produits: CommandeProduit[];
  dateCommande: string;
  dateArrivagePrevue?: string;
  dateEcheance?: string;
  horaire?: string;
  statut: CommandeStatut;
  notificationEnvoyee?: boolean;
  createdAt?: string;
  updatedAt?: string;
  saleId?: string;
}

export interface CommandeFormData {
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: CommandeType;
  produits: CommandeProduit[];
  dateArrivagePrevue?: string;
  dateEcheance?: string;
  horaire?: string;
}
