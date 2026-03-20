/**
 * Utilitaires de sécurité complets pour le frontend
 * Inclut: XSS protection, validation, rate limiting, CSRF, sanitization
 */

// ===================
// SANITIZATION XSS
// ===================

/**
 * Nettoie une chaîne de caractères pour éviter les injections XSS
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .trim()
    .slice(0, 10000);
};

/**
 * Nettoie un objet récursivement
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T, maxDepth = 5): T => {
  const sanitize = (value: unknown, depth: number): unknown => {
    if (depth > maxDepth) return null;
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return sanitizeString(value);
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      return value.slice(0, 1000).map(item => sanitize(item, depth + 1));
    }
    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};
      const keys = Object.keys(value as Record<string, unknown>).slice(0, 100);
      for (const key of keys) {
        result[sanitizeString(key).slice(0, 100)] = sanitize((value as Record<string, unknown>)[key], depth + 1);
      }
      return result;
    }
    return value;
  };
  return sanitize(obj, 0) as T;
};

/**
 * Encode une URL de manière sécurisée
 */
export const safeEncodeURI = (input: string): string => {
  if (typeof input !== 'string') return '';
  return encodeURIComponent(sanitizeString(input).trim());
};

/**
 * Vérifie si une URL est sûre (pas de javascript:, data:, etc.)
 */
export const isSafeUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim().toLowerCase();
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:'
  ];
  
  return !dangerousProtocols.some(protocol => trimmedUrl.startsWith(protocol));
};

// ===================
// VALIDATION
// ===================

export const validators = {
  email: (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) && email.length <= 255;
  },
  
  phone: (phone: string): boolean => {
    const regex = /^[0-9+\-\s()]{6,20}$/;
    return regex.test(phone);
  },
  
  password: (password: string): boolean => {
    return typeof password === 'string' && password.length >= 6 && password.length <= 128;
  },
  
  text: (text: string, maxLength = 1000): boolean => {
    return typeof text === 'string' && text.length <= maxLength;
  },
  
  number: (num: unknown, min = -Infinity, max = Infinity): boolean => {
    const n = Number(num);
    return !isNaN(n) && isFinite(n) && n >= min && n <= max;
  },
  
  date: (date: string | Date): boolean => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  },
  
  url: (url: string): boolean => {
    try {
      new URL(url);
      return isSafeUrl(url);
    } catch {
      return false;
    }
  }
};

/**
 * Génère un ID unique sécurisé
 */
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Masque partiellement une donnée sensible
 */
export const maskSensitiveData = (data: string, visibleChars = 4): string => {
  if (typeof data !== 'string' || data.length <= visibleChars) return '****';
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
};

/**
 * Masque un email partiellement
 */
export const maskEmail = (email: string): string => {
  if (typeof email !== 'string' || !email.includes('@')) return '****@****.***';
  
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(Math.min(local.length - 2, 5)) + local.slice(-1)
    : '**';
  
  return `${maskedLocal}@${domain}`;
};

// ===================
// PASSWORD STRENGTH
// ===================

export const checkPasswordStrength = (password: string): {
  score: number;
  label: 'faible' | 'moyen' | 'fort' | 'très fort';
  suggestions: string[];
} => {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score++;
  else suggestions.push('Au moins 8 caractères');

  if (password.length >= 12) score++;
  
  if (/[a-z]/.test(password)) score++;
  else suggestions.push('Ajouter des minuscules');

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('Ajouter des majuscules');

  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Ajouter des chiffres');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else suggestions.push('Ajouter des caractères spéciaux');

  const labels: Record<number, 'faible' | 'moyen' | 'fort' | 'très fort'> = {
    0: 'faible',
    1: 'faible',
    2: 'faible',
    3: 'moyen',
    4: 'fort',
    5: 'très fort',
    6: 'très fort'
  };

  return {
    score,
    label: labels[Math.min(score, 6)],
    suggestions
  };
};

// ===================
// RATE LIMITER
// ===================

export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Nettoyer les anciennes tentatives
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRetryAfter(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    const oldestAttempt = Math.min(...attempts);
    return Math.max(0, Math.ceil((oldestAttempt + this.windowMs - now) / 1000));
  }
}

// ===================
// CSRF TOKEN
// ===================

export const generateCSRFToken = (): string => {
  return generateSecureId();
};

export const storeCSRFToken = (token: string): void => {
  sessionStorage.setItem('csrf_token', token);
};

export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === token;
};

// ===================
// SESSION SECURITY
// ===================

export const secureStorage = {
  set: (key: string, value: unknown): void => {
    try {
      const sanitizedValue = typeof value === 'string' ? sanitizeString(value) : JSON.stringify(value);
      localStorage.setItem(key, sanitizedValue);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch {
      return localStorage.getItem(key) as unknown as T;
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  }
};

// ===================
// INSTANCES GLOBALES
// ===================

export const globalRateLimiter = new RateLimiter(10, 60000);
export const authRateLimiter = new RateLimiter(5, 300000); // 5 tentatives en 5 min pour auth
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 req/min pour API

// ===================
// INPUT VALIDATION HOOK HELPER
// ===================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateForm = (data: Record<string, unknown>, rules: Record<string, { 
  required?: boolean; 
  type?: 'email' | 'phone' | 'password' | 'text' | 'number' | 'date' | 'url';
  maxLength?: number;
  min?: number;
  max?: number;
}>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} est requis`);
      continue;
    }
    
    if (value !== undefined && value !== null && value !== '') {
      const stringValue = String(value);
      
      switch (rule.type) {
        case 'email':
          if (!validators.email(stringValue)) errors.push(`${field} doit être un email valide`);
          break;
        case 'phone':
          if (!validators.phone(stringValue)) errors.push(`${field} doit être un téléphone valide`);
          break;
        case 'password':
          if (!validators.password(stringValue)) errors.push(`${field} doit contenir 6-128 caractères`);
          break;
        case 'number':
          if (!validators.number(value, rule.min, rule.max)) errors.push(`${field} doit être un nombre valide`);
          break;
        case 'text':
          if (!validators.text(stringValue, rule.maxLength)) errors.push(`${field} dépasse la longueur maximale`);
          break;
        case 'date':
          if (!validators.date(stringValue)) errors.push(`${field} doit être une date valide`);
          break;
        case 'url':
          if (!validators.url(stringValue)) errors.push(`${field} doit être une URL valide`);
          break;
      }
    }
  }
  
  return { isValid: errors.length === 0, errors };
};
