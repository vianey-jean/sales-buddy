
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LoginCredentials, PasswordResetData, PasswordResetRequest, RegistrationData, User } from '../types';
import { authService } from '../service/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  isVerified: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (data: RegistrationData) => Promise<boolean>;
  checkEmail: (email: string) => Promise<boolean>;
  resetPasswordRequest: (data: PasswordResetRequest) => Promise<boolean>;
  resetPassword: (data: PasswordResetData) => Promise<boolean>;
  verifySession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  // CRITICAL: Verify session against database
  const verifySession = useCallback(async (): Promise<boolean> => {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsVerified(false);
      return false;
    }

    try {
      // Fast verification against database
      const response = await authService.verifyToken();
      
      if (response && response.user) {
        setUser(response.user);
        setToken(storedToken);
        setIsVerified(true);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      } else {
        // User not found in database - clear session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsVerified(false);
        return false;
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      // Clear invalid session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setIsVerified(false);
      return false;
    }
  }, []);

  // CRITICAL: Verify session on app startup - MUST check database
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        // MANDATORY: Verify account exists in database before allowing access
        const verified = await verifySession();
        
        if (!verified) {
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [verifySession, toast]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Login performs database verification on server
      const result = await authService.login(credentials);
      
      if (result && result.user && result.token) {
        // Double-check: Verify the user profile is complete
        if (!result.user.id || !result.user.email || !result.user.firstName || !result.user.lastName) {
          toast({
            title: "Erreur de profil",
            description: "Profil utilisateur incomplet dans la base de données",
            variant: "destructive",
          });
          return false;
        }
        
        setUser(result.user);
        setToken(result.token);
        setIsVerified(true);
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${result.user.firstName} ${result.user.lastName}`,
          className: "bg-green-600 text-white border-green-600",
        });
        return true;
      } else {
        toast({
          title: "Échec de la connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Une erreur s'est produite lors de la connexion";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsVerified(false);
    authService.setCurrentUser(null);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
      className: "bg-red-800 text-white border-red-800",
    });

    // Redirect to login page after logout
    window.location.href = '/login';
  };

  const register = async (data: RegistrationData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Préparer les données d'inscription
      const registerData = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        address: data.address,
        phone: data.phone,
        acceptTerms: data.acceptTerms,
      };
      
      console.log('📝 Envoi des données d\'inscription au backend:', { ...registerData, password: '***', confirmPassword: '***' });
      
      const result = await authService.register(registerData);
      
      console.log('✅ Réponse du backend:', result);
      
      if (result && result.user) {
        // Ne pas stocker la session après inscription - l'utilisateur doit se connecter
        // Supprimer le token et user du localStorage pour forcer la connexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Réinitialiser l'état local
        setUser(null);
        setToken(null);
        setIsVerified(false);
        
        console.log('✅ Compte créé avec succès, redirection vers login');
        return true;
      } else {
        toast({
          title: "Échec de l'inscription",
          description: "Cet email est déjà utilisé",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);

      const apiData = error?.response?.data;
      const apiDetails = Array.isArray(apiData?.details) ? apiData.details.join(' • ') : null;
      const message = apiData?.message || apiDetails || "Une erreur s'est produite lors de l'inscription";

      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    }
  };

  const checkEmail = async (email: string): Promise<boolean> => {
    try {
      const result = await authService.checkEmail(email);
      return result.exists;
    } catch {
      return false;
    }
  };

  const resetPasswordRequest = async (data: PasswordResetRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authService.resetPasswordRequest(data);
      
      if (!result.exists) {
        toast({
          title: "Échec de la réinitialisation",
          description: "Cet email n'existe pas dans notre système",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Email vérifié",
        description: "Vous pouvez maintenant créer un nouveau mot de passe",
        className: "bg-green-600 text-white border-green-600",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: PasswordResetData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authService.resetPassword({
        email: data.email,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      
      if (result.success) {
        toast({
          title: "Réinitialisation réussie",
          description: "Votre mot de passe a été réinitialisé avec succès",
          className: "bg-green-600 text-white border-green-600",
        });
        return true;
      } else {
        toast({
          title: "Échec de la réinitialisation",
          description: "Le nouveau mot de passe doit être différent de l'ancien",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Une erreur s'est produite lors de la réinitialisation";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user && isVerified,
    isLoading,
    token,
    isVerified,
    login,
    logout,
    register,
    checkEmail,
    resetPasswordRequest,
    resetPassword,
    verifySession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
