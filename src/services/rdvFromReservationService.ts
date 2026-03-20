import { RDVFormData, RDVFromReservation, RDVProduit } from '@/types/rdv';
import { Commande, CommandeProduit } from '@/types/commande';
import rdvApiService from '@/services/api/rdvApi';

/**
 * Service pour créer automatiquement un RDV depuis une réservation
 */
export const rdvFromReservationService = {
  /**
   * Convertit une commande/réservation en données RDV
   */
  convertCommandeToRdv(commande: Commande): RDVFormData {
    // Calculer l'heure de fin (1 heure après le début par défaut)
    const heureDebut = commande.horaire || '09:00';
    const [hours, minutes] = heureDebut.split(':').map(Number);
    const endHours = (hours + 1) % 24;
    const heureFin = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Convertir les produits
    const produits: RDVProduit[] = commande.produits.map((p: CommandeProduit) => ({
      nom: p.nom,
      quantite: p.quantite,
      prixUnitaire: p.prixUnitaire,
      prixVente: p.prixVente,
    }));

    // Créer le titre
    const produitsNoms = produits.map(p => p.nom).join(', ');
    const titre = commande.type === 'reservation' 
      ? `Réservation: ${produitsNoms.substring(0, 50)}`
      : `Commande: ${produitsNoms.substring(0, 50)}`;

    // Description avec détails produits
    const description = produits
      .map(p => `- ${p.nom} x${p.quantite} (${p.prixVente.toLocaleString()} Ar)`)
      .join('\n');

    return {
      titre,
      description: `Produits réservés:\n${description}`,
      clientNom: commande.clientNom,
      clientTelephone: commande.clientPhone,
      clientAdresse: commande.clientAddress,
      date: commande.type === 'reservation' ? commande.dateEcheance! : commande.dateArrivagePrevue!,
      heureDebut,
      heureFin,
      lieu: commande.clientAddress,
      statut: 'planifie',
      notes: `Créé automatiquement depuis ${commande.type === 'reservation' ? 'une réservation' : 'une commande'}`,
      produits,
      commandeId: commande.id,
    };
  },

  /**
   * Crée un RDV depuis une commande/réservation
   */
  async createRdvFromCommande(commande: Commande): Promise<boolean> {
    try {
      // Vérifier si un RDV existe déjà pour cette commande
      const existingRdvs = await rdvApiService.getAll();
      const alreadyExists = existingRdvs.some(rdv => rdv.commandeId === commande.id);
      
      if (alreadyExists) {
        console.log('RDV déjà existant pour cette commande');
        return false;
      }

      const rdvData = this.convertCommandeToRdv(commande);
      await rdvApiService.create(rdvData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du RDV:', error);
      throw error;
    }
  },

  /**
   * Met à jour le RDV lié à une commande
   */
  async updateRdvFromCommande(commande: Commande): Promise<boolean> {
    try {
      const existingRdvs = await rdvApiService.getAll();
      const existingRdv = existingRdvs.find(rdv => rdv.commandeId === commande.id);
      
      if (!existingRdv) {
        // Créer le RDV s'il n'existe pas
        return this.createRdvFromCommande(commande);
      }

      const rdvData = this.convertCommandeToRdv(commande);
      await rdvApiService.update(existingRdv.id, rdvData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du RDV:', error);
      throw error;
    }
  },

  /**
   * Supprime le RDV lié à une commande
   */
  async deleteRdvFromCommande(commandeId: string): Promise<boolean> {
    try {
      const existingRdvs = await rdvApiService.getAll();
      const existingRdv = existingRdvs.find(rdv => rdv.commandeId === commandeId);
      
      if (existingRdv) {
        await rdvApiService.delete(existingRdv.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la suppression du RDV:', error);
      throw error;
    }
  }
};

export default rdvFromReservationService;
