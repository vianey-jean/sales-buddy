// Export centralisé de tous les types

// Types d'authentification
export type {
  User,
  LoginCredentials,
  RegisterCredentials,
  RegistrationData,
  PasswordResetRequest,
  PasswordResetData,
  AuthResponse,
} from './auth';

// Types de clients
export type {
  Client,
  ClientFormData,
  ClientSearchResult,
} from './client';

// Types de produits
export type {
  Product,
  ProductFormData,
} from './product';

// Types de ventes
export type {
  Sale,
  SaleProduct,
  SaleFormData,
} from './sale';

// Types de prêts
export type {
  PretDetail,
  PaiementDetail,
  PretFamille,
  PretProduit,
  PretFamilleFormData,
  PretProduitFormData,
} from './pret';

// Types de dépenses
export type {
  DepenseFixe,
  DepenseDuMois,
  DepenseFormData,
} from './depense';

// Types de commandes
export type {
  Commande,
  CommandeProduit,
  CommandeType,
  CommandeStatut,
  CommandeFormData,
} from './commande';
