import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface PretProduit {
  id: string;
  nom: string;
  phone: string;
  date: string;
  description: string;
  prixVente: number;
  reste: number;
  dateProchaineVente: string | null;
  avanceRecue?: number;
  estPaye?: boolean;
  paiements?: { date: string; montant: number }[];
}

interface AdvancePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (totalAdvance: number) => void;
}

interface PretWithPayment {
  pret: PretProduit;
  payment: string;
  paymentDate: string;
}

const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { toast } = useToast();
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<PretProduit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPrets, setSelectedPrets] = useState<PretWithPayment[]>([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // Recherche automatique après 3 caractères
  useEffect(() => {
    const searchPrets = async () => {
      if (searchName.length >= 3) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE_URL}/api/pretproduits`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const allPretProduits: PretProduit[] = response.data || [];
          const searchTerm = searchName.toLowerCase();

          const filteredPrets = allPretProduits.filter((pret) =>
            pret.nom &&
            pret.nom.toLowerCase().includes(searchTerm) &&
            pret.reste > 0
          );

          setSearchResults(filteredPrets);
        } catch (error) {
          console.error('Erreur lors de la recherche des prêts:', error);
          toast({
            title: 'Erreur',
            description: 'Erreur lors de la recherche des prêts',
            variant: 'destructive'
          });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchPrets, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchName, API_BASE_URL, toast]);

  // Ajouter un prêt à la sélection
  const handleSelectPret = (pret: PretProduit) => {
    const alreadySelected = selectedPrets.find(sp => sp.pret.id === pret.id);
    if (!alreadySelected) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedPrets(prev => [...prev, { pret, payment: '', paymentDate: today }]);
    }
  };

  // Retirer un prêt de la sélection
  const handleRemovePret = (pretId: string) => {
    setSelectedPrets(prev => prev.filter(sp => sp.pret.id !== pretId));
  };

  // Mettre à jour le paiement d'un prêt
  const handlePaymentChange = (pretId: string, payment: string) => {
    setSelectedPrets(prev => prev.map(sp => 
      sp.pret.id === pretId ? { ...sp, payment } : sp
    ));
  };

  // Mettre à jour la date de paiement d'un prêt
  const handlePaymentDateChange = (pretId: string, paymentDate: string) => {
    setSelectedPrets(prev => prev.map(sp =>
      sp.pret.id === pretId ? { ...sp, paymentDate } : sp
    ));
  };

  // Calculer le total des avances
  const getTotalAdvance = () => {
    return selectedPrets.reduce((sum, sp) => {
      const payment = parseFloat(sp.payment) || 0;
      return sum + payment;
    }, 0);
  };

  // Vérifier si le bouton valider doit être désactivé
  const isValidateDisabled = () => {
    if (selectedPrets.length === 0) return true;
    
    return selectedPrets.some(sp => {
      const payment = parseFloat(sp.payment) || 0;
      return payment <= 0 || payment > sp.pret.reste;
    });
  };

  // Valider et appliquer les avances
  const handleValidate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Appliquer les paiements à chaque prêt
      for (const sp of selectedPrets) {
        const payment = parseFloat(sp.payment) || 0;
        const newReste = sp.pret.reste - payment;
        const paymentDate = sp.paymentDate || new Date().toISOString().split('T')[0];

        const existingPaiements = Array.isArray(sp.pret.paiements) ? sp.pret.paiements : [];
        const updatedPaiements = [
          ...existingPaiements,
          { date: paymentDate, montant: payment },
        ];

        const newAvanceRecue = (sp.pret.avanceRecue || 0) + payment;

        await axios.put(
          `${API_BASE_URL}/api/pretproduits/${sp.pret.id}`,
          {
            reste: newReste,
            avanceRecue: newAvanceRecue,
            estPaye: newReste === 0,
            paiements: updatedPaiements,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      const totalAdvance = getTotalAdvance();
      onConfirm(totalAdvance);
      
      toast({
        title: 'Succès',
        description: `Avances appliquées avec succès. Total: ${totalAdvance.toLocaleString('fr-FR')} €`,
        className: "notification-success",
      });
      
      // Réinitialiser
      setSearchName('');
      setSearchResults([]);
      setSelectedPrets([]);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'application des avances:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'application des avances',
        variant: 'destructive'
      });
    }
  };

  // Réinitialiser lors de la fermeture
  const handleClose = () => {
    setSearchName('');
    setSearchResults([]);
    setSelectedPrets([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payer des Avances sur Prêts Existants</DialogTitle>
          <DialogDescription>
            Recherchez un client et sélectionnez les prêts auxquels appliquer des paiements d'avance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Barre de recherche */}
          <div className="space-y-2">
            <Label htmlFor="search-name">Rechercher un client (minimum 3 caractères)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-name"
                type="text"
                placeholder="Nom du client..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchName.length >= 3 && (
            <div className="space-y-2">
              <Label>Prêts trouvés ({searchResults.length})</Label>
              {isSearching ? (
                <div className="text-center py-4 text-muted-foreground">
                  Recherche en cours...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun prêt trouvé
                </div>
              ) : (
                <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {searchResults.map(pret => {
                    const isSelected = selectedPrets.find(sp => sp.pret.id === pret.id);
                    return (
                      <Card 
                        key={pret.id} 
                        className={`cursor-pointer hover:bg-accent transition-colors ${isSelected ? 'border-primary bg-accent' : ''}`}
                        onClick={() => !isSelected && handleSelectPret(pret)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="font-medium">{pret.nom}</p>
                              <p className="text-sm text-muted-foreground">{pret.description}</p>
                              <p className="text-sm">Date: {new Date(pret.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Prix: {pret.prixVente.toLocaleString('fr-FR')} €</p>
                              <p className="font-semibold text-destructive">Reste: {pret.reste.toLocaleString('fr-FR')} €</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Prêts sélectionnés avec paiements */}
          {selectedPrets.length > 0 && (
            <div className="space-y-4">
              <Label>Prêts sélectionnés ({selectedPrets.length})</Label>
              <div className="grid gap-4">
                {selectedPrets.map((sp) => {
                  const payment = parseFloat(sp.payment) || 0;
                  const isPaymentValid = payment > 0 && payment <= sp.pret.reste;
                  const isPaymentExceeded = payment > sp.pret.reste;

                  return (
                    <Card key={sp.pret.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{sp.pret.nom}</CardTitle>
                            <p className="text-sm text-muted-foreground">{sp.pret.description}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemovePret(sp.pret.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Reste à payer</Label>
                            <p className="font-semibold text-destructive">{sp.pret.reste.toLocaleString('fr-FR')} €</p>
                          </div>
                          <div>
                            <Label htmlFor={`payment-${sp.pret.id}`} className="text-xs">Avance à ajouter</Label>
                            <Input
                              id={`payment-${sp.pret.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              max={sp.pret.reste}
                              value={sp.payment}
                              onChange={(e) => handlePaymentChange(sp.pret.id, e.target.value)}
                              className={`${isPaymentExceeded ? 'border-destructive' : ''}`}
                            />
                            <div className="mt-2">
                              <Label htmlFor={`payment-date-${sp.pret.id}`} className="text-xs">Date de l'avance</Label>
                              <Input
                                id={`payment-date-${sp.pret.id}`}
                                type="date"
                                value={sp.paymentDate}
                                onChange={(e) => handlePaymentDateChange(sp.pret.id, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {isPaymentExceeded && (
                          <div className="flex items-center gap-2 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>L'avance ne peut pas être supérieure au reste à payer</span>
                          </div>
                        )}
                        
                        {isPaymentValid && (
                          <div className="flex items-center gap-2 text-primary text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Nouveau reste: {(sp.pret.reste - payment).toLocaleString('fr-FR')} €</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Total des avances */}
              <Card className="bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total des avances:</span>
                    <span className="text-xl font-bold text-primary">{getTotalAdvance().toLocaleString('fr-FR')} €</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleValidate} 
            disabled={isValidateDisabled()}
          >
            Valider les Avances
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancePaymentModal;
