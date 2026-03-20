/**
 * =============================================================================
 * DashboardPage - Page principale unifiée avec barre latérale
 * =============================================================================
 * 
 * Regroupe toutes les sections : Ventes, Commandes, RDV, Tendances,
 * Clients, Produits, Pointage dans une interface à sidebar ultra-luxe.
 * 
 * @module DashboardPage
 */

import React, { useState, Suspense, lazy } from 'react';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import PremiumLoading from '@/components/ui/premium-loading';
import {
  ShoppingCart,
  Package,
  CalendarDays,
  TrendingUp,
  Users,
  Box,
  Clock,
  Crown,
  Sparkles,
  Diamond,
  ChevronLeft,
  ChevronRight,
  Gem,
  Star,
  Menu,
  X,
} from 'lucide-react';
import tacheApi from '@/services/api/tacheApi';

// Lazy load embedded page components
const VentesContent = lazy(() => import('@/pages/VentesEmbedded'));
const CommandesPage = lazy(() => import('@/pages/CommandesPage'));
const RdvPage = lazy(() => import('@/pages/RdvPage'));
const ComptabiliteFinancesContent = lazy(() => import('@/components/dashboard/AdvancedDashboard'));
const ClientsPage = lazy(() => import('@/pages/ClientsPage'));
const ProduitsPage = lazy(() => import('@/pages/ProduitsPage'));
const PointagePage = lazy(() => import('@/pages/PointagePage'));

