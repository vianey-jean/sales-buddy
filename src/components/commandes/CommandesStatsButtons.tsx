/**
 * Boutons de statistiques premium pour les commandes
 * Affiche 3 boutons cliquables avec modales détaillées
 */
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Package, 
  Coins, 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Phone,
  Sparkles,
  TrendingUp,
  Box
} from 'lucide-react';
import { Commande } from '@/types/commande';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

interface CommandesStatsButtonsProps {
  filteredCommandes: Commande[];
  totalActiveCommandes: number;
  commandeSearch: string;
}

const CommandesStatsButtons: React.FC<CommandesStatsButtonsProps> = ({
  filteredCommandes,
  totalActiveCommandes,
  commandeSearch
}) => {
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showProduitsModal, setShowProduitsModal] = useState(false);
  const [showPrixModal, setShowPrixModal] = useState(false);
  const { formatCurrency } = useCurrencyFormatter();

  // Calculs mémorisés
  const stats = useMemo(() => {
    const commandes = filteredCommandes.filter(c => c.type === 'commande');
    const reservations = filteredCommandes.filter(c => c.type === 'reservation');
    
    // Total produits
    const totalProduits = filteredCommandes.reduce(
      (sum, c) => sum + c.produits.reduce((pSum, p) => pSum + p.quantite, 0), 
      0
    );
    
    const produitsCommandes = commandes.reduce(
      (sum, c) => sum + c.produits.reduce((pSum, p) => pSum + p.quantite, 0), 
      0
    );
    
    const produitsReservations = reservations.reduce(
      (sum, c) => sum + c.produits.reduce((pSum, p) => pSum + p.quantite, 0), 
      0
    );
    
    // Total prix
    const totalPrix = filteredCommandes.reduce(
      (sum, c) => sum + c.produits.reduce((pSum, p) => pSum + (p.prixVente * p.quantite), 0), 
      0
    );
    
    const prixCommandes = commandes.reduce(
      (sum, c) => sum + c.produits.reduce((pSum, p) => pSum + (p.prixVente * p.quantite), 0), 
      0
    );
    
    const prixReservations = reservations.reduce(
      (sum, c) => sum + c.produits.reduce((pSum, p) => pSum + (p.prixVente * p.quantite), 0), 
      0
    );
    
    // Liste des produits groupés
    const produitsMap = new Map<string, { nom: string; quantite: number; prixTotal: number; type: 'commande' | 'reservation' }[]>();
    
    filteredCommandes.forEach(c => {
      c.produits.forEach(p => {
        const key = p.nom;
        if (!produitsMap.has(key)) {
          produitsMap.set(key, []);
        }
        produitsMap.get(key)!.push({
          nom: p.nom,
          quantite: p.quantite,
          prixTotal: p.prixVente * p.quantite,
          type: c.type
        });
      });
    });
    
    const produitsGrouped = Array.from(produitsMap.entries()).map(([nom, items]) => ({
      nom,
      quantiteTotal: items.reduce((sum, i) => sum + i.quantite, 0),
      prixTotal: items.reduce((sum, i) => sum + i.prixTotal, 0),
      commandes: items.filter(i => i.type === 'commande').reduce((sum, i) => sum + i.quantite, 0),
      reservations: items.filter(i => i.type === 'reservation').reduce((sum, i) => sum + i.quantite, 0)
    })).sort((a, b) => b.quantiteTotal - a.quantiteTotal);
    
    return {
      totalCommandes: filteredCommandes.length,
      nbCommandes: commandes.length,
      nbReservations: reservations.length,
      totalProduits,
      produitsCommandes,
      produitsReservations,
      totalPrix,
      prixCommandes,
      prixReservations,
      produitsGrouped
    };
  }, [filteredCommandes]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
        {/* Bouton 1: Clients/Commandes */}
        <Button
          onClick={() => setShowClientsModal(true)}
          className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl px-3 sm:px-4 py-2 h-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] opacity-80 leading-none">Clients</span>
              <span className="font-bold text-sm leading-tight">
                {stats.totalCommandes} {stats.totalCommandes > 1 ? 'commandes' : 'commande'}
              </span>
            </div>
            <Sparkles className="h-3 w-3 opacity-60 animate-pulse" />
          </div>
        </Button>

        {/* Bouton 2: Total Produits */}
        <Button
          onClick={() => setShowProduitsModal(true)}
          className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl px-3 sm:px-4 py-2 h-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm">
              <Package className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] opacity-80 leading-none">Produits</span>
              <span className="font-bold text-sm leading-tight">
                {stats.totalProduits} {stats.totalProduits > 1 ? 'articles' : 'article'}
              </span>
            </div>
            <Box className="h-3 w-3 opacity-60" />
          </div>
        </Button>

        {/* Bouton 3: Prix Total */}
        <Button
          onClick={() => setShowPrixModal(true)}
          className="group relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl px-3 sm:px-4 py-2 h-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm">
              <Coins className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] opacity-80 leading-none">Total</span>
              <span className="font-bold text-sm leading-tight">
                {formatCurrency(stats.totalPrix)}
              </span>
            </div>
            <TrendingUp className="h-3 w-3 opacity-60" />
          </div>
        </Button>

        {/* Indicateur de recherche */}
        {commandeSearch.length >= 3 && (
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 px-3 py-1"
          >
            sur {totalActiveCommandes} actives
          </Badge>
        )}
      </div>

      {/* Modal Clients */}
      <Dialog open={showClientsModal} onOpenChange={setShowClientsModal}>
        <DialogContent className="max-w-lg sm:max-w-xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                <Users className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                Liste des Clients
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-3 mb-4">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              <ShoppingBag className="h-3 w-3 mr-1" />
              {stats.nbCommandes} Commandes
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <Calendar className="h-3 w-3 mr-1" />
              {stats.nbReservations} Réservations
            </Badge>
          </div>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {filteredCommandes.map((commande, idx) => (
                <div 
                  key={commande.id}
                  className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-purple-100 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{commande.clientNom}</span>
                        <Badge 
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            commande.type === 'commande' 
                              ? 'border-purple-300 text-purple-600 dark:border-purple-600 dark:text-purple-400' 
                              : 'border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {commande.type === 'commande' ? 'CMD' : 'RES'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {commande.clientPhone}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{commande.clientAddress}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {commande.produits.length} produit{commande.produits.length > 1 ? 's' : ''}
                      </div>
                      <div className="font-bold text-sm text-purple-600 dark:text-purple-400">
                        {formatCurrency(commande.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCommandes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune commande trouvée
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Produits */}
      <Dialog open={showProduitsModal} onOpenChange={setShowProduitsModal}>
        <DialogContent className="max-w-lg sm:max-w-xl bg-gradient-to-br from-white via-emerald-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-emerald-950/20 dark:to-cyan-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg">
                <Package className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent font-bold">
                Liste des Produits
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-3 mb-4">
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              <ShoppingBag className="h-3 w-3 mr-1" />
              {stats.produitsCommandes} en commande
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <Calendar className="h-3 w-3 mr-1" />
              {stats.produitsReservations} réservés
            </Badge>
          </div>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {stats.produitsGrouped.map((produit, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-emerald-100 dark:border-emerald-800/30 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground truncate">{produit.nom}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {produit.commandes > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                            {produit.commandes} cmd
                          </span>
                        )}
                        {produit.reservations > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                            {produit.reservations} rés
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                        x{produit.quantiteTotal}
                      </div>
                      <div className="text-sm font-semibold text-muted-foreground">
                        {formatCurrency(produit.prixTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {stats.produitsGrouped.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun produit trouvé
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Total */}
          <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-muted-foreground">Total Produits</span>
              <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                {stats.totalProduits} articles
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Prix */}
      <Dialog open={showPrixModal} onOpenChange={setShowPrixModal}>
        <DialogContent className="max-w-lg sm:max-w-xl bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 dark:from-gray-900 dark:via-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                <Coins className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
                Détail des Prix
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[350px] pr-4">
            <div className="space-y-3">
              {stats.produitsGrouped.map((produit, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-amber-100 dark:border-amber-800/30 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{produit.nom}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Quantité: {produit.quantiteTotal}
                      </div>
                    </div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(produit.prixTotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Récapitulatif */}
          <div className="mt-4 pt-4 border-t-2 border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <span className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <ShoppingBag className="h-4 w-4" />
                Total Commandes
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(stats.prixCommandes)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <span className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Calendar className="h-4 w-4" />
                Total Réservations
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.prixReservations)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-300 dark:border-amber-700">
              <span className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
                <Coins className="h-5 w-5" />
                TOTAL GÉNÉRAL
              </span>
              <span className="font-black text-2xl text-amber-600 dark:text-amber-400">
                {formatCurrency(stats.totalPrix)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommandesStatsButtons;
