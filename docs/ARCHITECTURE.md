
# 🏗️ Architecture du Système — Documentation Complète

> **Version** : 5.0.0  
> **Dernière mise à jour** : Mars 2026

---

## 📌 1. Vue d'ensemble

Le système est une application web **full-stack** de gestion commerciale composée de :
- **Frontend** : Application React SPA (Single Page Application)
- **Backend** : Serveur Express.js REST API
- **Base de données** : Fichiers JSON (stockage fichier plat)
- **Communication temps réel** : Server-Sent Events (SSE)

### Diagramme d'architecture globale

```
┌──────────────────────────────────────────────┐
│              NAVIGATEUR CLIENT               │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │         FRONTEND (React SPA)           │  │
│  │                                        │  │
│  │  Pages ──► Composants ──► Services API │  │
│  │    │           │              │        │  │
│  │    │           │              ▼        │  │
│  │    │           │         Axios HTTP    │  │
│  │    │           │              │        │  │
│  │    │           ▼              │        │  │
│  │    │     Contextes React      │        │  │
│  │    │     (état global)        │        │  │
│  └────┼──────────────────────────┼────────┘  │
│       │                          │           │
└───────┼──────────────────────────┼───────────┘
        │ Routing                  │ HTTP/SSE
        ▼                          ▼
┌───────────────┐    ┌──────────────────────────┐
│  React Router │    │  BACKEND (Express.js)     │
│  (SPA Routes) │    │                           │
└───────────────┘    │  ┌─────────────────────┐  │
                     │  │   Middleware        │  │
                     │  │  • Auth JWT         │  │
                     │  │  • CORS             │  │
                     │  │  • Rate Limiting    │  │
                     │  │  • Sanitization     │  │
                     │  │  • Security Headers │  │
                     │  └──────────┬──────────┘  │
                     │             │             │
                     │  ┌──────────▼──────────┐  │
                     │  │   Routes API        │  │
                     │  │  (24 fichiers)      │  │
                     │  └──────────┬──────────┘  │
                     │             │             │
                     │  ┌──────────▼──────────┐  │
                     │  │   Modèles           │  │
                     │  │  (23 fichiers)      │  │
                     │  └──────────┬──────────┘  │
                     │             │             │
                     │  ┌──────────▼──────────┐  │
                     │  │   Base de données   │  │
                     │  │  (25 fichiers JSON) │  │
                     │  └─────────────────────┘  │
                     └──────────────────────────-┘
```

---

## 📌 2. Stack Technologique

### Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.2.0 | Framework UI |
| TypeScript | strict | Typage statique |
| Vite | latest | Build tool & dev server |
| Tailwind CSS | 4.x | Styles utilitaires |
| shadcn/ui | latest | Composants UI prêts à l'emploi |
| Framer Motion | 12.x | Animations fluides |
| React Router | 7.x | Navigation SPA |
| Axios | 1.x | Requêtes HTTP |
| Recharts | 3.x | Graphiques et visualisations |
| React Query | 5.x | Cache et synchronisation des données |
| date-fns | 4.x | Manipulation de dates |
| jsPDF | 4.x | Génération de PDF |
| Zod | 4.x | Validation de schémas |
| React Hook Form | 7.x | Gestion de formulaires |

### Backend
| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 18+ | Runtime JavaScript |
| Express.js | 4.x | Framework HTTP |
| JWT (jsonwebtoken) | latest | Authentification |
| bcryptjs | latest | Hash de mots de passe |
| Multer | latest | Upload de fichiers |
| compression | latest | Compression gzip |
| cors | 2.8.5 | Cross-Origin Resource Sharing |

---

## 📌 3. Structure des dossiers

