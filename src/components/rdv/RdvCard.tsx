import React from 'react';
import { RDV } from '@/types/rdv';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  Edit,
  Trash2,
  FileText,
  Package,
  Link
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RdvCardProps {
  rdv: RDV;
  onEdit: (rdv: RDV) => void;
  onDelete: (rdv: RDV) => void;
  compact?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  planifie: { label: 'Planifié', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  confirme: { label: 'Confirmé', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  annule: { label: 'Annulé', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  termine: { label: 'Terminé', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
};

const RdvCard: React.FC<RdvCardProps> = ({ rdv, onEdit, onDelete, compact = false }) => {
  const status = statusConfig[rdv.statut] || statusConfig.planifie;
  const hasProducts = rdv.produits && rdv.produits.length > 0;

  if (compact) {
    return (
      <div 
        className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onEdit(rdv)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate flex items-center gap-2">
              {rdv.titre}
              {rdv.commandeId && (
                <Link className="h-3 w-3 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{rdv.heureDebut} - {rdv.heureFin}</span>
              <User className="h-3 w-3 ml-2" />
              <span className="truncate">{rdv.clientNom}</span>
            </div>
          </div>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{rdv.titre}</h3>
              <Badge className={status.className}>{status.label}</Badge>
              {rdv.commandeId && (
                <Badge variant="outline" className="text-xs">
                  <Link className="h-3 w-3 mr-1" />
                  Lié à réservation
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{format(parseISO(rdv.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>{rdv.heureDebut} - {rdv.heureFin}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{rdv.clientNom}</span>
              </div>

              {rdv.clientTelephone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <a 
                    href={`tel:${rdv.clientTelephone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {rdv.clientTelephone}
                  </a>
                </div>
              )}

              {rdv.lieu && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{rdv.lieu}</span>
                </div>
              )}

              {/* Affichage des produits si présents */}
              {hasProducts && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span>Produits réservés</span>
                  </div>
                  <div className="space-y-1">
                    {rdv.produits!.map((produit, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {produit.nom} x{produit.quantite}
                        </span>
                        <span className="font-medium">
                          {produit.prixVente.toLocaleString()} Ar
                        </span>
                      </div>
                    ))}
                    <div className="pt-1 mt-1 border-t flex justify-between text-sm font-medium">
                      <span>Total</span>
                      <span className="text-primary">
                        {rdv.produits!.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {rdv.description && (
                <div className="flex items-start gap-2 text-muted-foreground mt-2">
                  <FileText className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm whitespace-pre-line">{rdv.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(rdv)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(rdv)}
              className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RdvCard;
