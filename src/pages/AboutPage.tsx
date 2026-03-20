import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { Users, Target, Lightbulb, Award, ArrowRight } from 'lucide-react';

const AboutPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading 
          text="Découvrez Notre Histoire"
          size="lg"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero section */}
        <div className="relative bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 py-12 sm:py-16 md:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-float"></div>
            <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-float" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative container mx-auto px-3 sm:px-4 md:px-6 text-center">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full text-white/90 text-sm font-semibold mb-5 border border-white/30 shadow-md">
              🚀 Notre Histoire
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                À propos de
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 bg-clip-text text-transparent">
                Gestion Vente
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-lg">
              Nous révolutionnons la gestion commerciale avec des solutions innovantes, 
              intuitives et puissantes pour les entrepreneurs modernes.
            </p>
          </div>
        </div>

        {/* Mission section */}
        <div className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-50 via-gray-100 to-white">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16 md:mb-20">
                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-900 rounded-full text-sm font-semibold mb-4 shadow-md">
                  Notre Mission
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-4 tracking-tight">
                  Transformer la gestion commerciale
                </h2>
              </div>

              <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 mb-16 backdrop-blur-md">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
                      Simplifier pour mieux réussir
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      Notre mission est de fournir un outil de gestion révolutionnaire qui permet aux entreprises 
                      de toutes tailles de prospérer dans l'économie moderne. Nous croyons que la simplicité 
                      et l'innovation sont les clés du succès commercial.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Chaque fonctionnalité est pensée pour vous faire gagner du temps, optimiser vos processus 
                      et maximiser votre rentabilité.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-full h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Target className="h-24 w-24 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Values section */}
              <div className="mb-20">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Nos valeurs fondamentales</h2>
                  <p className="text-xl text-gray-700 max-w-3xl mx-auto drop-shadow-sm">
                    Ces principes guident chacune de nos décisions et innovations
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {icon: Lightbulb, title: 'Simplicité', colorFrom: 'blue-500', colorTo: 'blue-600', desc: 'Interfaces intuitives qui ne nécessitent aucune formation complexe pour être maîtrisées.'},
                    {icon: ArrowRight, title: 'Efficacité', colorFrom: 'purple-500', colorTo: 'purple-600', desc: 'Optimisation de chaque processus pour maximiser votre productivité quotidienne.'},
                    {icon: Award, title: 'Fiabilité', colorFrom: 'green-500', colorTo: 'emerald-500', desc: 'Sécurité maximale et disponibilité constante de vos données critiques.'},
                    {icon: Users, title: 'Innovation', colorFrom: 'pink-500', colorTo: 'red-500', desc: 'Amélioration continue avec les dernières technologies pour rester à la pointe.'}
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                        <div className={`w-16 h-16 bg-gradient-to-r from-${item.colorFrom} to-${item.colorTo} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                          <Icon className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Features showcase */}
              <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 rounded-3xl p-12 text-white shadow-2xl">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Fonctionnalités de pointe</h2>
                  <p className="text-xl text-white/80 max-w-3xl mx-auto drop-shadow-sm">
                    Une suite complète d'outils professionnels pour transformer votre activité
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    'Suivi des ventes en temps réel',
                    'Gestion d\'inventaire intelligente',
                    'Calcul automatique des bénéfices',
                    'Rapports mensuels détaillés',
                    'Exportation de données en PDF',
                    'Interface responsive multi-appareils'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-md">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-4 animate-pulse"></div>
                      <span className="text-white/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team section */}
              <div className="mt-24 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Notre équipe passionnée</h2>
                <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 backdrop-blur-md">
                  <p className="text-lg text-gray-700 leading-relaxed mb-8 drop-shadow-sm">
                    Derrière Gestion Vente se trouve une équipe de visionnaires : développeurs experts, 
                    designers créatifs et spécialistes du commerce qui collaborent pour créer 
                    la solution de gestion la plus avancée du marché.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed drop-shadow-sm">
                    Nous sommes constamment à l'écoute de nos utilisateurs pour anticiper leurs besoins 
                    et dépasser leurs attentes avec des innovations qui font la différence.
                  </p>
                </div>
              </div>

              {/* CTA section */}
              <div className="mt-24 text-center bg-gradient-to-r from-purple-700 via-pink-600 to-pink-500 rounded-3xl p-12 text-white shadow-xl">
                <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Prêt à révolutionner votre gestion?</h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-sm">
                  Que vous dirigiez une startup innovante ou une entreprise établie, 
                  Gestion Vente est l'outil qu'il vous faut pour conquérir de nouveaux marchés.
                </p>
                <div className="inline-block px-8 py-3 bg-white/20 backdrop-blur-lg rounded-full text-white/90 font-semibold border border-white/30 shadow-md hover:scale-105 transition-transform duration-300">
                  🎯 Démarrez votre transformation dès aujourd'hui
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
