import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { KeyRound, Mail, ArrowLeft, Shield, CheckCircle, Crown, Fingerprint, Star, BarChart3, Users, Package, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPasswordRequest, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; newPassword?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPasswordChecker, setShowPasswordChecker] = useState(true); // Pour fermer le checker automatiquement

  const validatePassword = () => {
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    const hasMinLength = newPassword.length >= 6;
    
    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  };
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!email) { setErrors({ email: 'Veuillez entrer votre email' }); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: 'Veuillez entrer un email valide' }); return; }
    setIsLoading(true);
    const success = await resetPasswordRequest({ email });
    setIsLoading(false);
    if (success) setEmailVerified(true);
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword) { newErrors.newPassword = 'Veuillez entrer un nouveau mot de passe'; }
    else if (!validatePassword()) { newErrors.newPassword = 'Le mot de passe ne répond pas aux exigences de sécurité'; }
    if (!confirmPassword) { newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe'; }
    else if (newPassword !== confirmPassword) { newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'; }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setIsLoading(true);
    const success = await resetPassword({ email, newPassword, confirmPassword });
    setIsLoading(false);
    if (success) navigate('/login');
  };
  
  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
    if (isValid) setShowPasswordChecker(false); // Fermer automatiquement le checker
    else setShowPasswordChecker(true);           // Réouvrir si invalide
  };

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading text="Traitement en cours..." size="md" overlay={true} variant="default" />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Ultra-luxe animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
        
        {/* Animated glassmorphism orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, 40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-[100px]"
          />
          
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -60, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
              className="absolute w-1.5 h-1.5 bg-blue-300/40 rounded-full"
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
              Récupérez votre <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">compte</span>
            </h1>
            <p className="text-lg text-blue-200/60 mb-8 leading-relaxed">
              Réinitialisez votre mot de passe en toute sécurité et retrouvez l'accès à votre tableau de bord.
            </p>
          </motion.div>

          {/* RIGHT SIDE — Reset form */}
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-[2rem] blur-2xl" />
            
            <Card className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-white/[0.02] pointer-events-none" />
              
              <CardHeader className="text-center pb-8 pt-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-2xl blur-xl opacity-50 ${emailVerified ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} />
                    <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 ${
                      emailVerified 
                        ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-green-500' 
                        : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500'
                    }`}>
                      {emailVerified ? (
                        <CheckCircle className="h-10 w-10 text-white drop-shadow-lg" />
                      ) : (
                        <KeyRound className="h-10 w-10 text-white drop-shadow-lg" />
                      )}
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
                  {emailVerified ? 'Nouveau mot de passe' : 'Récupération'}
                </CardTitle>
                
                <CardDescription className="text-purple-200/70 text-base mt-2">
                  {emailVerified
                    ? "Créez un mot de passe sécurisé pour votre compte"
                    : "Saisissez votre email pour réinitialiser votre mot de passe"}
                </CardDescription>
              </CardHeader>
              
              {!emailVerified ? (
                <form onSubmit={handleEmailSubmit}>
                  <CardContent className="space-y-6 px-8">
                    <Label htmlFor="email" className="text-sm font-semibold text-purple-200/80 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      Adresse email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className={`h-14 bg-white/[0.06] border-white/[0.1] text-white rounded-xl ${errors.email ? "border-red-400/50" : ""}`}
                    />
                    {errors.email && <div className="text-red-400 text-sm">{errors.email}</div>}
                  </CardContent>
                  <CardFooter className="px-8 pb-10">
                    <Button type="submit" disabled={isLoading} className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold rounded-xl">
                      Envoyer le lien
                    </Button>
                  </CardFooter>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="space-y-6 px-8">
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-purple-200/80 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      Nouveau mot de passe
                    </Label>
                    <PasswordInput
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={errors.newPassword}
                      disabled={isLoading}
                      className="h-14 bg-white/[0.06] border-white/[0.1] text-white rounded-xl"
                    />
                    <PasswordStrengthChecker
                        password={newPassword}
                        onValidityChange={handlePasswordValidityChange}
                      />

                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-purple-200/80">
                      Confirmer le mot de passe
                    </Label>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      disabled={isLoading}
                      className="h-14 bg-white/[0.06] border-white/[0.1] text-white rounded-xl"
                    />
                  </CardContent>
                  <CardFooter className="px-8 pb-10">
                    <Button type="submit" disabled={isLoading || !isPasswordValid || !confirmPassword} className="w-full h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-bold rounded-xl">
                      Réinitialiser le mot de passe
                    </Button>
                  </CardFooter>
                </form>
              )}

              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;