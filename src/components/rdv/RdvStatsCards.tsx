 import React from 'react';
 import { Card, CardContent } from '@/components/ui/card';
 import { motion } from 'framer-motion';
 import { Clock, TrendingUp, CalendarCheck, Crown, Sparkles } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface StatsCardProps {
   type: 'today' | 'month' | 'pending' | 'total';
   value: number;
   onClick: () => void;
 }
 
 const cardConfig = {
   today: {
     label: "Aujourd'hui",
     gradient: 'from-blue-500/20 via-blue-400/10 to-blue-600/5',
     textGradient: 'from-blue-400 to-blue-700',
     iconBg: 'from-blue-500 to-blue-700',
     shadow: 'rgba(59,130,246,0.6)',
     iconShadow: 'rgba(59,130,246,0.7)',
     blur: 'bg-blue-400/30',
     labelColor: 'text-blue-500',
     Icon: Clock,
     delay: 0.1,
   },
   month: {
     label: 'Ce mois',
     gradient: 'from-emerald-500/20 via-emerald-400/10 to-emerald-600/5',
     textGradient: 'from-emerald-400 to-emerald-700',
     iconBg: 'from-emerald-500 to-emerald-700',
     shadow: 'rgba(16,185,129,0.6)',
     iconShadow: 'rgba(16,185,129,0.7)',
     blur: 'bg-emerald-400/30',
     labelColor: 'text-emerald-500',
     Icon: TrendingUp,
     delay: 0.2,
   },
   pending: {
     label: 'En attente',
     gradient: 'from-amber-500/25 via-orange-400/10 to-orange-600/5',
     textGradient: 'from-amber-400 to-orange-600',
     iconBg: 'from-amber-500 to-orange-600',
     shadow: 'rgba(245,158,11,0.6)',
     iconShadow: 'rgba(245,158,11,0.7)',
     blur: 'bg-amber-400/30',
     labelColor: 'text-amber-500',
     Icon: CalendarCheck,
     delay: 0.3,
   },
   total: {
     label: 'Total du mois',
     gradient: 'from-purple-500/25 via-fuchsia-400/10 to-purple-700/5',
     textGradient: 'from-purple-400 to-purple-700',
     iconBg: 'from-purple-500 to-purple-700',
     shadow: 'rgba(168,85,247,0.7)',
     iconShadow: 'rgba(168,85,247,0.8)',
     blur: 'bg-purple-400/30',
     labelColor: 'text-purple-500',
     Icon: Crown,
     delay: 0.4,
   },
 };
 
 export const RdvStatsCard: React.FC<StatsCardProps> = ({ type, value, onClick }) => {
   const config = cardConfig[type];
   const IconComponent = config.Icon;
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: config.delay }}
       whileHover={{ scale: 1.04, y: -8 }}
       onClick={onClick}
       className="cursor-pointer"
     >
       <Card
         className={cn(
           "relative overflow-hidden rounded-3xl",
           `bg-gradient-to-br ${config.gradient}`,
           "backdrop-blur-xl",
           "border border-white/30 dark:border-white/10",
           "transition-all duration-500 cursor-pointer",
         )}
         style={{ boxShadow: `0 25px 60px -15px ${config.shadow}` }}
       >
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
         <div className={cn("absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl", config.blur)} />
 
         <CardContent className="relative p-6">
           <div className="flex items-center justify-between">
             <div>
               <p className={cn("text-xs uppercase tracking-widest font-semibold", config.labelColor)}>
                 {config.label}
               </p>
               <p className={cn("text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r", config.textGradient)}>
                 {value}
               </p>
             </div>
 
             <div
               className={cn("p-4 rounded-2xl bg-gradient-to-br", config.iconBg)}
               style={{ boxShadow: `0 15px 40px ${config.iconShadow}` }}
             >
               <IconComponent className="h-7 w-7 text-white drop-shadow-lg" />
             </div>
           </div>
           
           {/* Click indicator */}
           <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <Sparkles className="h-4 w-4 text-white/50" />
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 };
 
 export default RdvStatsCard;