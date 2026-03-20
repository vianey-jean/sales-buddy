
# 🔧 Guide Backend — Documentation Complète

> **Version** : 5.0.0  
> **Dernière mise à jour** : Mars 2026  
> **Runtime** : Node.js 18+  
> **Framework** : Express.js 4.x  
> **Port** : `process.env.PORT` (défaut: 10000)  
> **Déployé sur** : Render

---

## 📌 1. Architecture du serveur

### Point d'entrée : `server/server.js`

Le fichier `server.js` est le cœur du backend. Il configure et démarre le serveur Express.

**Ordre d'exécution au démarrage :**
```
1. Chargement des variables d'environnement (.env)
2. Création de l'instance Express
3. Middleware de sécurité :
   a. compression() — Compression gzip des réponses
   b. securityHeadersMiddleware — Headers de sécurité HTTP
   c. CORS — Configuration des origines autorisées
   d. rateLimitMiddleware — 100 req/min par IP (sauf SSE)
   e. suspiciousActivityLogger — Détection d'activités suspectes
   f. bodyParser — Parsing JSON/URL-encoded (limit 10mb)
   g. sanitizeMiddleware — Nettoyage des inputs (sauf upload dessin)
4. Initialisation des fichiers JSON (création si inexistants)
5. Import et montage des 24 routes API
6. Serveur de fichiers statiques (/uploads)
7. Handler 404 et gestion globale des erreurs
8. Démarrage du serveur sur le port configuré
```

### Structure des dossiers backend

```
server/
├── server.js                 # Point d'entrée principal (347 lignes)
│                              # Ligne 1-15   : En-tête et documentation
│                              # Ligne 17-32  : Imports
│                              # Ligne 37-39  : Initialisation Express
│                              # Ligne 44-124 : Middleware de sécurité
│                              # Ligne 126-248: Initialisation BDD JSON
│                              # Ligne 250-302: Import et montage des routes
│                              # Ligne 304-347: Fichiers statiques, erreurs, démarrage
│
├── .env                      # Variables d'environnement
│                              # JWT_SECRET=votre_secret_jwt
│                              # PORT=10000
│
├── config/
│   └── passport.js           # Configuration Passport (réservé, non utilisé)
│
├── middleware/
│   ├── auth.js               # Middleware d'authentification JWT (42 lignes)
│   │                          # Vérifie le token Bearer dans le header Authorization
│   │                          # Charge l'utilisateur depuis users.json dans req.user
│   │                          # Retourne 401 si token absent/invalide
│   │
│   └── security.js           # Middleware de sécurité (rate limiting, sanitization, headers)
│
├── models/                   # 23 modèles de données (un par ressource)
│   ├── User.js               # Gestion des utilisateurs (CRUD + auth)
│   ├── Product.js            # Gestion des produits
│   ├── Sale.js               # Gestion des ventes
│   ├── Client.js             # Gestion des clients
│   ├── Commande.js           # Gestion des commandes
│   ├── Rdv.js                # Gestion des rendez-vous
│   ├── RdvNotification.js    # Notifications de RDV
│   ├── PretFamille.js        # Prêts famille
│   ├── PretProduit.js        # Prêts produits (crédits)
│   ├── DepenseDuMois.js      # Dépenses mensuelles
│   ├── Benefice.js           # Bénéfices
│   ├── Compta.js             # Comptabilité
│   ├── NouvelleAchat.js      # Nouveaux achats
│   ├── Fournisseur.js        # Fournisseurs
│   ├── Remboursement.js      # Remboursements
│   ├── Message.js            # Messages
│   ├── Objectif.js           # Objectifs mensuels
│   ├── Note.js               # Notes Kanban + colonnes
│   ├── Pointage.js           # Pointage travailleurs
│   ├── Travailleur.js        # Travailleurs
│   ├── Entreprise.js         # Entreprises
│   ├── Tache.js              # Tâches planifiées
│   └── Avance.js             # Avances sur salaire
│
├── routes/                   # 24 fichiers de routes API
│   ├── auth.js               # POST /login, /register, /reset-password
│   ├── products.js           # CRUD /api/products
│   ├── sales.js              # CRUD /api/sales + /by-month
│   ├── clients.js            # CRUD /api/clients
│   ├── commandes.js          # CRUD /api/commandes
│   ├── rdv.js                # CRUD /api/rdv
│   ├── rdvNotifications.js   # CRUD /api/rdv-notifications
│   ├── pretfamilles.js       # CRUD /api/pretfamilles
│   ├── pretproduits.js       # CRUD /api/pretproduits
│   ├── depenses.js           # CRUD /api/depenses + /fixes
│   ├── benefices.js          # CRUD /api/benefices
│   ├── compta.js             # CRUD /api/compta
│   ├── nouvelleAchat.js      # CRUD /api/nouvelle-achat
│   ├── fournisseurs.js       # CRUD /api/fournisseurs
│   ├── remboursements.js     # CRUD /api/remboursements
│   ├── messages.js           # CRUD /api/messages
│   ├── objectif.js           # CRUD /api/objectif
│   ├── notes.js              # CRUD /api/notes + /columns + /upload-drawing
│   ├── pointage.js           # CRUD /api/pointages
│   ├── travailleur.js        # CRUD /api/travailleurs
│   ├── entreprise.js         # CRUD /api/entreprises
│   ├── tache.js              # CRUD /api/taches
│   ├── avance.js             # CRUD /api/avances
│   └── sync.js               # GET /api/sync/events (SSE)
│
├── db/                       # 25 fichiers JSON (base de données)
│   ├── users.json            # Utilisateurs (email, password hashé, etc.)
│   ├── products.json         # Catalogue de produits
│   ├── sales.json            # Historique des ventes
│   ├── clients.json          # Clients
│   ├── commandes.json        # Commandes/réservations
│   ├── rdv.json              # Rendez-vous
│   ├── rdvNotifications.json # Notifications RDV
│   ├── pretfamilles.json     # Prêts famille
│   ├── pretproduits.json     # Prêts produits
│   ├── depensedumois.json    # Dépenses mensuelles
│   ├── depensefixe.json      # Dépenses fixes (Free, Internet, etc.)
│   ├── benefice.json         # Bénéfices
│   ├── compta.json           # Comptabilité
│   ├── nouvelle_achat.json   # Achats
│   ├── fournisseurs.json     # Fournisseurs
│   ├── remboursement.json    # Remboursements
│   ├── messages.json         # Messages
│   ├── objectif.json         # Objectifs mensuels
│   ├── notes.json            # Notes Kanban
│   ├── noteColumns.json      # Colonnes du Kanban
│   ├── pointage.json         # Pointages
│   ├── travailleur.json      # Travailleurs
│   ├── entreprise.json       # Entreprises
│   ├── tache.json            # Tâches
│   └── avance.json           # Avances sur salaire
│
└── uploads/                  # Fichiers uploadés
    ├── products/             # Photos de produits (via Multer)
    └── notes/
        └── dessin/           # Dessins JPEG des notes (via base64)
```

