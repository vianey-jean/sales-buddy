
# Guide de Déploiement

## Environnements

### Développement
```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Lancement des tests
npm test

# Build de développement avec watch
npm run build:dev
```

### Production

#### Build de production
```bash
# Build optimisé
npm run build

# Preview du build
npm run preview

# Vérification du build
npm run check
```

#### Variables d'environnement
```env
# .env.production
NODE_ENV=production
VITE_API_BASE_URL=https://api.votre-domaine.com
JWT_SECRET=votre-secret-super-securise
FRONTEND_URL=https://votre-domaine.com
PORT=3000
```

## Déploiement Frontend

### Netlify
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Vercel
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Déploiement Backend

### Heroku
```json
{
  "name": "gestion-commerciale-api",
  "description": "API pour système de gestion commerciale",
  "image": "heroku/nodejs",
  "addons": [
    "heroku-postgresql:hobby-dev"
  ],
  "env": {
    "NODE_ENV": "production",
    "JWT_SECRET": {
      "required": true
    }
  },
  "scripts": {
    "postdeploy": "npm run migrate"
  }
}
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Exposition du port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production

# Commande de démarrage
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### AWS EC2
```bash
#!/bin/bash
# deploy.sh

# Mise à jour du système
sudo yum update -y

# Installation de Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Installation de PM2
sudo npm install -g pm2

# Clonage du projet
git clone https://github.com/votre-repo/gestion-commerciale.git
cd gestion-commerciale

# Installation des dépendances
npm install

# Build de production
npm run build

# Configuration PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gestion-commerciale-api',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    merge_logs: true,
    time: true
  }]
};
```

## Configuration Nginx

### Reverse proxy
```nginx
# nginx.conf
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Configuration SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SSE pour synchronisation temps réel
    location /api/sync/events {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Cache-Control 'no-cache';
        proxy_set_header X-Accel-Buffering 'no';
        proxy_read_timeout 24h;
    }
}
```

## Base de données

### Migration vers PostgreSQL
```sql
-- init.sql
CREATE DATABASE gestion_commerciale;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    product_id UUID REFERENCES products(id),
    selling_price DECIMAL(10,2) NOT NULL,
    quantity_sold INTEGER NOT NULL,
    profit DECIMAL(10,2) NOT NULL,
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    client_address TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Monitoring et logs

### Configuration des logs
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'gestion-commerciale-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health checks
```javascript
// health.js
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    responseTime: process.hrtime(),
    message: 'OK',
    timestamp: Date.now()
  };
  
  try {
    res.send(healthCheck);
  } catch (error) {
    healthCheck.message = error;
    res.status(503).send();
  }
});
```

## Sécurité en production

### HTTPS et certificats SSL
```bash
# Certificat Let's Encrypt
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### Variables d'environnement sécurisées
```bash
# Génération de JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Chiffrement des variables sensibles
gpg --symmetric --cipher-algo AES256 .env.production
```

## Scripts de déploiement

### Script de déploiement automatisé
```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Déploiement en production..."

# Backup de l'ancienne version
pm2 save

# Pull des dernières modifications
git pull origin main

# Installation des dépendances
npm ci --only=production

# Build de l'application
npm run build

# Tests de production
npm run test:prod

# Redémarrage de l'application
pm2 reload gestion-commerciale-api

# Vérification du déploiement
sleep 10
curl -f http://localhost:3000/health || exit 1

echo "✅ Déploiement réussi!"
```

### Rollback automatique
```bash
#!/bin/bash
# rollback.sh

echo "🔄 Rollback en cours..."

# Restauration de la version précédente
pm2 restart gestion-commerciale-api --update-env

# Restauration des données si nécessaire
if [ -f "data/backup/latest.json" ]; then
    cp data/backup/latest.json data/
fi

echo "✅ Rollback terminé!"
```
