# 📚 Documentation Complète - Système de Gestion Commerciale

> **Version**: 3.2.0  
> **Dernière mise à jour**: Janvier 2026  
> **Auteur**: Jean Rabemanalina

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du projet](#architecture-du-projet)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Frontend (React)](#frontend-react)
6. [Backend (Node.js/Express)](#backend-nodejs-express)
7. [Base de données](#base-de-données)
8. [API Documentation](#api-documentation)
9. [Sécurité](#sécurité)
10. [Tests](#tests)
11. [Déploiement](#déploiement)
12. [Guide utilisateur](#guide-utilisateur)

---

## 🎯 Vue d'ensemble

### Description
Application web complète de gestion commerciale permettant de gérer:
- **Ventes et produits** - Suivi des transactions et inventaire
- **Clients** - Base de données clients avec informations de contact
- **Commandes et réservations** - Gestion des commandes avec synchronisation RDV
- **Rendez-vous** - Planification et notifications automatiques
- **Tâches** - Calendrier de tâches avec validation anticipée, créneaux croisés (tâches+RDV), notifications et intégration commandes
- **Prêts familles/produits** - Suivi des prêts et remboursements
- **Dépenses** - Gestion des dépenses mensuelles
- **Analyses et tendances** - Tableaux de bord et rapports

### Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Shadcn/UI |
| State Management | React Context |
| Animations | Framer Motion |
| Backend | Node.js, Express.js |
| Base de données | JSON (fichiers) |
| Authentification | JWT + bcrypt |
| Tests | Vitest, React Testing Library |

---

## 🏗️ Architecture du projet

### Structure des dossiers

```
📦 gestion-vente/
├── 📁 docs/                     # Documentation
├── 📁 public/                   # Fichiers statiques
│   └── images/                  # Images et favicon
├── 📁 server/                   # Backend Node.js
│   ├── 📁 config/               # Configuration (passport)
│   ├── 📁 db/                   # Fichiers JSON (base de données)
│   ├── 📁 middleware/           # Middlewares Express
│   │   ├── auth.js              # Authentification JWT
│   │   ├── security.js          # Sécurité (rate limiting, XSS)
│   │   ├── validation.js        # Validation des entrées
│   │   └── upload.js            # Gestion uploads
│   ├── 📁 models/               # Modèles de données
│   ├── 📁 routes/               # Routes API
│   └── server.js                # Point d'entrée serveur
├── 📁 src/                      # Frontend React
│   ├── 📁 assets/               # Assets (images, fonts)
│   ├── 📁 components/           # Composants React
│   │   ├── 📁 accessibility/    # Composants accessibilité
│   │   ├── 📁 auth/             # Authentification
│   │   ├── 📁 clients/          # Gestion clients
│   │   ├── 📁 commandes/        # Gestion commandes
│   │   ├── 📁 common/           # Composants communs
│   │   ├── 📁 dashboard/        # Tableau de bord
│   │   ├── 📁 navbar/           # Navigation
│   │   ├── 📁 rdv/              # Rendez-vous
│   │   ├── 📁 shared/           # Composants partagés
│   │   └── 📁 ui/               # Composants UI (shadcn)
│   ├── 📁 contexts/             # Contextes React
│   ├── 📁 hooks/                # Hooks personnalisés
│   ├── 📁 lib/                  # Utilitaires
│   ├── 📁 pages/                # Pages de l'application
│   ├── 📁 services/             # Services API et métier
│   ├── 📁 styles/               # Styles CSS
│   ├── 📁 tests/                # Tests
│   └── 📁 types/                # Types TypeScript
├── index.html                   # Page HTML principale
├── tailwind.config.ts           # Configuration Tailwind
├── vite.config.ts               # Configuration Vite
└── package.json                 # Dépendances
```

### Flux de données

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   Express   │────▶│   JSON DB   │
│  Frontend   │◀────│   Backend   │◀────│   Files     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │
      │ WebSocket/SSE     │ Realtime Sync
      └───────────────────┘
```

---

## 🚀 Installation

### Prérequis
- Node.js >= 18.x
- npm >= 9.x
- Git

### Installation Frontend

```bash
# Cloner le repository
git clone <repository-url>
cd gestion-vente

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

### Installation Backend

```bash
# Aller dans le dossier server
cd server

# Installer les dépendances
npm install

# Lancer le serveur
npm run dev  # Développement avec nodemon
npm start    # Production
```

### Variables d'environnement

**Frontend** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:10000
```

**Backend** (`server/.env`):
```env
PORT=10000
JWT_SECRET=votre_secret_jwt_securise
NODE_ENV=development
```

---

## ⚙️ Configuration

### Tailwind CSS
Configuration dans `tailwind.config.ts`:
- Mode sombre via classe `.dark`
- Breakpoints personnalisés (xs, sm, md, lg, xl, 2xl)
- Couleurs sémantiques via variables CSS
- Animations personnalisées

### Tokens de design
Définis dans `src/index.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... autres tokens */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... tokens mode sombre */
}
```

---

## ⚛️ Frontend (React)

### Contextes

| Contexte | Rôle |
|----------|------|
| `AuthContext` | Gestion authentification |
| `AppContext` | Données globales (ventes, produits) |
| `ThemeContext` | Thème clair/sombre |
| `AccessibilityProvider` | Fonctionnalités accessibilité |

### Pages principales

| Page | Route | Description |
|------|-------|-------------|
| HomePage | `/` | Page d'accueil |
| DashboardPage | `/dashboard` | Tableau de bord principal |
| ClientsPage | `/clients` | Gestion clients |
| CommandesPage | `/commandes` | Commandes et réservations |
| RdvPage | `/rdv` | Rendez-vous |
| TendancesPage | `/tendances` | Analyses et statistiques |
| MessagesPage | `/messages` | Messagerie |

### Hooks personnalisés

| Hook | Usage |
|------|-------|
| `useAuth` | Authentification |
| `useApp` | Données globales |
| `useClients` | Opérations clients |
| `useCommandes` | Opérations commandes |
| `useRdv` | Opérations rendez-vous |
| `useSales` | Opérations ventes |
| `useProducts` | Opérations produits |
| `useToast` | Notifications |
| `useIsMobile` | Détection mobile |

### Composants réutilisables

**UI (Shadcn)**: Button, Card, Dialog, Input, Table, Tabs, etc.

**Partagés**:
- `PageHero` - En-tête de page
- `UnifiedSearchBar` - Barre de recherche
- `Pagination` - Pagination
- `ConfirmDialog` - Dialogue de confirmation
- `LoadingOverlay` - Overlay de chargement

---

## 🖥️ Backend (Node.js/Express)

### Structure des routes

| Route | Méthodes | Description |
|-------|----------|-------------|
| `/api/auth` | POST | Authentification |
| `/api/products` | CRUD | Gestion produits |
| `/api/sales` | CRUD | Gestion ventes |
| `/api/clients` | CRUD | Gestion clients |
| `/api/commandes` | CRUD | Gestion commandes |
| `/api/rdv` | CRUD | Gestion rendez-vous |
| `/api/pretfamilles` | CRUD | Prêts familles |
| `/api/pretproduits` | CRUD | Prêts produits |
| `/api/depenses` | CRUD | Dépenses |
| `/api/benefices` | GET, POST | Bénéfices |
| `/api/messages` | CRUD | Messages |
| `/api/sync/events` | SSE | Synchronisation temps réel |

### Middlewares

```javascript
// Ordre d'application
app.use(compression());           // Compression gzip
app.use(securityHeadersMiddleware); // Headers sécurité
app.use(cors(corsOptions));       // CORS
app.use(rateLimitMiddleware);     // Rate limiting
app.use(suspiciousActivityLogger); // Détection intrusion
app.use(bodyParser.json());       // Parsing JSON
app.use(sanitizeMiddleware);      // Sanitization XSS
```

---

## 🗄️ Base de données

### Fichiers JSON

| Fichier | Contenu |
|---------|---------|
| `users.json` | Utilisateurs |
| `products.json` | Produits |
| `sales.json` | Ventes |
| `clients.json` | Clients |
| `commandes.json` | Commandes |
| `rdv.json` | Rendez-vous |
| `pretfamilles.json` | Prêts familles |
| `pretproduits.json` | Prêts produits |
| `depensedumois.json` | Dépenses mensuelles |
| `messages.json` | Messages |
| `benefice.json` | Bénéfices |
| `objectif.json` | Objectifs de vente |

### Schémas de données

**Produit**:
```typescript
interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  quantity: number;
}
```

**Vente**:
```typescript
interface Sale {
  id: string;
  date: string;
  clientName: string;
  products: SaleProduct[];
  totalSellingPrice: number;
  totalPurchasePrice: number;
  totalProfit: number;
}
```

**Client**:
```typescript
interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
  dateCreation: string;
}
```

---

## 📡 API Documentation

### Authentification

**POST /api/auth/login**
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response
{ "user": {...}, "token": "jwt_token" }
```

**POST /api/auth/register**
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

### Produits

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Liste tous les produits |
| POST | `/api/products` | Créer un produit |
| PUT | `/api/products/:id` | Modifier un produit |
| DELETE | `/api/products/:id` | Supprimer un produit |

### Ventes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/sales` | Ventes du mois courant |
| GET | `/api/sales/all` | Toutes les ventes (historique) |
| POST | `/api/sales` | Enregistrer une vente |
| PUT | `/api/sales/:id` | Modifier une vente |
| DELETE | `/api/sales/:id` | Supprimer une vente |

### Headers requis
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 🔒 Sécurité

### Mesures implémentées

1. **Authentification JWT**
   - Tokens signés avec secret fort
   - Expiration configurable
   - Stockage sécurisé côté client

2. **Protection contre les attaques**
   - Rate limiting (100 req/15min)
   - Sanitization XSS (échappement HTML)
   - Validation Zod côté client
   - Headers de sécurité (CSP, X-Frame-Options)

3. **Mots de passe**
   - Hachage bcrypt (salt = 10 rounds)
   - Validation de force minimum

4. **CORS**
   - Origines autorisées configurables
   - Credentials activés

### Bonnes pratiques

```typescript
// Validation côté client (Zod)
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Sanitization
import { sanitizeInput } from '@/lib/security';
const cleanData = sanitizeInput(userInput);
```

---

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
npm test

# Avec couverture
npm run test:coverage

# Mode watch
npm run test:watch
```

### Structure des tests

```
src/tests/
├── components/     # Tests composants
├── hooks/          # Tests hooks
├── services/       # Tests services
├── integration/    # Tests intégration
├── e2e/            # Tests end-to-end
├── security/       # Tests sécurité
└── setup.ts        # Configuration
```

### Exemple de test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
});
```

---

## 🚢 Déploiement

### Frontend (Vercel/Netlify)

1. Connecter le repository
2. Configurer les variables d'environnement:
   ```
   VITE_API_BASE_URL=https://api.example.com
   ```
3. Build command: `npm run build`
4. Output: `dist`

### Backend (Render/Railway)

1. Déployer le dossier `server/`
2. Variables d'environnement:
   ```
   PORT=10000
   JWT_SECRET=production_secret
   NODE_ENV=production
   ```
3. Start command: `npm start`

### Checklist production

- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET unique et sécurisé
- [ ] CORS configuré pour le domaine production
- [ ] Rate limiting activé
- [ ] Logs d'erreur configurés
- [ ] HTTPS activé

---

## 📖 Guide utilisateur

### Connexion
1. Aller sur la page de connexion
2. Entrer email et mot de passe
3. Cliquer sur "Se connecter"

### Dashboard
Le tableau de bord permet de gérer:
- **Ventes Produits**: Enregistrer et suivre les ventes
- **Prêts Familles**: Gérer les prêts d'argent
- **Prêts Produits**: Suivre les produits prêtés
- **Dépenses**: Enregistrer les dépenses mensuelles
- **Inventaire**: Gérer le stock
- **Calcul Bénéfice**: Calculer les marges

### Commandes
- Créer des commandes ou réservations
- Suivre les statuts (en attente, arrivé, validé)
- Créer automatiquement un RDV depuis une réservation

### Rendez-vous
- Vue calendrier ou liste
- Notifications pour RDV proches
- Synchronisation avec les réservations

### Mode sombre
Cliquer sur l'icône soleil/lune dans la navbar pour basculer.

---

## 📞 Support

**Créé par**: Jean Rabemanalina  
**Email**: vianey.jean@ymail.com  
**Téléphone**: +262 6 92 84 23 70

---

*Documentation générée automatiquement - Janvier 2026*

---

## 💬 Widget Messagerie Instantanée

### Composants Frontend
- `src/components/livechat/LiveChatVisitor.tsx` — Chat visiteur
- `src/components/livechat/LiveChatAdmin.tsx` — Chat admin

### Fonctionnalités
- Emoji picker (20 emojis), Like ❤️, Modifier/Supprimer ses messages
- Temps réel SSE + polling 2s, indicateur de frappe

### Backend
- Route : `server/routes/messagerie.js`
- DB : `server/db/messagerie.json`
- Endpoints : send, edit, delete, like, typing, mark-read, events (SSE)

---

## 🏭 Fournisseurs
- Route : `server/routes/fournisseurs.js` | Modèle : `server/models/Fournisseur.js`
- DB : `server/db/fournisseurs.json`
- Auto-créés lors d'ajout produit/achat, recherche autocomplétion

---

## 👤 Profil & Paramètres

### Frontend
- Page : `src/pages/ProfilePage.tsx`
- Composants : `ProfileCard`, `ProfileAvatar`, `ProfileInfoCard`, `PasswordSection`, `ParametresSection`, `IndisponibiliteSection`, `ModuleSettingsSection`
- Services : `profileApi.ts`, `settingsApi.ts`

### Backend
- Routes : `server/routes/profile.js`, `server/routes/settings.js`
- DB : `users.json`, `settings.json`, `moduleSettings.json`, `indisponible.json`
- Sauvegarde dynamique : scan automatique de tous les `*.json` dans `server/db/`