---

## 📌 2. Modèle de données (Pattern commun)

Chaque modèle suit le même pattern de lecture/écriture de fichiers JSON :

```javascript
// Pattern type d'un modèle (ex: server/models/Pointage.js)

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Chemin vers le fichier JSON de la base de données
const DB_PATH = path.join(__dirname, '..', 'db', 'pointage.json');

// Fonctions utilitaires internes
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Méthodes CRUD exportées
module.exports = {
  getAll: () => readDB(),
  
  getById: (id) => readDB().find(item => item.id === id),
  
  create: (data) => {
    const items = readDB();
    const newItem = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    items.push(newItem);
    writeDB(items);
    return newItem;
  },
  
  update: (id, data) => {
    const items = readDB();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    writeDB(items);
    return items[index];
  },
  
  delete: (id) => {
    const items = readDB();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    writeDB(filtered);
    return true;
  }
};
```

---

## 📌 3. Middleware d'authentification

### `server/middleware/auth.js`

```
Flux d'authentification :

1. Requête HTTP arrive avec header "Authorization: Bearer xxx"
2. auth.js extrait le token après "Bearer "
3. jwt.verify() valide le token avec JWT_SECRET
4. Le payload décodé contient { id: "user_uuid" }
5. User.getById(decoded.id) charge l'utilisateur depuis users.json
6. req.user = user → l'utilisateur est disponible dans le handler
7. next() → la requête continue vers le handler de route
```

**Si le token est invalide :**
- Token manquant → `401 { message: "No token, authorization denied" }`
- Token expiré → `401 { message: "Token is not valid" }`
- Utilisateur introuvable → `401 { message: "Invalid token" }`

---

## 📌 4. Routes spéciales

### Upload de dessins (`routes/notes.js`)

Le endpoint `/api/notes/upload-drawing` gère l'upload de dessins base64 :
1. Reçoit une chaîne base64 (`data:image/jpeg;base64,...`)
2. Extrait les données binaires
3. Sauvegarde en fichier JPEG dans `uploads/notes/dessin/`
4. Retourne l'URL relative du fichier

> **Important** : Ce endpoint est exempté du middleware de sanitization car le base64 contient des caractères qui seraient nettoyés (voir `server.js` ligne 118-124).

### Server-Sent Events (`routes/sync.js`)

Le endpoint `/api/sync/events` maintient une connexion longue :
1. Client se connecte via `EventSource`
2. Le serveur garde la connexion ouverte
3. À chaque modification de données, un événement `data-changed` est envoyé
4. Le client recharge automatiquement les données affectées
5. Exempté du rate limiting (connexion longue)

### Avances (`routes/avance.js`)

**Règle métier critique** : Le montant d'une avance ne peut pas dépasser le total des pointages du mois en cours pour le travailleur sélectionné. Le calcul se fait côté frontend avant l'envoi.

---