### Frontend (`src/`)
```
src/
├── assets/               # Images et ressources statiques
├── components/           # Composants React réutilisables
│   ├── ui/              # Composants de base shadcn/ui (Button, Input, Card...)
│   ├── auth/            # Composants d'authentification
│   ├── dashboard/       # Tableau de bord (statistiques, formulaires, inventaire)
│   │   ├── accounting/  # Comptabilité (achats, fournisseurs)
│   │   ├── comptabilite/# Module comptabilité avancé
│   │   ├── forms/       # Formulaires du dashboard
│   │   ├── inventory/   # Gestion d'inventaire
│   │   ├── prets/       # Gestion des prêts
│   │   ├── reports/     # Rapports et exports
│   │   └── sections/    # Sections du dashboard
│   ├── clients/         # Gestion des clients (ClientCard, ClientsGrid, etc.)
│   ├── commandes/       # Commandes et réservations
│   ├── navbar/          # Barre de navigation et modales associées
│   │   └── modals/      # ObjectifChangesModal, BeneficesHistoriqueModal, etc.
│   ├── notes/           # Kanban board (NoteCard, DrawingCanvas, colonnes)
│   ├── pointage/        # Pointage et suivi du travail
│   │   └── modals/      # AvanceModal, ParPersonneModal, YearlyTotalModal, etc.
│   ├── rdv/             # Rendez-vous (calendrier, formulaires, stats)
│   ├── tache/           # Tâches (calendrier, semaine, timeline)
│   ├── tendances/       # Analyses et tendances de vente
│   ├── business/        # Composants métier génériques
│   ├── common/          # Composants partagés
│   ├── shared/          # Utilitaires UI partagés
│   ├── forms/           # Formulaires génériques
│   ├── navigation/      # Navigation et routing
│   └── accessibility/   # Composants d'accessibilité
├── contexts/            # Contextes React (auth, thème)
├── hooks/               # Hooks personnalisés
├── lib/                 # Utilitaires (cn, helpers)
├── pages/               # Pages de l'application (une par route)
│   ├── dashboard/       # Sous-pages du dashboard
│   ├── clients/         # Pages clients
│   ├── rdv/             # Pages rendez-vous
│   └── tendances/       # Pages tendances
└── services/            # Services et API
    └── api/             # 24 fichiers API (un par ressource)
```

### Backend (`server/`)
```
server/
├── server.js            # Point d'entrée (Express, middleware, routes)
├── .env                 # Variables d'environnement (JWT_SECRET, PORT)
├── package.json         # Dépendances Node.js
├── config/              # Configuration (passport, etc.)
├── middleware/           # Middleware (auth.js, security.js)
├── models/              # 23 modèles de données (CRUD fichiers JSON)
├── routes/              # 24 fichiers de routes API
├── db/                  # 25 fichiers JSON (base de données)
└── uploads/             # Fichiers uploadés
    ├── products/        # Photos de produits
    └── notes/
        └── dessin/      # Dessins des notes (JPEG)
```

---

## 📌 4. Flux de données

### Requête HTTP typique

```
1. Utilisateur clique sur un bouton
        │
2. Composant React appelle le service API
   (ex: pointageApi.create(data))
        │
3. Axios envoie la requête HTTP
   POST /api/pointages + Bearer token
        │
4. Express reçoit la requête
        │
5. Middleware s'exécutent dans l'ordre :
   CORS → Rate Limit → Body Parser → Sanitization → Auth JWT
        │
6. Route handler traite la requête
   (ex: router.post('/', auth, ...))
        │
7. Modèle lit/écrit le fichier JSON
   (ex: Pointage.create(data) → pointage.json)
        │
8. Réponse HTTP renvoyée
        │
9. SSE notifie les autres clients connectés
   (événement 'data-changed')
        │
10. Composant React met à jour l'affichage
```

### Synchronisation temps réel (SSE)

```
Client A modifie des données
        │
        ▼
Backend envoie un événement SSE
        │
        ▼
Tous les clients connectés reçoivent l'événement
        │
        ▼
Chaque client recharge les données affectées
```

---

## 📌 5. Sécurité

| Couche | Protection |
|--------|-----------|
| Authentification | JWT avec expiration 8h |
| Mots de passe | Hashés avec bcrypt (salt 10 rounds) |
| CORS | Origins whitelist|
| Rate Limiting | 100 req/min par IP |
| Sanitization | Nettoyage de tous les inputs (sauf base64) |
| Headers | Security headers (X-Frame-Options, CSP, etc.) |
| Erreurs | Stack traces masquées en production |

---

## 📌 6. Déploiement

| Composant | Plateforme | URL |
|-----------|-----------|-----|
| Frontend |  Vercel | `https://riziky-boutic.vercel.app` |
| Backend | Render | `https://server-gestion-ventes.onrender.com` |
| Base de données | Fichiers JSON sur Render | Persistent disk |

---

## 📌 7. Modules fonctionnels

