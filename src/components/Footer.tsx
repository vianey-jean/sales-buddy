import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();
  const [sidebarWidth, setSidebarWidth] = React.useState(0);

  React.useEffect(() => {
    const updateSidebarWidth = () => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        const marginLeft = window.getComputedStyle(mainContent).marginLeft;
        setSidebarWidth(parseInt(marginLeft) || 0);
      }
    };
    
    updateSidebarWidth();
    const resizeObserver = new ResizeObserver(updateSidebarWidth);
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      resizeObserver.observe(mainContent);
    }
    
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <footer 
      className="relative bg-gradient-to-br from-[#030014] via-[#0a0020] to-[#0e0030] text-white mt-auto overflow-hidden transition-all duration-500"
      style={{ marginLeft: `${sidebarWidth}px` }}
    >
      {/* Mirror top reflection */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Luxury background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-violet-500/8 rounded-full blur-[180px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
                <Sparkles className="w-6 h-6 text-white relative z-10" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gestion Vente
              </span>
            </div>

            <p className="text-white/50 leading-relaxed mb-6">
              Solution innovante pour une gestion moderne et efficace de vos ventes et inventaires. 
Optimisez votre activité grâce à une technologie performante, élégante et pensée pour simplifier la gestion de votre business.
            </p>

            <div className="flex items-center gap-2 text-sm text-white/40">
              <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
              Fait avec passion à La Réunion
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-4">
              {[
                { label: 'Accueil', to: '/' },
                { label: 'À propos', to: '/about' },
                 { label: 'Contact', to: '/contact' },
                // { label: 'Rendez-Vous', to: '/rdv' },
                // { label: 'Commandes', to: '/commandes' },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-3 text-white/50 hover:text-white transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 group-hover:scale-150 transition-transform" />
                    <span className="relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-purple-400 after:to-pink-400 after:transition-all group-hover:after:w-full">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent tracking-wide">
              Nos Services
            </h3>
            <ul className="space-y-4 text-white/50">
              {[
                'Gestion des ventes',
                "Suivi d'inventaire",
                'Rapports analytiques',
                'Support',
              ].map((service, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent tracking-wide">
              Contactez-nous
            </h3>
            <div className="space-y-5">
              {[
                {
                  icon: MapPin,
                  title: 'Notre siège',
                  content: (
                    <>
                      10 Allée des Beryls Bleus<br />
                      Bellepierre<br />
                      97400, Saint-Denis
                    </>
                  ),
                  gradient: 'from-purple-500 to-pink-500',
                },
                {
                  icon: Mail,
                  title: 'Email',
                  content: 'vianey.jean@ymail.com',
                  gradient: 'from-blue-500 to-indigo-500',
                },
                {
                  icon: Phone,
                  title: 'Téléphone',
                  content: '+262 6 92 84 23 70',
                  gradient: 'from-green-500 to-emerald-500',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`relative p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
                    <item.icon className="w-5 h-5 text-white relative z-10" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} Gestion Vente. Tous droits réservés.
            </p>

            <div className="flex items-center gap-4 text-xs text-white/30">
              <span>Conditions</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Confidentialité</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>Mentions légales</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              'Version 5.0.0 - Système opérationnel',
              'Créé par Jean Rabemanalina',
            ].map((text, i) => (
              <div
                key={i}
                className="relative px-4 py-1.5 rounded-full bg-white/[0.04] backdrop-blur border border-white/[0.06] text-xs text-white/40 flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse relative z-10" />
                <span className="relative z-10">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
