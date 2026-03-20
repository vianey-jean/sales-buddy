import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Product, PretProduit } from '@/types';
import ProductSearchInput from '../ProductSearchInput';
import axios from 'axios';
import { Search } from 'lucide-react';

interface PretProduitFromSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPretCreated: (pretProduit: PretProduit, product: Product) => void;
}

interface ClientPretProduit {
  nom: string;
  phone: string;
  pretsCount: number;
}

const PretProduitFromSaleModal: React.FC<PretProduitFromSaleModalProps> = ({ isOpen, onClose, onPretCreated }) => {
  const { toast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // États pour la recherche de client
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<ClientPretProduit[]>([]);
  const [showClientResults, setShowClientResults] = useState(false);

  // États du formulaire
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [datePret, setDatePret] = useState(new Date().toISOString().split('T')[0]);
  const [datePaiement, setDatePaiement] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prixVente, setPrixVente] = useState('');
  const [avanceRecue, setAvanceRecue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rechercher les clients dans pretproduits.json
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch.length >= 3) {
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            console.warn('Token non trouvé pour la recherche de clients');
            return;
          }

          console.log('🔍 Recherche de clients avec:', clientSearch, 'URL:', API_BASE_URL);
          
          const response = await axios.get(`${API_BASE_URL}/api/pretproduits/search`, {
            params: { nom: clientSearch },
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('✅ Réponse recherche clients:', response.data);

          // Grouper les clients par nom
          const clientsMap = new Map<string, ClientPretProduit>();
          
          if (Array.isArray(response.data)) {
            response.data.forEach((pret: any) => {
              if (pret.nom) {
                const existing = clientsMap.get(pret.nom.toLowerCase());
                if (existing) {
                  existing.pretsCount++;
                } else {
                  clientsMap.set(pret.nom.toLowerCase(), {
                    nom: pret.nom,
                    phone: pret.phone || '',
                    pretsCount: 1
                  });
                }
              }
            });
          }

          const results = Array.from(clientsMap.values());
          setClientResults(results);
          setShowClientResults(results.length > 0);
        } catch (error: any) {
          console.error('❌ Erreur lors de la recherche de clients:', error);
          console.error('Détails:', error.response?.data || error.message);
          setClientResults([]);
          setShowClientResults(false);
        }
      } else {
        setClientResults([]);
        setShowClientResults(false);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [clientSearch, API_BASE_URL]);

  // Sélectionner un client
  const handleClientSelect = (client: ClientPretProduit) => {
    setClientName(client.nom);
    setClientPhone(client.phone);
    setClientSearch(client.nom);
    setShowClientResults(false);
  };

  // Calculer le reste automatiquement
  const reste = (Number(prixVente) || 0) - (Number(avanceRecue) || 0);

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou saisir un nom de client",
        variant: "destructive",
        className: "notification-erreur",
      });
      return;
    }

    if (!selectedProduct) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit",
        variant: "destructive",
        className: "notification-erreur",
      });
      return;
    }

    if (!prixVente || Number(prixVente) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un prix de vente valide",
        variant: "destructive",
        className: "notification-erreur",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const pretProduitData = {
        date: datePret,
        datePaiement: datePaiement || new Date(new Date(datePret).setMonth(new Date(datePret).getMonth() + 1)).toISOString().split('T')[0],
        phone: clientPhone || '',
        description: selectedProduct.description,
        nom: clientName,
        prixVente: Number(prixVente),
        avanceRecue: Number(avanceRecue) || 0,
        reste: reste,
        estPaye: reste <= 0,
        productId: selectedProduct.id
      };

      const response = await axios.post(`${API_BASE_URL}/api/pretproduits`, pretProduitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Succès",
        description: "Prêt produit créé avec succès",
        className: "notification-success",
      });

      // Appeler le callback avec le prêt créé et le produit
      onPretCreated(response.data, selectedProduct);
      
      // Réinitialiser le formulaire
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du prêt produit:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du prêt produit",
        variant: "destructive",
        className: "notification-erreur",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setClientSearch('');
    setClientName('');
    setClientPhone('');
    setDatePret(new Date().toISOString().split('T')[0]);
    setDatePaiement('');
    setSelectedProduct(null);
    setPrixVente('');
    setAvanceRecue('');
    setClientResults([]);
    setShowClientResults(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un Prêt Produit</DialogTitle>
          <DialogDescription>
            Recherchez un client et créez un nouveau prêt produit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recherche et sélection du client */}
          <div className="space-y-2">
            <Label htmlFor="clientSearch">Rechercher un client</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="clientSearch"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Saisir au moins 3 caractères..."
                  className="pl-10"
                />
              </div>
              
              {/* Résultats de recherche */}
              {showClientResults && clientResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {clientResults.map((client, index) => (
                    <div
                      key={index}
                      onClick={() => handleClientSelect(client)}
                      className="px-4 py-3 hover:bg-accent cursor-pointer border-b border-border last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">{client.nom}</p>
                          {client.phone && (
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                          )}
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {client.pretsCount} prêt{client.pretsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {clientSearch.length > 0 && clientSearch.length < 3 && (
              <p className="text-sm text-muted-foreground">
                Saisissez au moins 3 caractères pour rechercher
              </p>
            )}
          </div>

          {/* Informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nom du client *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nom du client"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">Téléphone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="0692123456"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datePret">Date du prêt *</Label>
              <Input
                id="datePret"
                type="date"
                value={datePret}
                onChange={(e) => setDatePret(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="datePaiement">Date de paiement prévue</Label>
              <Input
                id="datePaiement"
                type="date"
                value={datePaiement}
                onChange={(e) => setDatePaiement(e.target.value)}
              />
            </div>
          </div>

          {/* Produit */}
          <div className="space-y-2">
            <Label>Produit *</Label>
            <ProductSearchInput
              onProductSelect={(product) => setSelectedProduct(product)}
              selectedProduct={selectedProduct}
            />
          </div>

          {/* Prix et avance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prixVente">Prix de vente (€) *</Label>
              <Input
                id="prixVente"
                type="number"
                step="0.01"
                min="0"
                value={prixVente}
                onChange={(e) => setPrixVente(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avanceRecue">Avance reçue (€)</Label>
              <Input
                id="avanceRecue"
                type="number"
                step="0.01"
                min="0"
                value={avanceRecue}
                onChange={(e) => setAvanceRecue(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Reste à payer (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={reste.toFixed(2)}
                readOnly
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Création...' : 'Créer le prêt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PretProduitFromSaleModal;