/** Configuration sidebar items */
interface SidebarItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  shadow: string;
  hoverBg: string;
  activeText: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'ventes',
    label: 'Ventes & Produits',
    shortLabel: 'Ventes',
    icon: ShoppingCart,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/30',
    hoverBg: 'hover:bg-violet-500/10',
    activeText: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'commandes',
    label: 'Commandes',
    shortLabel: 'Commandes',
    icon: Package,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
    hoverBg: 'hover:bg-emerald-500/10',
    activeText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'rdv',
    label: 'Rendez-vous',
    shortLabel: 'RDV',
    icon: CalendarDays,
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
    shadow: 'shadow-orange-500/30',
    hoverBg: 'hover:bg-orange-500/10',
    activeText: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'comptabilite',
    label: 'Comptabilité & Finances',
    shortLabel: 'Compta',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/30',
    hoverBg: 'hover:bg-cyan-500/10',
    activeText: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'clients',
    label: 'Clients',
    shortLabel: 'Clients',
    icon: Users,
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',
    shadow: 'shadow-pink-500/30',
    hoverBg: 'hover:bg-pink-500/10',
    activeText: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'produits',
    label: 'Produits',
    shortLabel: 'Produits',
    icon: Box,
    gradient: 'from-fuchsia-500 to-purple-600',
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    shadow: 'shadow-fuchsia-500/30',
    hoverBg: 'hover:bg-fuchsia-500/10',
    activeText: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    id: 'pointage',
    label: 'Pointage & Tâches',
    shortLabel: 'Pointage',
    icon: Clock,
    gradient: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    shadow: 'shadow-indigo-500/30',
    hoverBg: 'hover:bg-indigo-500/10',
    activeText: 'text-indigo-600 dark:text-indigo-400',
  },
];

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState('ventes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [tacheCount, setTacheCount] = useState(0);

  // Fetch tache count
  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await tacheApi.getAll();
        const todayStr = new Date().toISOString().split('T')[0];
        setTacheCount(res.data.filter((t: any) => !t.completed && t.date >= todayStr).length);
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Adjust main content margin for fixed sidebar on desktop
  React.useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (!isMobile && mainContent) {
      const sidebarWidth = sidebarCollapsed ? 80 : 288;
      mainContent.style.marginLeft = `${sidebarWidth}px`;
      return () => {
        mainContent.style.marginLeft = '0';
      };
    }
  }, [isMobile, sidebarCollapsed]);

  const activeItem = SIDEBAR_ITEMS.find(i => i.id === activeSection)!;

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    const fallback = <PremiumLoading text="Chargement..." size="lg" overlay={false} variant="default" />;

    switch (activeSection) {
      case 'ventes':
        return <Suspense fallback={fallback}><VentesContent /></Suspense>;
      case 'commandes':
        return <Suspense fallback={fallback}><CommandesPage embedded /></Suspense>;
      case 'rdv':
        return <Suspense fallback={fallback}><RdvPage embedded /></Suspense>;
      case 'comptabilite':
        return <Suspense fallback={fallback}><ComptabiliteFinancesContent /></Suspense>;
      case 'clients':
        return <Suspense fallback={fallback}><ClientsPage embedded /></Suspense>;
      case 'produits':
        return <Suspense fallback={fallback}><ProduitsPage embedded /></Suspense>;
      case 'pointage':
        return <Suspense fallback={fallback}><PointagePage embedded /></Suspense>;
      default:
        return <Suspense fallback={fallback}><VentesContent /></Suspense>;
    }
  };

  return (
    <Layout requireAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#030014] dark:via-[#0a0025] dark:to-[#0e0035]">

        {/* Mobile top bar */}
        {isMobile && (
          <div className="sticky top-16 z-40 px-3 pt-2 pb-1">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-2 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl"
            >
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/30 dark:border-violet-800/30"
              >
                {mobileMenuOpen ? <X className="h-5 w-5 text-violet-500" /> : <Menu className="h-5 w-5 text-violet-500" />}
                <span className="font-bold text-sm text-violet-600 dark:text-violet-400">{activeItem.shortLabel}</span>
              </button>
              <div className="flex-1 overflow-x-auto scrollbar-none">
                <div className="flex gap-1">
                  {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionChange(item.id)}
                        className={cn(
                          'flex-shrink-0 p-2 rounded-xl transition-all duration-300 relative',
                          isActive
                            ? `${item.iconBg} shadow-lg ${item.shadow}`
                            : 'bg-white/50 dark:bg-white/5'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-muted-foreground')} />
                        {item.id === 'pointage' && tacheCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                            {tacheCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Mobile dropdown menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden"
                >
                  <div className="p-2 grid grid-cols-2 gap-2">
                    {SIDEBAR_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSectionChange(item.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-3 rounded-xl transition-all duration-300 text-left',
                            isActive
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${item.shadow}`
                              : `bg-white/50 dark:bg-white/5 ${item.hoverBg}`
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                            isActive ? 'bg-white/20' : item.iconBg
                          )}>
                            <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-white')} />
                          </div>
                          <span className={cn('font-bold text-xs', isActive ? 'text-white' : 'text-foreground')}>
                            {item.shortLabel}
                          </span>
                          {item.id === 'pointage' && tacheCount > 0 && (
                            <Badge className="ml-auto bg-red-500 text-white border-0 text-[10px] px-1.5 py-0 animate-pulse">
                              {tacheCount}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex">
          {/* =================== DESKTOP SIDEBAR =================== */}
          {!isMobile && (
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={cn(
                'fixed top-16 left-0 h-[calc(100vh-4rem)] flex-shrink-0 transition-all duration-500 z-30',
                sidebarCollapsed ? 'w-20' : 'w-72'
              )}
            >
              <div className="h-full p-3">
                <div className="h-full rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl shadow-violet-500/5 flex flex-col overflow-hidden">

                  {/* Sidebar header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h2 className="text-sm font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                              Dashboard
                            </h2>
                            <p className="text-[10px] text-muted-foreground">Premium</p>
                          </div>
                          <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                        </motion.div>
                      )}
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-violet-500/10 transition-all duration-300 border border-white/20"
                      >
                        {sidebarCollapsed ? (
                          <ChevronRight className="h-4 w-4 text-violet-500" />
                        ) : (
                          <ChevronLeft className="h-4 w-4 text-violet-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Gradient decoration */}
                  <div className="h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

                  {/* Navigation items */}
                  <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-none">
                    {SIDEBAR_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;

                      return (
                        <motion.button
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSectionChange(item.id)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                            sidebarCollapsed ? 'p-3 justify-center' : 'px-4 py-3',
                            isActive
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl ${item.shadow}`
                              : `bg-transparent ${item.hoverBg}`
                          )}
                        >
                          {/* Mirror shine on active */}
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse pointer-events-none" />
                          )}

                          <div className={cn(
                            'flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-300',
                            sidebarCollapsed ? 'w-10 h-10' : 'w-9 h-9',
                            isActive
                              ? 'bg-white/20 shadow-inner'
                              : `${item.iconBg} shadow-lg ${item.shadow}`
                          )}>
                            <Icon className={cn(
                              'transition-all duration-300',
                              sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4',
                              'text-white'
                            )} />
                          </div>

                          {!sidebarCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex-1 text-left min-w-0"
                            >
                              <span className={cn(
                                'font-bold text-sm block truncate',
                                isActive ? 'text-white' : 'text-foreground'
                              )}>
                                {item.label}
                              </span>
                            </motion.div>
                          )}

                          {/* Badge for pointage */}
                          {item.id === 'pointage' && tacheCount > 0 && (
                            <Badge className={cn(
                              'bg-red-500 text-white border-0 animate-pulse text-[10px] px-1.5 py-0',
                              sidebarCollapsed && 'absolute -top-1 -right-1'
                            )}>
                              {tacheCount}
                            </Badge>
                          )}

                          {/* Active indicator */}
                          {isActive && !sidebarCollapsed && (
                            <div className="flex-shrink-0">
                              <Diamond className="h-3 w-3 text-white/70" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </nav>

                  {/* Sidebar footer */}
                  {!sidebarCollapsed && (
                    <div className="p-4 border-t border-white/10">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 border border-violet-200/20 dark:border-violet-800/20">
                        <Gem className="h-4 w-4 text-fuchsia-500" />

                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            Ultra Premium
                          </span>

                        </div>

                        <Star className="h-3 w-3 text-amber-500 ml-auto" />
                      </div>
                      <span className="text-[13px] font-bold text-blue-500">
                        Créé par Jean Rabemanalina en 2026
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}

          {/* =================== MAIN CONTENT =================== */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
