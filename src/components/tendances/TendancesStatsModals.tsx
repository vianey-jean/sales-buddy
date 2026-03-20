 import React from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Card, CardContent } from '@/components/ui/card';
 import { motion } from 'framer-motion';
 import { 
   DollarSign, 
   TrendingUp, 
   Package, 
   Award,
   Star,
   Crown,
   Gem,
   BarChart3,
   ArrowUpRight,
   ShoppingCart
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface SalesModalProps {
   isOpen: boolean;
   onClose: () => void;
   data: {
     revenue: number;
     sales: number;
     profit: number;
     quantity: number;
     margin: number;
   };
   salesByProduct: any[];
   buyingRecommendations: any[];
 }
 
 interface ModalConfig {
   gradient: string;
   bgGradient: string;
   icon: React.ElementType;
   borderColor: string;
   title: string;
 }
 
 const formatCurrency = (value: number) => {
   return new Intl.NumberFormat('fr-FR', { 
     style: 'currency', 
     currency: 'EUR' 
   }).format(value);
 };
 
 // Modal Ventes Totales
 export const VentesTotalesModal: React.FC<{
   isOpen: boolean;
   onClose: () => void;
   revenue: number;
   sales: number;
   salesByProduct: any[];
 }> = ({ isOpen, onClose, revenue, sales, salesByProduct }) => (
   <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-900/30 dark:via-slate-900 dark:to-indigo-900/30 border-2 border-purple-300/50 dark:border-purple-700/50 rounded-3xl shadow-2xl">
       <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600" />
       
       <DialogHeader className="pb-4">
         <DialogTitle className="flex items-center gap-3 text-xl font-bold">
           <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/40">
             <DollarSign className="h-6 w-6 text-white" />
           </div>
           <div>
             <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
               Détails Ventes Totales
             </span>
             <Crown className="inline-block ml-2 h-5 w-5 text-amber-500 animate-bounce" />
           </div>
         </DialogTitle>
       </DialogHeader>
 
       <div className="grid grid-cols-2 gap-4 mb-6">
         <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-200/50 dark:border-purple-700/50">
           <CardContent className="p-4 text-center">
             <p className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold">Chiffre d'Affaires</p>
             <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
               {formatCurrency(revenue)}
             </p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-200/50 dark:border-indigo-700/50">
           <CardContent className="p-4 text-center">
             <p className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">Transactions</p>
             <p className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
               {sales}
             </p>
           </CardContent>
         </Card>
       </div>
 
       <ScrollArea className="max-h-[40vh]">
         <h3 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
           <ShoppingCart className="h-4 w-4" /> Top produits par ventes
         </h3>
         <div className="space-y-2">
           {salesByProduct.slice(0, 8).map((product, index) => (
             <motion.div
               key={product.name}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.05 }}
               className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-purple-100/50 dark:border-purple-800/50"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                   {index + 1}
                 </div>
                 <span className="font-medium text-sm truncate max-w-[200px]">{product.name}</span>
               </div>
               <span className="font-bold text-purple-600 dark:text-purple-400">{formatCurrency(product.ventes)}</span>
             </motion.div>
           ))}
         </div>
       </ScrollArea>
     </DialogContent>
   </Dialog>
 );
 
 // Modal Bénéfices
 export const BeneficesModal: React.FC<{
   isOpen: boolean;
   onClose: () => void;
   profit: number;
   margin: number;
   salesByProduct: any[];
 }> = ({ isOpen, onClose, profit, margin, salesByProduct }) => (
   <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-900/30 dark:via-slate-900 dark:to-teal-900/30 border-2 border-emerald-300/50 dark:border-emerald-700/50 rounded-3xl shadow-2xl">
       <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
       
       <DialogHeader className="pb-4">
         <DialogTitle className="flex items-center gap-3 text-xl font-bold">
           <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/40">
             <TrendingUp className="h-6 w-6 text-white" />
           </div>
           <div>
             <span className="text-lg font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
               Détails Bénéfices
             </span>
             <Gem className="inline-block ml-2 h-5 w-5 text-emerald-500 animate-pulse" />
           </div>
         </DialogTitle>
       </DialogHeader>
 
       <div className="grid grid-cols-2 gap-4 mb-6">
         <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-200/50 dark:border-emerald-700/50">
           <CardContent className="p-4 text-center">
             <p className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">Bénéfice Total</p>
             <p className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
               {formatCurrency(profit)}
             </p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-teal-200/50 dark:border-teal-700/50">
           <CardContent className="p-4 text-center">
             <p className="text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold">Marge Moyenne</p>
             <p className="text-2xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
               {margin.toFixed(1)}%
             </p>
           </CardContent>
         </Card>
       </div>
 
       <ScrollArea className="max-h-[40vh]">
         <h3 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
           <Star className="h-4 w-4" /> Top produits par bénéfice
         </h3>
         <div className="space-y-2">
           {salesByProduct.slice(0, 8).map((product, index) => (
             <motion.div
               key={product.name}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.05 }}
               className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-emerald-100/50 dark:border-emerald-800/50"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                   {index + 1}
                 </div>
                 <span className="font-medium text-sm truncate max-w-[200px]">{product.name}</span>
               </div>
               <div className="text-right">
                 <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(product.benefice)}</span>
                 <p className="text-xs text-muted-foreground">{product.quantite} unités</p>
               </div>
             </motion.div>
           ))}
         </div>
       </ScrollArea>
     </DialogContent>
   </Dialog>
 );
 
 // Modal Produits Vendus
 export const ProduitsVendusModal: React.FC<{
   isOpen: boolean;
   onClose: () => void;
   quantity: number;
   uniqueProducts: number;
   salesByProduct: any[];
 }> = ({ isOpen, onClose, quantity, uniqueProducts, salesByProduct }) => (
   <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-orange-900/30 dark:via-slate-900 dark:to-yellow-900/30 border-2 border-orange-300/50 dark:border-orange-700/50 rounded-3xl shadow-2xl">
       <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
       
       <DialogHeader className="pb-4">
         <DialogTitle className="flex items-center gap-3 text-xl font-bold">
           <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-600 shadow-lg shadow-orange-500/40">
             <Package className="h-6 w-6 text-white" />
           </div>
           <div>
             <span className="text-lg font-black bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
               Détails Produits Vendus
             </span>
             <Star className="inline-block ml-2 h-5 w-5 text-amber-500 animate-spin" />
           </div>
         </DialogTitle>
       </DialogHeader>
 
       <div className="grid grid-cols-2 gap-4 mb-6">
         <Card className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-200/50 dark:border-orange-700/50">
           <CardContent className="p-4 text-center">
             <p className="text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400 font-semibold">Quantité Totale</p>
             <p className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
               {quantity}
             </p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-200/50 dark:border-amber-700/50">
           <CardContent className="p-4 text-center">
             <p className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">Produits Différents</p>
             <p className="text-2xl font-black bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
               {uniqueProducts}
             </p>
           </CardContent>
         </Card>
       </div>
 
       <ScrollArea className="max-h-[40vh]">
         <h3 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
           <BarChart3 className="h-4 w-4" /> Répartition par produit
         </h3>
         <div className="space-y-2">
           {salesByProduct.slice(0, 10).map((product, index) => (
             <motion.div
               key={product.name}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.05 }}
               className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-orange-100/50 dark:border-orange-800/50"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                   {index + 1}
                 </div>
                 <span className="font-medium text-sm truncate max-w-[200px]">{product.name}</span>
               </div>
               <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                 {product.quantite} unités
               </Badge>
             </motion.div>
           ))}
         </div>
       </ScrollArea>
     </DialogContent>
   </Dialog>
 );
 
 // Modal Meilleur ROI
 export const MeilleurRoiModal: React.FC<{
   isOpen: boolean;
   onClose: () => void;
   buyingRecommendations: any[];
 }> = ({ isOpen, onClose, buyingRecommendations }) => (
   <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/30 dark:via-slate-900 dark:to-purple-900/30 border-2 border-blue-300/50 dark:border-blue-700/50 rounded-3xl shadow-2xl">
       <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
       
       <DialogHeader className="pb-4">
         <DialogTitle className="flex items-center gap-3 text-xl font-bold">
           <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/40">
             <Award className="h-6 w-6 text-white" />
           </div>
           <div>
             <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
               Meilleurs ROI
             </span>
             <ArrowUpRight className="inline-block ml-2 h-5 w-5 text-blue-500 animate-bounce" />
           </div>
         </DialogTitle>
       </DialogHeader>
 
       <ScrollArea className="max-h-[60vh]">
         <div className="space-y-3">
           {buyingRecommendations.map((product, index) => (
             <motion.div
               key={product.name}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
             >
               <Card className="overflow-hidden border border-blue-100/50 dark:border-blue-800/50 bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all">
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
                         index === 0 ? "bg-gradient-to-br from-amber-500 to-orange-500" :
                         index === 1 ? "bg-gradient-to-br from-slate-400 to-slate-500" :
                         index === 2 ? "bg-gradient-to-br from-amber-700 to-amber-800" :
                         "bg-gradient-to-br from-blue-500 to-indigo-500"
                       )}>
                         {index + 1}
                       </div>
                       <div>
                         <p className="font-bold text-sm truncate max-w-[250px]">{product.name}</p>
                         <p className="text-xs text-muted-foreground">Bénéfice moyen: {formatCurrency(parseFloat(product.avgProfit))}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <Badge className={cn(
                         "text-white border-0 text-lg font-black px-3 py-1",
                         parseFloat(product.roi) >= 100 ? "bg-gradient-to-r from-emerald-500 to-green-500" :
                         parseFloat(product.roi) >= 50 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                         "bg-gradient-to-r from-amber-500 to-orange-500"
                       )}>
                         {product.roi}%
                       </Badge>
                       <p className="text-xs text-muted-foreground mt-1">ROI</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           ))}
         </div>
       </ScrollArea>
     </DialogContent>
   </Dialog>
 );