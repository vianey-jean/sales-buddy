
# Guide de Sécurité

## Authentification et autorisation

### JWT (JSON Web Tokens)
```javascript
// Configuration JWT sécurisée
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET, // Secret fort généré aléatoirement
    { 
      expiresIn: '1h',        // Expiration courte
      issuer: 'gestion-commerciale',
      audience: 'app-users'
    }
  );
};

// Refresh token pour sessions longues
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};
```

### Hachage des mots de passe
```javascript
const bcrypt = require('bcrypt');

// Hachage avec salt fort
const hashPassword = async (password) => {
  const saltRounds = 12; // Coût élevé pour sécurité
  return await bcrypt.hash(password, saltRounds);
};

// Vérification sécurisée
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Validation de la force du mot de passe
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar;
};
```

## Validation et sanitisation

### Validation côté serveur
```javascript
const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');

// Middleware de validation
const validateInput = [
  // Validation email
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),

  // Validation mot de passe
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Mot de passe trop faible'),

  // Sanitisation des chaînes
  body('firstName')
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage('Prénom invalide'),

  // Validation des nombres
  body('price')
    .isFloat({ min: 0, max: 999999 })
    .withMessage('Prix invalide'),

  // Gestion des erreurs
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }
    next();
  }
];
```

### Protection XSS
```javascript
// Sanitisation des entrées
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: {}, // Aucun tag HTML autorisé
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  return input;
};

// Middleware de sanitisation
const sanitizeBody = (req, res, next) => {
  for (const key in req.body) {
    req.body[key] = sanitizeInput(req.body[key]);
  }
  next();
};
```

## Protection CSRF

### Configuration CSRF
```javascript
const csrf = require('csurf');

// Protection CSRF pour les formulaires
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Route pour obtenir le token CSRF
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

## Configuration CORS sécurisée

### CORS restrictif
```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://votre-domaine.com',
      'https://www.votre-domaine.com'
    ];
    
    // Permettre les requêtes sans origin (mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  maxAge: 86400 // Cache preflight 24h
};

app.use(cors(corsOptions));
```

## Rate Limiting

### Limitation de taux avancée
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Configuration Redis pour le rate limiting
const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite par IP
  message: {
    error: 'Trop de requêtes',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Limitation personnalisée par route
  keyGenerator: (req) => {
    return `${req.ip}:${req.route.path}`;
  }
});

// Rate limiting spécifique pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Seulement 5 tentatives de connexion
  skipSuccessfulRequests: true,
  message: {
    error: 'Trop de tentatives de connexion'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/', limiter);
```

## Headers de sécurité

### Configuration Helmet
```javascript
const helmet = require('helmet');

app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameAncestors: ["'none'"]
    }
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  
  // X-Frame-Options
  frameguard: { action: 'deny' },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

## Chiffrement des données

### Chiffrement des données sensibles
```javascript
const crypto = require('crypto');

class Encryption {
  constructor(secretKey) {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = crypto.scryptSync(secretKey, 'salt', 32);
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encData) {
    const decipher = crypto.createDecipher(
      this.algorithm,
      this.secretKey,
      Buffer.from(encData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encData.authTag, 'hex'));
    
    let decrypted = decipher.update(encData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## Logging de sécurité

### Audit des actions sensibles
```javascript
const winston = require('winston');

// Logger spécialisé pour la sécurité
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn'
    })
  ]
});

// Middleware d'audit
const auditMiddleware = (action) => {
  return (req, res, next) => {
    const auditData = {
      action,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    securityLogger.info('Security audit', auditData);
    next();
  };
};

// Utilisation
app.use('/api/auth/login', auditMiddleware('LOGIN_ATTEMPT'));
app.use('/api/products', auditMiddleware('PRODUCT_ACCESS'));
```

## Détection d'intrusion

### Monitoring des tentatives malveillantes
```javascript
class IntrusionDetection {
  constructor() {
    this.suspiciousActivities = new Map();
    this.maxAttempts = 10;
    this.timeWindow = 60000; // 1 minute
  }

  checkSuspiciousActivity(ip, action) {
    const key = `${ip}:${action}`;
    const now = Date.now();
    
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, []);
    }
    
    const attempts = this.suspiciousActivities.get(key);
    
    // Nettoyer les anciennes tentatives
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    recentAttempts.push(now);
    this.suspiciousActivities.set(key, recentAttempts);
    
    if (recentAttempts.length > this.maxAttempts) {
      this.handleIntrusion(ip, action);
      return true;
    }
    
    return false;
  }

  handleIntrusion(ip, action) {
    securityLogger.error('Intrusion detected', {
      ip,
      action,
      timestamp: new Date().toISOString()
    });
    
    // Bloquer temporairement l'IP
    this.blockIP(ip);
  }

  blockIP(ip) {
    // Implémentation du blocage IP
    // (Redis, base de données, ou système de firewall)
  }
}
```

## Configuration SSL/TLS

### Configuration sécurisée
```javascript
const https = require('https');
const fs = require('fs');

// Configuration SSL stricte
const sslOptions = {
  key: fs.readFileSync('ssl/private-key.pem'),
  cert: fs.readFileSync('ssl/certificate.pem'),
  
  // Protocoles sécurisés uniquement
  secureProtocol: 'TLSv1_2_method',
  
  // Ciphers sécurisés
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':'),
  
  honorCipherOrder: true
};

const server = https.createServer(sslOptions, app);
```

## Variables d'environnement sécurisées

### Gestion des secrets
```bash
# .env.example (template public)
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://votre-domaine.com

# Secrets (à définir en production)
JWT_SECRET=
REFRESH_TOKEN_SECRET=
ENCRYPTION_KEY=
DATABASE_URL=
```

```javascript
// Configuration sécurisée
const config = {
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      throw new Error('JWT_SECRET must be defined');
    })(),
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || (() => {
      throw new Error('REFRESH_TOKEN_SECRET must be defined');
    })()
  },
  
  database: {
    url: process.env.DATABASE_URL || 'file:./data/app.db'
  },
  
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development'
  }
};

// Validation de la configuration au démarrage
const validateConfig = () => {
  const requiredInProduction = [
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'ENCRYPTION_KEY'
  ];

  if (config.app.env === 'production') {
    requiredInProduction.forEach(key => {
      if (!process.env[key]) {
        throw new Error(`${key} is required in production`);
      }
    });
  }
};

validateConfig();
```

## Checklist de sécurité

### Avant déploiement
- [ ] JWT secrets générés aléatoirement
- [ ] HTTPS configuré avec certificats valides
- [ ] Rate limiting activé
- [ ] Validation d'entrées stricte
- [ ] Headers de sécurité configurés
- [ ] CORS restrictif
- [ ] Logs de sécurité activés
- [ ] Variables d'environnement sécurisées
- [ ] Tests de sécurité passés
- [ ] Audit de dépendances effectué

### Maintenance continue
- [ ] Mise à jour régulière des dépendances
- [ ] Rotation des secrets
- [ ] Monitoring des logs de sécurité
- [ ] Tests de pénétration périodiques
- [ ] Sauvegarde chiffrée des données
