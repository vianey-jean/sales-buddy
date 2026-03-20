import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import PremiumLoading from '@/components/ui/premium-loading';
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp } from 'lucide-react';
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading text="Bienvenue sur Gestion Ventes" size="xl" overlay variant="default" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* ================= HERO ================= */}
        <div className="relative min-h-screen flex items-center bg-gradient-to-br from-[#030014] via-[#0a0020] to-[#0e0030]">
          {/* LUXURY GLOW */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-600/25 rounded-full blur-[160px]" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[160px]" />
            <div className="absolute top-40 left-1/2 w-[30rem] h-[30rem] bg-purple-500/15 rounded-full blur-[180px] -translate-x-1/2" />
          </div>

          {/* Mirror reflection overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 text-center">
            {/* Mirror glass badge */}
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full mirror-glass border border-white/[0.12] text-sm text-white shadow-lg mb-8">
              ✨ Solution premium de gestion commerciale
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
            >
              Gestion de vente
              <span className="block mt-3 text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text">
                Simplifiée. Puissante. Élégante.
              </span>
            </motion.h1>

            <p className="mt-8 max-w-3xl mx-auto text-lg sm:text-xl text-white/70 leading-relaxed">
              Une plateforme moderne pensée pour les entrepreneurs exigeants.
              Pilotez vos ventes, stocks et profits avec précision et élégance.
            </p>

            {!isAuthenticated && (
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  className="btn-mirror mirror-shine group px-10 py-4 text-lg text-white"
                  onClick={() => navigate('/register')}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Commencer gratuitement
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <Button
                  variant="outline"
                  className="px-10 py-4 text-lg rounded-2xl font-semibold border-white/20 text-white bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.08] hover:shadow-xl transition-all hover:scale-105"
                  onClick={() => navigate('/login')}
                >
                  Se connecter
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ================= FEATURES ================= */}
        <div className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold mb-4">
                Fonctionnalités premium
              </span>
              <h2 className="text-4xl font-bold text-foreground">
                Pensé pour la performance
              </h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                Des outils puissants, une interface raffinée, une expérience fluide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { icon: BarChart3, title: "Suivi en temps réel", color: "from-blue-500 to-indigo-500" },
                { icon: Shield, title: "Gestion intelligente", color: "from-purple-500 to-fuchsia-500" },
                { icon: Zap, title: "Rapports avancés", color: "from-indigo-500 to-blue-500" },
                { icon: TrendingUp, title: "Analyse des profits", color: "from-emerald-500 to-green-500" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group relative card-mirror-light dark:card-mirror p-8 mirror-shine hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Une expérience optimisée pour une gestion fluide, précise et orientée croissance.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= CTA ================= */}
        <div className="relative py-24 bg-gradient-to-r from-[#030014] via-[#0a0020] to-[#0e0030] text-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-purple-600/25 rounded-full blur-[160px]" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/25 rounded-full blur-[160px]" />
          </div>
          {/* Mirror reflection */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.02] to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white mb-6">
              Passez au niveau supérieur
            </h2>
            <p className="text-xl text-white/70 mb-12">
              Rejoignez une nouvelle génération de gestion commerciale premium.
            </p>

            {!isAuthenticated && (
              <button
                className="btn-mirror mirror-shine group px-12 py-4 text-lg text-white"
                onClick={() => navigate('/register')}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Démarrer maintenant
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
