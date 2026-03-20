 import React from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Card, CardContent } from '@/components/ui/card';
 import { motion } from 'framer-motion';
 import { 
   Clock, 
   Calendar, 
   CheckCircle, 
   XCircle, 
   AlertCircle,
   User,
   MapPin,
   Phone,
   Star,
   Crown,
   TrendingUp
 } from 'lucide-react';
 import { RDV } from '@/types/rdv';
 import { format, parseISO } from 'date-fns';
 import { fr } from 'date-fns/locale';
 import { cn } from '@/lib/utils';
 
 interface StatsModalProps {
   isOpen: boolean;
   onClose: () => void;
   rdvs: RDV[];
   title: string;
   type: 'today' | 'month' | 'pending' | 'total';
 }
 
 const statusColors: Record<string, string> = {
   planifie: 'bg-blue-500',
   confirme: 'bg-emerald-500',
   annule: 'bg-red-500',
   termine: 'bg-gray-500',
 };
 
 const statusLabels: Record<string, string> = {
   planifie: 'Planifié',
   confirme: 'Confirmé',
   annule: 'Annulé',
   termine: 'Terminé',
 };
 
 const typeConfig = {
   today: {
     gradient: 'from-blue-500 to-blue-700',
     bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
     icon: Clock,
     borderColor: 'border-blue-300 dark:border-blue-700',
   },
   month: {
     gradient: 'from-emerald-500 to-emerald-700',
     bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
     icon: TrendingUp,
     borderColor: 'border-emerald-300 dark:border-emerald-700',
   },
   pending: {
     gradient: 'from-amber-500 to-orange-600',
     bgGradient: 'from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20',
     icon: AlertCircle,
     borderColor: 'border-amber-300 dark:border-amber-700',
   },
   total: {
     gradient: 'from-purple-500 to-purple-700',
     bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
     icon: Crown,
     borderColor: 'border-purple-300 dark:border-purple-700',
   },
 };
 
 export const RdvStatsModal: React.FC<StatsModalProps> = ({ 
   isOpen, 
   onClose, 
   rdvs, 
   title,
   type 
 }) => {
   const config = typeConfig[type];
   const IconComponent = config.icon;
 
   return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className={cn(
         "sm:max-w-2xl max-h-[85vh] overflow-hidden",
         "bg-gradient-to-br",
         config.bgGradient,
         "border-2",
         config.borderColor,
         "rounded-3xl shadow-2xl"
       )}>
         <div className={cn("absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r", config.gradient)} />
         
         <DialogHeader className="pb-4">
           <DialogTitle className="flex items-center gap-3 text-xl font-bold">
             <div className={cn(
               "p-3 rounded-2xl bg-gradient-to-br shadow-lg",
               config.gradient
             )}>
               <IconComponent className="h-6 w-6 text-white" />
             </div>
             <div>
               <span className="text-lg font-black">{title}</span>
               <Badge className={cn("ml-3 text-white border-0", `bg-gradient-to-r ${config.gradient}`)}>
                 {rdvs.length} rendez-vous
               </Badge>
             </div>
           </DialogTitle>
         </DialogHeader>
 
         <ScrollArea className="max-h-[60vh] pr-4">
           {rdvs.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-center">
               <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
               <p className="text-lg font-semibold text-muted-foreground">Aucun rendez-vous</p>
               <p className="text-sm text-muted-foreground/70">Pas de rendez-vous dans cette catégorie</p>
             </div>
           ) : (
             <div className="space-y-3">
               {rdvs.map((rdv, index) => (
                 <motion.div
                   key={rdv.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                 >
                   <Card className="overflow-hidden border border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                     <div className={cn("h-1", statusColors[rdv.statut])} />
                     <CardContent className="p-4">
                       <div className="flex items-start justify-between gap-3">
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-2">
                             <Badge className={cn("text-white text-xs", statusColors[rdv.statut])}>
                               {statusLabels[rdv.statut]}
                             </Badge>
                             <span className="font-bold text-sm truncate">{rdv.titre}</span>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                             <div className="flex items-center gap-1">
                               <User className="h-3 w-3 text-primary" />
                               <span className="truncate">{rdv.clientNom}</span>
                             </div>
                             <div className="flex items-center gap-1">
                               <Calendar className="h-3 w-3 text-primary" />
                               <span>{format(parseISO(rdv.date), 'd MMM yyyy', { locale: fr })}</span>
                             </div>
                             <div className="flex items-center gap-1">
                               <Clock className="h-3 w-3 text-primary" />
                               <span>{rdv.heureDebut} - {rdv.heureFin}</span>
                             </div>
                             {rdv.lieu && (
                               <div className="flex items-center gap-1">
                                 <MapPin className="h-3 w-3 text-primary" />
                                 <span className="truncate">{rdv.lieu}</span>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>
               ))}
             </div>
           )}
         </ScrollArea>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default RdvStatsModal;