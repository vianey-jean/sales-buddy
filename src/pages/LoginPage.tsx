import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Shield,
  Fingerprint,
  KeyRound,
  Crown,
  BarChart3,
  Users,
  Package,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import SEOHead from '@/components/SEOHead';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, checkEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [userName, setUserName] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleEmailCheck = async () => {
    if (!email) {
      setErrors({ ...errors, email: 'Veuillez entrer votre email' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ ...errors, email: 'Veuillez entrer un email valide' });
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await axios.post(`${AUTH_BASE_URL}/api/auth/check-email`, { email });
      setIsCheckingEmail(false);

      if (response.data.exists) {
        setEmailExists(true);
        setShowPasswordField(true);
        setUserName(`${response.data.user.firstName} ${response.data.user.lastName}`);
      } else {
        setEmailExists(false);
        setShowPasswordField(false);
        setErrors({ ...errors, email: 'Ce profil n\'existe pas' });
      }
    } catch (error) {
      setIsCheckingEmail(false);
      setEmailExists(false);
      setShowPasswordField(false);
      setErrors({ ...errors, email: 'Une erreur s\'est produite' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Veuillez entrer votre email' }));
      return;
    }

    if (showPasswordField && !password) {
      setErrors(prev => ({ ...prev, password: 'Veuillez entrer votre mot de passe' }));
      return;
    }

    if (!showPasswordField) {
      await handleEmailCheck();
      return;
    }

    setIsLoggingIn(true);
    const success = await login({ email, password });
    if (success) {
      navigate('/dashboard');
    }
    setIsLoggingIn(false);
  };

  const [showPasswordChecker, setShowPasswordChecker] = useState(true);

  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
    if (isValid) setShowPasswordChecker(false);
    else setShowPasswordChecker(true);
  };

  if (isLoggingIn) {
    return (
      <Layout>
        <PremiumLoading
          text="Connexion en cours..."
          size="lg"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Connexion"
        description="Connectez-vous à votre espace Gestion Vente. Accédez à vos ventes, stocks et comptabilité en toute sécurité."
        canonical="https://riziky-boutic.vercel.app/login"
      />
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Ultra-luxe animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950" />

        {/* Animated glassmorphism orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, 40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-full blur-[100px]"
          />

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -60, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
              className="absolute w-1.5 h-1.5 bg-purple-300/40 rounded-full"
              style={{ left: `${15 + i * 15}%`, top: `${20 + i * 10}%` }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-5xl z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
        >
          {/* LEFT SIDE — Project description */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 text-center lg:text-left max-w-md"
          >
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
              Gestion des <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Ventes</span>
            </h1>
            <p className="text-lg text-purple-200/60 mb-8 leading-relaxed">
              Gérez vos ventes, produits, clients et comptabilité en toute simplicité. Un tableau de bord complet pour piloter votre activité.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BarChart3, label: 'Tableau de bord', desc: 'Statistiques en temps réel' },
                { icon: Users, label: 'Clients', desc: 'Gestion complète' },
                { icon: Package, label: 'Produits', desc: 'Stock & inventaire' },
                { icon: TrendingUp, label: 'Comptabilité', desc: 'Bénéfices & dépenses' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm"
                >
                  <item.icon className="h-5 w-5 text-purple-400 mb-1.5" />
                  <p className="text-sm font-bold text-white/90">{item.label}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SIDE — Login form */}
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-[2rem] blur-2xl" />

            <Card className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

              <CardHeader className="text-center pb-8 pt-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                      <Fingerprint className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Crown className="h-3 w-3 text-white" />
                    </motion.div>
                  </div>
                </motion.div>

                <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
                  Connexion
                </CardTitle>
                <CardDescription className="text-purple-200/70 text-base mt-2">
                  Accédez à votre espace personnel sécurisé
                </CardDescription>

                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-purple-300/60">
                    <Shield className="h-3 w-3" />
                    <span>Sécurisé</span>
                  </div>
                  <div className="w-1 h-1 bg-purple-400/30 rounded-full" />
                  <div className="flex items-center gap-1.5 text-xs text-purple-300/60">
                    <KeyRound className="h-3 w-3" />
                    <span>Chiffré</span>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 px-8">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-purple-200/80 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-400" />
                      Adresse email
                    </Label>
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemple@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setShowPasswordField(false);
                          setEmailExists(false);
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        onBlur={handleEmailCheck}
                        disabled={isCheckingEmail || showPasswordField}
                        className={`relative h-14 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-purple-300/30 rounded-xl transition-all duration-300 focus:bg-white/[0.1] focus:border-purple-400/50 ${
                          errors.email ? "border-red-400/50 focus:border-red-400/50" : ""
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        {errors.email}
                      </motion.div>
                    )}
                    {emailExists && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-400 text-sm">
                        <Sparkles className="h-4 w-4" />
                        Bienvenue {userName}
                      </motion.div>
                    )}
                  </div>

                  {showPasswordField && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-semibold text-purple-200/80">
                        Mot de passe
                      </Label>
                      <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        className="h-14 bg-white/[0.06] border-white/[0.1] text-white rounded-xl"
                      />

                      <PasswordStrengthChecker password={password} onValidityChange={handlePasswordValidityChange} />

                      <div className="text-sm text-right">
                        <Link to="/reset-password" className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors">
                          Mot de passe oublié?
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-row gap-3 px-8 pb-10">
                  <Button
                    type="submit"
                    className="flex-1 h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-bold text-base rounded-xl shadow-[0_20px_40px_rgba(139,92,246,0.3)] hover:shadow-[0_25px_50px_rgba(139,92,246,0.4)] transform hover:scale-[1.02] transition-all duration-300 border border-white/10"
                    disabled={isCheckingEmail || (showPasswordField && !isPasswordValid)}
                  >
                    {isCheckingEmail ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Vérification...
                      </>
                    ) : showPasswordField ? (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Se connecter
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Continuer
                      </>
                    )}
                  </Button>

                  <Link to="/register" className="flex-1">
                    <Button
                      type="button"
                      className="w-full h-14 bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold text-base rounded-xl border border-white/[0.12] hover:border-white/[0.2] shadow-lg transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                    >
                      Créer un compte
                    </Button>
                  </Link>
                </CardFooter>
              </form>

              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LoginPage;