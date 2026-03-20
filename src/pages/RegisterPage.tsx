import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { UserPlus, Mail, User, Phone, MapPin, Shield, Sparkles, Crown, Fingerprint, KeyRound, Star, BarChart3, Users, Package, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, checkEmail } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPasswordChecker, setShowPasswordChecker] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    if (name === 'email') {
      setIsEmailValid(true);
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });

    if (errors.gender) {
      setErrors({
        ...errors,
        gender: '',
      });
    }
  };

  const validateEmail = async () => {
    if (!formData.email) {
      setIsEmailValid(true);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Veuillez entrer un email valide',
      }));
      setIsEmailValid(false);
      return;
    }

    setIsEmailChecking(true);
    const emailExists = await checkEmail(formData.email);
    setIsEmailChecking(false);

    if (emailExists) {
      setErrors(prev => ({
        ...prev,
        email: 'Cet email est déjà utilisé',
      }));
      setIsEmailValid(false);
      toast({
        title: "Email déjà utilisé",
        description: "Veuillez utiliser une autre adresse email.",
        variant: "destructive"
      });
    } else {
      setIsEmailValid(true);
      setErrors(prev => ({
        ...prev,
        email: '',
      }));
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (formData.email && formData.email.includes('@')) {
        validateEmail();
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [formData.email]);

  const validatePassword = () => {
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    const hasMinLength = formData.password.length >= 6;

    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.trim();
    const regex = /^[0-9+\-\s()]{6,20}$/;
    return regex.test(cleaned);
  };

  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
    setShowPasswordChecker(!isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
    if (!formData.email) newErrors.email = "L'email est requis";
    if (!formData.gender) newErrors.gender = 'Le genre est requis';
    if (!formData.address) newErrors.address = "L'adresse est requise";
    if (!formData.phone) newErrors.phone = 'Le téléphone est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Veuillez entrer un numéro de téléphone valide (au moins 6 caractères).';
    }

    if (formData.password && !validatePassword()) {
      newErrors.password = 'Le mot de passe ne répond pas aux exigences de sécurité';
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    if (!isEmailValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender as 'male' | 'female' | 'other',
        address: formData.address,
        phone: formData.phone.trim(),
        acceptTerms: formData.acceptTerms,
      });

      if (success) {
        toast({
          title: "Compte créé avec succès !",
          description: "Vous pouvez maintenant vous connecter avec vos identifiants.",
          className: "bg-green-600 text-white border-green-600",
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);

      const apiData = error?.response?.data;
      const apiDetails = Array.isArray(apiData?.details) ? apiData.details.join(' • ') : null;
      const message = apiData?.message || apiDetails || "Une erreur s'est produite lors de la création du compte";

      toast({
        title: "Erreur d'inscription",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.gender &&
    formData.address &&
    formData.phone &&
    formData.password &&
    formData.confirmPassword &&
    formData.acceptTerms &&
    isEmailValid &&
    isPasswordValid &&
    !isEmailChecking &&
    Object.keys(errors).filter(key => errors[key]).length === 0;

  if (isSubmitting) {
    return (
      <Layout>
        <PremiumLoading 
          text="Création du compte..."
          size="lg"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  const inputClasses = (hasError: boolean) => `relative h-12 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-purple-300/30 rounded-xl transition-all duration-300 focus:bg-white/[0.1] focus:border-purple-400/50 ${hasError ? "border-red-400/50" : ""}`;

  return (
    <Layout>
      <div className="min-h-screen relative flex items-center justify-center p-4 py-12 overflow-hidden">
       {/* Ultra-luxe animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950" />
        
        {/* Animated glassmorphism orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/6 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, 40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-full blur-[100px]"
          />
          
          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -60, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 6 + i * 1.5, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
              className="absolute w-1.5 h-1.5 bg-purple-300/40 rounded-full"
              style={{ left: `${10 + i * 11}%`, top: `${15 + i * 8}%` }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-6xl z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
        >
          {/* LEFT SIDE — Project description (Facebook-style) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-shrink-0 text-center lg:text-left max-w-md lg:max-w-sm"
          >
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
              Rejoignez <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">notre espace</span>
            </h1>
            <p className="text-lg text-purple-200/60 mb-8 leading-relaxed">
              Créez votre compte et accédez à un outil complet de gestion de ventes, produits et comptabilité.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BarChart3, label: 'Dashboard', desc: 'Vue d\'ensemble' },
                { icon: Users, label: 'Clients', desc: 'Gestion CRM' },
                { icon: Package, label: 'Inventaire', desc: 'Stock temps réel' },
                { icon: TrendingUp, label: 'Rapports', desc: 'Analyses détaillées' },
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

          {/* RIGHT SIDE — Register form */}
          <div className="relative w-full max-w-2xl flex-1">
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-[2rem] blur-2xl" />
            
            <Card className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
              {/* Top shimmer line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
              
              {/* Mirror reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-white/[0.02] pointer-events-none" />
              
              <CardHeader className="text-center pb-6 pt-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                  className="flex justify-center mb-4"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-3xl blur-xl opacity-50" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                      <UserPlus className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Crown className="h-3.5 w-3.5 text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center"
                    >
                      <Star className="h-3 w-3 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <CardTitle className="text-2xl font-bold text-white drop-shadow-lg">
                  Créer un compte
                </CardTitle>
                <CardDescription className="text-purple-200/70 text-base mt-1">
                  Rejoignez-nous et découvrez toutes nos fonctionnalités
                </CardDescription>
                
                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-purple-300/60">
                    <Shield className="h-3 w-3" />
                    <span>Sécurisé</span>
                  </div>
                  <div className="w-1 h-1 bg-purple-400/30 rounded-full" />
                  <div className="flex items-center gap-1.5 text-xs text-purple-300/60">
                    <KeyRound className="h-3 w-3" />
                    <span>Chiffré</span>
                  </div>
                  <div className="w-1 h-1 bg-purple-400/30 rounded-full" />
                  <div className="flex items-center gap-1.5 text-xs text-purple-300/60">
                    <Fingerprint className="h-3 w-3" />
                    <span>Protégé</span>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 px-6 sm:px-8">

                  {/* Personal Info */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/20">
                        <User className="h-4 w-4 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold text-purple-200/80">
                          Prénom
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="Jean"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={inputClasses(!!errors.firstName)}
                          />
                        </div>
                        {errors.firstName && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            {errors.firstName}
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold text-purple-200/80">
                          Nom
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Dupont"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={inputClasses(!!errors.lastName)}
                          />
                        </div>
                        {errors.lastName && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            {errors.lastName}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-purple-200/80 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-400" />
                        Adresse email
                      </Label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="exemple@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={validateEmail}
                          disabled={isEmailChecking}
                          className={inputClasses(!!errors.email)}
                        />
                      </div>
                      {errors.email && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {errors.email}
                        </motion.div>
                      )}
                      {isEmailChecking && (
                        <span className="text-sm text-purple-400 flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin inline-block"></span>
                          Vérification de l'email...
                        </span>
                      )}
                    </div>

                    {/* Gender & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-semibold text-purple-200/80">
                          Genre
                        </Label>
                        <Select value={formData.gender} onValueChange={handleSelectChange}>
                          <SelectTrigger className={`h-12 bg-white/[0.06] border-white/[0.1] text-white rounded-xl transition-all duration-300 focus:bg-white/[0.1] focus:border-purple-400/50 ${errors.gender ? "border-red-400/50" : ""}`}>
                            <SelectValue placeholder="Sélectionnez votre genre" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900/95 backdrop-blur-2xl border border-white/[0.1] text-white">
                            <SelectItem value="male">Homme</SelectItem>
                            <SelectItem value="female">Femme</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            {errors.gender}
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-purple-200/80 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-purple-400" />
                          Téléphone
                        </Label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+33 6 12 34 56 78"
                            value={formData.phone}
                            onChange={handleChange}
                            className={inputClasses(!!errors.phone)}
                          />
                        </div>
                        {errors.phone && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            {errors.phone}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-semibold text-purple-200/80 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        Adresse
                      </Label>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                        <Input
                          id="address"
                          name="address"
                          placeholder="123 Rue de Paris, 75001 Paris"
                          value={formData.address}
                          onChange={handleChange}
                          className={inputClasses(!!errors.address)}
                        />
                      </div>
                      {errors.address && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-sm">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {errors.address}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-500/20">
                        <Shield className="h-4 w-4 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Sécurité du compte</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-purple-200/80">
            Mot de passe
          </Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            className="h-12 bg-white/[0.06] border-white/[0.1] text-white rounded-xl"
          />
          <PasswordStrengthChecker 
              password={formData.password} 
              onValidityChange={handlePasswordValidityChange}
            />
        </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-purple-200/80">
                          Confirmer le mot de passe
                        </Label>
                        <PasswordInput
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          error={errors.confirmPassword}
                          className="h-12 bg-white/[0.06] border-white/[0.1] text-white rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-white/[0.04] rounded-xl border border-white/[0.08]">
                      <Checkbox
                        id="acceptTerms"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            acceptTerms: checked as boolean,
                          })
                        }
                        className="mt-1 border-purple-400/50"
                      />
                      <Label
                        htmlFor="acceptTerms"
                        className={`text-sm leading-relaxed cursor-pointer ${
                          errors.acceptTerms ? "text-red-400" : "text-purple-200/70"
                        }`}
                      >
                        J'accepte les{" "}
                        <Link to="/terms" className="text-purple-400 hover:text-purple-300 underline">
                          conditions générales d'utilisation
                        </Link>{" "}
                        et la{" "}
                        <Link to="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                          politique de confidentialité
                        </Link>
                      </Label>
                    </div>
                  </div>

                </CardContent>

                <CardFooter className="flex flex-col space-y-5 px-6 sm:px-8 pb-10">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-bold text-lg rounded-xl shadow-[0_20px_40px_rgba(139,92,246,0.3)] hover:shadow-[0_25px_50px_rgba(139,92,246,0.4)] transform hover:scale-[1.02] transition-all duration-300 border border-white/10 flex items-center justify-center gap-3"
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isEmailChecking ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Vérification...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Créer mon compte
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-purple-200/60 text-base flex items-center justify-center gap-2">
                      Déjà membre?
                      <Link
                        to="/login"
                        className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
                      >
                        Se Connecter
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </form>
              
              {/* Bottom shimmer line */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent" />
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
