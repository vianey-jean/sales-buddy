 import React, { useState, useEffect } from 'react';
 import { Link } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
 
 import { useAuth } from '@/contexts/AuthContext';
 import { useTheme } from '@/contexts/ThemeContext';
 import { useMessages } from '@/hooks/use-messages';
 
import RdvNotifications from '@/components/rdv/RdvNotifications';
import ObjectifIndicator from '@/components/navbar/ObjectifIndicator';
import profileApi from '@/services/api/profileApi';
 
import {
  LayoutDashboard,
  MessageSquare,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Crown,
  Diamond,
  Gem,
} from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useMessages();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    useEffect(() => {
      if (isAuthenticated) {
        profileApi.getProfile().then(p => {
          if (p.profilePhoto) setProfilePhoto(profileApi.getPhotoUrl(p.profilePhoto));
        }).catch(() => {});
      }
    }, [isAuthenticated]);
 
    return (
      <>
      <style>{`
        @keyframes navGreenPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
          50% { opacity: 0.5; box-shadow: 0 0 10px 3px rgba(52, 211, 153, 0.3); }
        }
      `}</style>
     <header className="sticky top-0 z-50 backdrop-blur-2xl bg-gradient-to-r from-white/90 via-slate-50/90 to-violet-50/90 dark:from-[#030014]/95 dark:via-[#0a0020]/95 dark:to-[#0e0030]/95 border-b border-violet-200/20 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5">
       {/* Mirror top reflection */}
       <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
       {/* Ultra Premium Top Gradient Bar */}
       <div className="h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
       
       <nav className="max-w-7xl mx-auto px-4 relative">
         {/* Decorative Background Elements */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 left-1/4 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
           <div className="absolute top-0 right-1/4 w-40 h-40 bg-fuchsia-500/5 rounded-full blur-3xl" />
         </div>
         
         <div className="flex justify-between h-16 items-center">

           {/* Logo + Objectif */}
           <div className="flex items-center gap-4">
             <Link to="/" className="flex items-center group relative">
               <motion.div
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className="relative"
               >
                 <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                 <img
                   src="/images/logo.ico"
                   alt="Logo"
                    className="relative h-10 w-auto sm:h-12 md:h-14 lg:h-16 object-contain max-w-[160px]"
                 />
               </motion.div>
             </Link>
             
             {isAuthenticated && <ObjectifIndicator />}
           </div>

           {/* ================= DESKTOP ================= */}
           <div className="hidden lg:flex items-center space-x-1">
             {isAuthenticated && (
               <>
                 <Link to="/dashboard">
                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                     <Button variant="ghost" className="relative rounded-2xl hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-purple-500/10 transition-all duration-300 group overflow-hidden px-4 py-2 mirror-shine">
                       <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 mr-2 shadow-lg shadow-violet-500/30">
                         <LayoutDashboard className="h-4 w-4 text-white" />
                       </div>
                       <span className="font-bold relative z-10">Dashboard</span>
                     </Button>
                   </motion.div>
                 </Link>

                 <Link to="/messages">
                   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                     <Button variant="ghost" className="relative rounded-2xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10 transition-all duration-300 group overflow-hidden px-4 py-2 mirror-shine">
                       <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 mr-2 shadow-lg shadow-blue-500/30">
                         <MessageSquare className="h-4 w-4 text-white" />
                       </div>
                       <span className="font-bold relative z-10">Messages</span>
                       {unreadCount > 0 && (
                         <Badge className="ml-2 bg-red-500 text-white border-0 shadow-lg shadow-red-500/40 animate-pulse">
                           {unreadCount}
                         </Badge>
                       )}
                     </Button>
                   </motion.div>
                 </Link>

                 <RdvNotifications />
               </>
             )}

             {/* Theme */}
             <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={toggleTheme}
                 className="relative rounded-2xl h-10 w-10 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-orange-500/10 transition-all duration-300 overflow-hidden group"
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                 {theme === 'dark'
                   ? <Sun className="h-5 w-5 text-amber-500 drop-shadow-lg" />
                   : <Moon className="h-5 w-5 text-indigo-600 drop-shadow-lg" />}
               </Button>
             </motion.div>

             {/* USER MENU */}
              {isAuthenticated ? (
                <Link to="/profile">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      className="relative rounded-2xl border border-violet-300/30 dark:border-violet-700/30 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-fuchsia-500/10 transition-all duration-300 shadow-lg shadow-violet-500/5 overflow-hidden group px-4 mirror-shine"
                    >
                      {/* Avatar with green pulse rings */}
                      <div className="relative w-8 h-8 mr-2">
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400" style={{ animation: 'navGreenPulse 1s ease-in-out infinite' }} />
                        <div className="absolute rounded-full border-2 border-emerald-500" style={{ inset: 2, animation: 'navGreenPulse 1s ease-in-out infinite 0.5s' }} />
                        <div className="absolute rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center" style={{ inset: 4 }}>
                          {profilePhoto ? (
                            <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Crown className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                      <span className="font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent relative z-10">{user?.firstName}</span>
                      <Sparkles className="ml-1 h-3 w-3 text-amber-500 animate-pulse" />
                    </Button>
                  </motion.div>
                </Link>
             ) : (
               <Link to="/login">
                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                   <button className="btn-mirror mirror-shine rounded-2xl px-6 py-3 text-white flex items-center gap-2">
                     <span className="relative z-10 flex items-center gap-2">
                       <LogIn className="h-5 w-5" />
                       Connexion
                       <Sparkles className="h-4 w-4 animate-pulse" />
                     </span>
                   </button>
                 </motion.div>
               </Link>
             )}

             {isAuthenticated && (
               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <Button 
                   variant="ghost" 
                   onClick={logout}
                   className="rounded-2xl text-rose-500 hover:text-rose-600 hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-pink-500/10 transition-all duration-300 font-bold"
                 >
                   <LogOut className="mr-2 h-4 w-4" />
                   Déconnexion
                 </Button>
               </motion.div>
             )}
           </div>

            {/* ================= MOBILE HEADER ================= */}
            <div className="lg:hidden flex items-center gap-2">
             
             {/* Profile button - tablette: photo + nom, mobile: photo seulement */}
             {isAuthenticated && (
               <Link to="/profile">
                 <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                   <Button 
                     variant="outline" 
                     className="relative rounded-2xl border border-violet-300/30 dark:border-violet-700/30 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-fuchsia-500/10 transition-all duration-300 shadow-lg shadow-violet-500/5 overflow-hidden group px-2 md:px-4 mirror-shine"
                   >
                     {/* Avatar with green pulse rings */}
                     <div className="relative w-8 h-8">
                       <div className="absolute inset-0 rounded-full border-2 border-emerald-400" style={{ animation: 'navGreenPulse 1s ease-in-out infinite' }} />
                       <div className="absolute rounded-full border-2 border-emerald-500" style={{ inset: 2, animation: 'navGreenPulse 1s ease-in-out infinite 0.5s' }} />
                       <div className="absolute rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center" style={{ inset: 4 }}>
                         {profilePhoto ? (
                           <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <Crown className="h-3 w-3 text-white" />
                         )}
                       </div>
                     </div>
                     {/* Nom visible sur tablette, caché sur mobile */}
                     <span className="hidden md:inline-block md:ml-2 font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent relative z-10">{user?.firstName}</span>
                     <Sparkles className="hidden md:inline-block md:ml-1 h-3 w-3 text-amber-500 animate-pulse" />
                   </Button>
                 </motion.div>
               </Link>
             )}
             
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                 className="rounded-xl h-10 w-10 hover:bg-violet-500/10 transition-all duration-300"
               >
                 {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
               </Button>
             </motion.div>
           </div>

         </div>
 
         {/* MOBILE/TABLET MENU */}
       {isMobileMenuOpen && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="lg:hidden grid grid-cols-2 gap-3 sm:gap-4 pb-4 sm:pb-6 pt-2"
  >
    {isAuthenticated && (
      <>
         {/* DASHBOARD + THEME + NOTIFICATIONS */}
         <div className="col-span-2 flex items-center gap-2 sm:gap-3">
           <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
             <Button
               variant="outline"
               className="w-full py-4 sm:py-6 flex items-center justify-start gap-2 sm:gap-3 rounded-2xl border border-violet-300/30 dark:border-violet-700/30 shadow-lg shadow-violet-500/10 bg-gradient-to-r from-white/90 to-violet-50/80 dark:from-[#0a0020]/80 dark:to-violet-950/60 hover:scale-105 transition-all duration-300 mirror-shine"
             >
               <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30">
                 <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
               </div>
               <span className="font-bold text-sm sm:text-base text-violet-700 dark:text-violet-300 relative z-10">Dashboard</span>
             </Button>
           </Link>

           {/* Theme toggle */}
           <Button
             variant="outline"
             size="icon"
             onClick={toggleTheme}
             className="shrink-0 rounded-2xl h-12 w-12 sm:h-14 sm:w-14 border border-amber-300/30 dark:border-amber-700/30 bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all duration-300"
           >
             {theme === 'dark' ? <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-900" /> : <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-900" />}
           </Button>

           {/* RDV Notifications */}
           <div className="shrink-0">
             <RdvNotifications />
           </div>
         </div>

        {/* MESSAGES */}
        <Link to="/messages" onClick={() => setIsMobileMenuOpen(false)}>
          <Button
            variant="outline"
            className="w-full py-4 sm:py-6 flex items-center justify-start gap-2 sm:gap-3 rounded-2xl border border-blue-300/30 dark:border-blue-700/30 shadow-lg shadow-blue-500/10 bg-gradient-to-r from-white/90 to-blue-50/80 dark:from-[#0a0020]/80 dark:to-blue-950/60 hover:scale-105 transition-all duration-300 mirror-shine"
          >
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base text-blue-700 dark:text-blue-300 relative z-10">Messages</span>
            <div className="relative ml-auto">
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 shadow-lg shadow-red-500/40 animate-pulse text-xs sm:text-sm">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </Button>
        </Link>

         {/* DECONNEXION */}
         <div className="col-span-2 mt-2">
           <button
             className="w-full btn-mirror mirror-shine rounded-2xl text-white flex items-center justify-center gap-2 font-bold py-4 sm:py-6"
             onClick={() => {
               logout();
               setIsMobileMenuOpen(false);
             }}
           >
             <span className="relative z-10 flex items-center gap-2">
               <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
               Déconnexion
             </span>
           </button>
         </div>
      </>
    )}

    {!isAuthenticated && (
      <Link to="/login" className="col-span-2" onClick={() => setIsMobileMenuOpen(false)}>
        <button className="w-full py-4 sm:py-6 btn-mirror mirror-shine rounded-2xl text-white font-bold flex items-center justify-center gap-2">
          <span className="relative z-10 flex items-center gap-2">
            <LogIn className="h-5 w-5 sm:h-6 sm:w-6" />
            Connexion
          </span>
        </button>
      </Link>
    )}
  </motion.div>
)}

      </nav>
    </header>
    </>
  );
};
 
export default Navbar;
