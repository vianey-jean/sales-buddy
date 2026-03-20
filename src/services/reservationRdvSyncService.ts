/**
 * =============================================================================
 * Service de synchronisation entre Réservation et Rendez-vous
 * =============================================================================
 * 
 * Ce service gère la synchronisation automatique des statuts entre les réservations
 * (commandes de type 'reservation') et les rendez-vous associés.
 * 
 * FONCTIONNALITÉS PRINCIPALES:
 * - Synchronisation unidirectionnelle : Réservation → Rendez-vous
 * - Mapping automatique des statuts entre les deux entités
 * - Fiabilité après rafraîchissement ou navigation
 * 
 * MAPPING DES STATUTS:
 * - en_attente (réservation) → planifie (RDV)
 * - en_route (réservation) → confirme (RDV)
 * - arrive (réservation) → confirme (RDV)
 * - valide (réservation) → termine (RDV)
 * - annule (réservation) → annule (RDV)
 * - reporter (réservation) → reporte (RDV)
 * 
 * DÉPENDANCES:
 * - api: Service API principal pour les appels HTTP
 * - Types: Commande, CommandeStatut depuis @/types/commande
 * 
 * @module reservationRdvSyncService
 * @author Système de gestion des ventes
 * @version 1.0.0
 */

import api from '@/service/api';
import { Commande, CommandeStatut } from '@/types/commande';

/**
 * Type pour les statuts de rendez-vous
 * Correspond aux valeurs possibles du champ 'statut' dans RDV
 */
type RdvStatut = 'planifie' | 'confirme' | 'annule' | 'termine' | 'reporte';

/**
 * Mapping des statuts de réservation vers les statuts de RDV
 * Cette table de correspondance assure une synchronisation cohérente
 */
const STATUS_MAPPING: Record<CommandeStatut, RdvStatut> = {
  'en_attente': 'planifie',    // Réservation en attente → RDV planifié
  'en_route': 'confirme',       // Réservation en route → RDV confirmé
  'arrive': 'confirme',         // Réservation arrivée → RDV confirmé
  'valide': 'termine',          // Réservation validée → RDV terminé
  'annule': 'annule',           // Réservation annulée → RDV annulé
  'reporter': 'reporte',        // Réservation reportée → RDV reporté
};

/**
 * Service de synchronisation Réservation ↔ Rendez-vous
 * 
 * Permet de synchroniser automatiquement le statut d'un RDV
 * lorsque le statut de la réservation associée change.
 */
export const reservationRdvSyncService = {
  /**
   * Convertit un statut de réservation en statut de RDV
   * 
   * @param commandeStatut - Statut de la réservation/commande
   * @returns Statut correspondant pour le RDV
   * 
   * @example
   * const rdvStatut = mapStatusToRdv('valide'); // Retourne 'termine'
   */
  mapStatusToRdv(commandeStatut: CommandeStatut): RdvStatut {
    return STATUS_MAPPING[commandeStatut] || 'planifie';
  },

  /**
   * Synchronise le statut du RDV avec celui de la réservation
   * 
   * Cette fonction est appelée automatiquement lors de chaque changement
   * de statut d'une réservation. Elle met à jour le RDV associé via
   * l'API backend.
   * 
   * @param commandeId - ID de la réservation/commande
   * @param newStatus - Nouveau statut de la réservation
   * @returns Promise<boolean> - true si la synchronisation a réussi
   * 
   * @example
   * await syncRdvStatus('123', 'valide');
   * // Le RDV associé passe au statut 'termine'
   */
  async syncRdvStatus(commandeId: string, newStatus: CommandeStatut): Promise<boolean> {
    try {
      // Mapper le statut de réservation vers le statut RDV
      const rdvStatut = this.mapStatusToRdv(newStatus);
      
      // Appeler l'API pour mettre à jour le RDV lié à cette commande
      await api.put(`/api/rdv/by-commande/${commandeId}`, {
        statut: rdvStatut
      });
      
      console.log(`✅ Sync RDV: Commande ${commandeId} → Statut ${rdvStatut}`);
      return true;
    } catch (error: any) {
      // Si le RDV n'existe pas (404), ce n'est pas une erreur critique
      if (error?.response?.status === 404) {
        console.log(`ℹ️ Aucun RDV trouvé pour la commande ${commandeId}`);
        return false;
      }
      
      console.error('❌ Erreur synchronisation RDV:', error);
      return false;
    }
  },

  /**
   * Synchronise le statut et les données du RDV lors d'un report
   * 
   * Lors du report d'une réservation, cette fonction met à jour
   * à la fois le statut et les dates/horaires du RDV associé.
   * 
   * @param commandeId - ID de la réservation/commande
   * @param newDate - Nouvelle date du RDV
   * @param newHoraire - Nouvel horaire de début
   * @returns Promise<boolean> - true si la synchronisation a réussi
   * 
   * @example
   * await syncRdvReport('123', '2025-01-15', '10:00');
   */
  async syncRdvReport(commandeId: string, newDate: string, newHoraire: string): Promise<boolean> {
    try {
      // Calculer l'heure de fin (1 heure après le début)
      const [hours, minutes] = newHoraire.split(':').map(Number);
      const endHours = (hours + 1) % 24;
      const heureFin = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Mettre à jour le RDV avec les nouvelles dates et le statut 'reporte'
      await api.put(`/api/rdv/by-commande/${commandeId}`, {
        date: newDate,
        heureDebut: newHoraire,
        heureFin: heureFin,
        statut: 'reporte'
      });
      
      console.log(`✅ Sync RDV Report: Commande ${commandeId} → ${newDate} ${newHoraire}`);
      return true;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.log(`ℹ️ Aucun RDV trouvé pour reporter (commande ${commandeId})`);
        return false;
      }
      
      console.error('❌ Erreur synchronisation report RDV:', error);
      return false;
    }
  },

  /**
   * Vérifie si un RDV existe pour une commande donnée
   * 
   * @param commandeId - ID de la réservation/commande
   * @returns Promise<boolean> - true si un RDV existe
   */
  async hasLinkedRdv(commandeId: string): Promise<boolean> {
    try {
      const response = await api.get('/api/rdv');
      const rdvs = response.data;
      return rdvs.some((rdv: any) => rdv.commandeId === commandeId);
    } catch (error) {
      console.error('Erreur vérification RDV lié:', error);
      return false;
    }
  }
};

export default reservationRdvSyncService;
