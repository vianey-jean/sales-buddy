import { z } from 'zod';

/**
 * Schémas de validation Zod pour sécuriser les entrées
 */

// Validation des chaînes de caractères sécurisées
const safeString = (minLength = 1, maxLength = 255) => 
  z.string()
    .trim()
    .min(minLength, { message: `Minimum ${minLength} caractère${minLength > 1 ? 's' : ''}` })
    .max(maxLength, { message: `Maximum ${maxLength} caractères` })
    .refine(val => !/<script|javascript:|on\w+=/i.test(val), {
      message: 'Contenu non autorisé détecté'
    });

// Schéma pour les emails
export const emailSchema = z.string()
  .trim()
  .email({ message: 'Adresse email invalide' })
  .max(255, { message: 'Email trop long' })
  .transform(val => val.toLowerCase());

// Schéma pour les numéros de téléphone
export const phoneSchema = z.string()
  .trim()
  .min(10, { message: 'Numéro de téléphone invalide' })
  .max(20, { message: 'Numéro de téléphone trop long' })
  .regex(/^[+\d\s\-().]+$/, { message: 'Format de téléphone invalide' });

// Schéma pour les mots de passe
export const passwordSchema = z.string()
  .min(8, { message: 'Minimum 8 caractères' })
  .max(128, { message: 'Maximum 128 caractères' })
  .regex(/[A-Z]/, { message: 'Au moins une majuscule requise' })
  .regex(/[a-z]/, { message: 'Au moins une minuscule requise' })
  .regex(/[0-9]/, { message: 'Au moins un chiffre requis' });

// Schéma pour les montants
export const amountSchema = z.number()
  .min(0, { message: 'Le montant ne peut pas être négatif' })
  .max(999999999, { message: 'Montant trop élevé' })
  .finite({ message: 'Montant invalide' });

// Schéma pour les quantités
export const quantitySchema = z.number()
  .int({ message: 'La quantité doit être un entier' })
  .min(0, { message: 'La quantité ne peut pas être négative' })
  .max(999999, { message: 'Quantité trop élevée' });

// Schéma pour les IDs
export const idSchema = z.string()
  .trim()
  .min(1, { message: 'ID requis' })
  .max(100, { message: 'ID trop long' })
  .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Format d\'ID invalide' });

// Schéma pour les dates
export const dateSchema = z.string()
  .refine(val => !isNaN(Date.parse(val)), {
    message: 'Date invalide'
  });

// Schémas pour les entités

export const clientSchema = z.object({
  nom: safeString(2, 100),
  phone: phoneSchema,
  adresse: safeString(5, 500)
});

export const productSchema = z.object({
  description: safeString(2, 500),
  purchasePrice: amountSchema,
  quantity: quantitySchema
});

export const saleProductSchema = z.object({
  productId: idSchema,
  description: safeString(1, 500),
  purchasePrice: amountSchema,
  sellingPrice: amountSchema,
  quantitySold: quantitySchema.min(1, { message: 'Minimum 1 unité' }),
  profit: z.number()
});

export const saleSchema = z.object({
  clientNom: safeString(2, 100).optional(),
  clientPhone: phoneSchema.optional(),
  products: z.array(saleProductSchema).min(1, { message: 'Au moins un produit requis' }),
  date: dateSchema,
  totalAmount: amountSchema,
  totalProfit: z.number()
});

export const messageSchema = z.object({
  expediteurNom: safeString(2, 100),
  expediteurEmail: emailSchema,
  expediteurTelephone: phoneSchema.optional(),
  sujet: safeString(3, 200),
  contenu: safeString(10, 5000)
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Mot de passe requis' })
});

export const registerSchema = z.object({
  nom: safeString(2, 100),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

// Types exportés
export type ClientInput = z.infer<typeof clientSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
