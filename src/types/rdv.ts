// Types pour les rendez-vous
export interface RDV {
  id: string;
  titre: string;
  description?: string;
  clientNom: string;
  clientTelephone?: string;
  clientAdresse?: string;
  date: string; // Format: YYYY-MM-DD
  heureDebut: string; // Format: HH:mm
  heureFin: string; // Format: HH:mm
  lieu?: string;
  statut: 'planifie' | 'confirme' | 'annule' | 'termine' | 'reporte';
  // Informations produit (si créé depuis une réservation)
  produits?: RDVProduit[];
  // Lien avec la commande/réservation
  commandeId?: string;
  // Notifications
  notificationEnvoyee?: boolean;
  rappelEnvoye?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RDVProduit {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  prixVente: number;
}

export type RDVFormData = Omit<RDV, 'id' | 'createdAt' | 'updatedAt'> & {
  notes?: string;
};

export interface RDVConflict {
  rdv: RDV;
  message: string;
}

// Type pour créer un RDV depuis une réservation
export interface RDVFromReservation {
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  date: string;
  horaire: string;
  produits: RDVProduit[];
  commandeId: string;
}
