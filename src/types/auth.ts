// Types pour l'authentification

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  phone?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  acceptTerms: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