## 📌 5. Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | `10000` |
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT | `defaultsecretkey` |
| `NODE_ENV` | Environnement (`production` ou `development`) | `development` |

---

## 📌 6. Sécurité (`middleware/security.js`)

| Middleware | Rôle |
|-----------|------|
| `rateLimitMiddleware` | Limite à 100 requêtes/minute par IP |
| `sanitizeMiddleware` | Nettoie les inputs (XSS, injection) |
| `securityHeadersMiddleware` | Ajoute les headers de sécurité HTTP |
| `suspiciousActivityLogger` | Détecte et log les tentatives suspectes |

### Headers de sécurité ajoutés
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'`

---

## 📌 7. Gestion des erreurs

### Handler 404 (ligne 307-310)
```javascript
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});
```

### Handler global d'erreurs (ligne 312-325)
- En **production** : message générique, pas de stack trace
- En **développement** : message détaillé + stack trace

### Arrêt gracieux (ligne 327-340)
- `SIGTERM` : arrêt propre du serveur
- `uncaughtException` : log l'erreur et arrête le processus
- `unhandledRejection` : log la promesse rejetée

---

## 📌 8. CORS — Origines autorisées

```
http://localhost:3000         ← Développement local frontend
http://localhost:8080         ← Développement local alternatif
http://localhost:8081         ← Développement local alternatif
https://riziky-gestion-ventes.vercel.app  ← Production Vercel
https://riziky-boutic.vercel.app          ← Production Vercel alt
https://server-gestion-ventes.onrender.com ← Backend Render
```

---

## 📌 9. Ajout d'une nouvelle ressource (guide pas à pas)

Pour ajouter une nouvelle ressource (ex: `categorie`) :

### Étape 1 : Créer le fichier de base de données
```bash
# server/db/categories.json
[]
```

### Étape 2 : Créer le modèle
```bash
# server/models/Categorie.js
# Copier le pattern d'un modèle existant (ex: Entreprise.js)
# Changer le chemin vers categories.json
```

### Étape 3 : Créer les routes
```bash
# server/routes/categories.js
# Copier le pattern d'une route existante (ex: entreprise.js)
# Importer le modèle Categorie
```

### Étape 4 : Monter la route dans server.js
```javascript
// Ajouter dans la section "Import routes" (ligne ~250)
const categoriesRoutes = require('./routes/categories');

// Ajouter dans la section "Use routes" (ligne ~277)
app.use('/api/categories', categoriesRoutes);
```

### Étape 5 : Créer le service API côté frontend
```bash
# src/services/api/categorieApi.ts
# Copier le pattern d'un API existant (ex: entrepriseApi.ts)
```

---

## 📌 Widget Messagerie Instantanée (Backend)

### Route : `server/routes/messagerie.js`

Gère le chat en direct entre visiteurs et administrateurs.

**Endpoints :**
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/events` | SSE pour temps réel |
| GET | `/conversations` | Liste conversations (admin, auth) |
| GET | `/messages/:visitorId/:adminId` | Messages d'une conversation |
| POST | `/send` | Envoyer un message |
| PUT | `/edit/:messageId` | Modifier un message (propre) |
| DELETE | `/delete/:messageId` | Supprimer un message (propre) |
| POST | `/like/:messageId` | Aimer/retirer like |
| POST | `/typing` | Indicateur de frappe |
| PUT | `/mark-read/:visitorId/:adminId` | Marquer comme lu |
| GET | `/admin-status` | Statut admin en ligne |
| GET | `/unread-count/:adminId` | Compteur non lus |

**Événements SSE :** `new_message`, `message_edited`, `message_deleted`, `message_liked`, `typing`, `admin_status`

### Route : `server/routes/fournisseurs.js`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste tous les fournisseurs |
| GET | `/search?q=` | Recherche par nom |
| POST | `/` | Créer si n'existe pas |
| DELETE | `/:id` | Supprimer |

---

### Route : `server/routes/profile.js`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Récupérer le profil de l'utilisateur connecté |
| PUT | `/` | Modifier les informations personnelles |
| PUT | `/password` | Changer le mot de passe |
| POST | `/photo` | Upload de la photo de profil (multipart) |

### Route : `server/routes/settings.js`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Récupérer les paramètres globaux |
| PUT | `/` | Modifier les paramètres (admin) |
| GET | `/users` | Liste des utilisateurs (admin principale) |
| PUT | `/user-role` | Changer le rôle d'un utilisateur (admin principale) |
| POST | `/backup` | Sauvegarder toutes les données (scan dynamique de `server/db/*.json`) |
| POST | `/restore` | Restaurer des données depuis un fichier chiffré |
| POST | `/delete-all` | Supprimer toutes les données (admin principale) |
| POST | `/verify-password` | Vérifier le mot de passe admin |

**Note** : La sauvegarde et suppression utilisent `fs.readdirSync()` pour scanner dynamiquement tous les fichiers `.json` dans `server/db/`. Tout nouveau fichier de base de données est automatiquement inclus.
