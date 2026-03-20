import React from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { RDV } from '@/types/rdv';
 import { Calendar, Clock, User, Phone, MapPin, Package } from 'lucide-react';
 import { format, parseISO } from 'date-fns';
 import { fr } from 'date-fns/locale';
 import { cn } from '@/lib/utils';
 
 interface RdvStatsDetailsModalProps {
   isOpen: boolean;
   onClose: () => void;
   title: string;
   rdvs: RDV[];
   onRdvClick?: (rdv: RDV) => void;
   accentColor?: string;
 }
 
 const statusConfig: Record<string, { label: string; className: string }> = {
   planifie: { label: 'Planifié', className: 'bg-blue-500 text-white' },
   confirme: { label: 'Confirmé', className: 'bg-green-500 text-white' },
   annule: { label: 'Annulé', className: 'bg-red-500 text-white' },
   termine: { label: 'Terminé', className: 'bg-gray-500 text-white' },
   reporte: { label: 'Reporté', className: 'bg-orange-500 text-white' },
 };
 
 const RdvStatsDetailsModal: React.FC<RdvStatsDetailsModalProps> = ({
   isOpen,
   onClose,
   title,
   rdvs,
   onRdvClick,
   accentColor = 'from-primary to-primary'
 }) => {
   return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
         <DialogHeader className={cn(
           "px-6 py-4 bg-gradient-to-r text-white",
           accentColor
         )}>
           <DialogTitle className="text-xl font-bold flex items-center gap-2">
             <Calendar className="h-5 w-5" />
             {title}
             <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
               {rdvs.length} RDV
             </Badge>
           </DialogTitle>
         </DialogHeader>
         
         <ScrollArea className="max-h-[65vh] px-4 py-4">
           {rdvs.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
               <p>Aucun rendez-vous dans cette catégorie</p>
             </div>
           ) : (
             <div className="space-y-3">
               {rdvs.map((rdv) => {
                 const status = statusConfig[rdv.statut] || statusConfig.planifie;
                 const hasProducts = rdv.produits && rdv.produits.length > 0;
                 
                 return (
                   <div
                     key={rdv.id}
                     onClick={() => onRdvClick?.(rdv)}
                     className="p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group"
                   >
                     <div className="flex items-start justify-between gap-3">
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 flex-wrap mb-2">
                           <Badge className={status.className}>
                             {status.label}
                           </Badge>
                           <h4 className="font-semibold group-hover:text-primary transition-colors truncate">
                             {rdv.titre}
                           </h4>
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                           <div className="flex items-center gap-2">
                             <User className="h-4 w-4 text-primary flex-shrink-0" />
                             <span className="truncate">{rdv.clientNom}</span>
                           </div>
                           
                           <div className="flex items-center gap-2">
                             <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                             <span>{format(parseISO(rdv.date), 'd MMMM yyyy', { locale: fr })}</span>
                           </div>
                           
                           <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                             <span>{rdv.heureDebut} - {rdv.heureFin}</span>
                           </div>
                           
                           {rdv.clientTelephone && (
                             <div className="flex items-center gap-2">
                               <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                               <span>{rdv.clientTelephone}</span>
                             </div>
                           )}
                           
                           {rdv.lieu && (
                             <div className="flex items-center gap-2 sm:col-span-2">
                               <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                               <span className="truncate">{rdv.lieu}</span>
                             </div>
                           )}
                         </div>
                         
                         {hasProducts && (
                           <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                             <div className="flex items-center gap-2 text-xs font-medium mb-1">
                               <Package className="h-3 w-3 text-primary" />
                               <span>Produits réservés ({rdv.produits!.length})</span>
                             </div>
                             <div className="text-xs text-muted-foreground">
                               {rdv.produits!.slice(0, 2).map((p, i) => (
                                 <span key={i}>
                                   {p.nom} x{p.quantite}
                                   {i < Math.min(rdv.produits!.length - 1, 1) && ', '}
                                 </span>
                               ))}
                               {rdv.produits!.length > 2 && ` +${rdv.produits!.length - 2} autres`}
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
         </ScrollArea>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default RdvStatsDetailsModal;