| Module | Pages | Composants | API | BDD |
|--------|-------|-----------|-----|-----|
| Authentification | Login, Register, Reset | auth/ | auth.js | users.json |
| Produits | Produits, ProduitsPage | dashboard/ | products.js | products.json |
| Ventes | Ventes, VentesEmbedded | dashboard/ | sales.js | sales.json |
| Clients | ClientsPage | clients/ | clients.js | clients.json |
| Commandes | CommandesPage | commandes/ | commandes.js | commandes.json |
| Rendez-vous | RdvPage | rdv/ | rdv.js | rdv.json |
| Prêts Familles | PretFamilles | dashboard/prets/ | pretfamilles.js | pretfamilles.json |
| Prêts Produits | PretProduits | dashboard/prets/ | pretproduits.js | pretproduits.json |
| Dépenses | Depenses | dashboard/ | depenses.js | depensedumois.json |
| Comptabilité | Comptabilite | dashboard/comptabilite/ | compta.js | compta.json |
| Bénéfices | (dans Navbar) | navbar/modals/ | benefices.js | benefice.json |
| Messages | MessagesPage | — | messages.js | messages.json |
| Tendances | TendancesPage | tendances/ | — | — |
| Objectifs | (dans Navbar) | navbar/modals/ | objectif.js | objectif.json |
| **Pointage** | PointagePage | pointage/ | pointage.js | pointage.json |
| **Travailleurs** | (dans Pointage) | pointage/modals/ | travailleur.js | travailleur.json |
| **Entreprises** | (dans Pointage) | pointage/modals/ | entreprise.js | entreprise.json |
| **Avances** | (dans Pointage) | pointage/modals/ | avance.js | avance.json |
| **Tâches** | PointagePage | tache/ | tache.js | tache.json |
| **Notes Kanban** | PointagePage | notes/ | notes.js | notes.json, noteColumns.json |
| **Messagerie Widget** | LiveChatVisitor/Admin | livechat/ | messagerie.js | messagerie.json |
| **Fournisseurs** | (dans Produits/Compta) | — | fournisseurs.js | fournisseurs.json |

---

## 📌 14. Widget Messagerie Instantanée

### Architecture
```
┌─────────────────┐    SSE + HTTP     ┌──────────────────┐
│ LiveChatVisitor  │ ◄──────────────► │  messagerie.js   │
│ (Widget public)  │                  │  (Express route) │
├─────────────────┤                  │                  │
│ LiveChatAdmin    │ ◄──────────────► │  messagerie.json │
│ (Widget admin)   │                  └──────────────────┘
└─────────────────┘
```

### Fonctionnalités
- Envoi/réception instantanée (SSE + polling fallback 2s)
- Emoji picker intégré
- Like/Aimer un message (toggle ❤️)
- Modifier ses propres messages
- Supprimer ses propres messages (affiche notice de suppression)
- Indicateur de frappe en temps réel
- Liste des conversations côté admin

### Fournisseurs
- Auto-créés lors d'ajout produit ou achat comptabilité
- Recherche avec autocomplétion
- Base de données : `server/db/fournisseurs.json`

---

## 👤 Page Profil (ProfilePage)

### Architecture des composants

```
ProfilePage.tsx
├── ProfileCard.tsx          → Avatar + nom + email + rôle + statut en ligne
│   └── ProfileAvatar.tsx    → Avatar animé avec anneaux pulsants verts
├── ProfileInfoCard.tsx      → Formulaire d'édition des informations personnelles
├── PasswordSection.tsx      → Changement de mot de passe avec vérification de force
└── ParametresSection.tsx    → Onglet Paramètres (admin uniquement)
    ├── IndisponibiliteSection.tsx → Gestion des congés/indisponibilités
    └── ModuleSettingsSection.tsx  → Configuration par module (commandes, pointage, tâches, notes)
```

### Fonctionnalités
- **Profil** : Visualisation et édition des informations personnelles avec confirmation
- **Photo** : Upload avec aperçu et confirmation avant envoi
- **Mot de passe** : Changement sécurisé avec vérification de force (PasswordStrengthChecker)
- **Paramètres** (admin) : Configuration globale, gestion des rôles, sauvegarde/restauration/suppression des données
- **Sauvegarde dynamique** : Scanne automatiquement tous les fichiers `.json` dans `server/db/` pour inclure les nouvelles bases de données
- **Rôles** : 3 niveaux — simple utilisateur, administrateur, administrateur principale

### Base de données associées
- `server/db/users.json` — Comptes utilisateurs
- `server/db/settings.json` — Paramètres globaux
- `server/db/moduleSettings.json` — Paramètres par module
- `server/db/indisponible.json` — Congés et indisponibilités
