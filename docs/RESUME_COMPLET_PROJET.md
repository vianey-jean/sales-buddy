# 📋 RÉSUMÉ COMPLET DU PROJET — Gestion Ventes & Agendas

> **Version** : 5.0.0  
> **Type** : Application web de gestion commerciale complète  
> **Activité** : Vente de perruques, tissages et extensions capillaires  
> **Date** : Mars 2026

---

## 📌 1. VUE D'ENSEMBLE

**Gestion Ventes & Agendas** est une application web professionnelle qui centralise la gestion complète d'une activité commerciale : ventes (mono et multi-produits), stocks, clients, remboursements, comptabilité, rendez-vous, commandes/réservations, prêts, dépenses, pointage des travailleurs, tâches, notes et analyses de tendances.

### Architecture globale

```
┌──────────────────────────┐     ┌───────────────────────────┐     ┌─────────────────────┐
│     FRONTEND (React)     │◄───►│   BACKEND (Express.js)    │◄───►│  BASE DE DONNÉES    │
│  React 19 + TypeScript   │     │   Node.js + JWT + SSE     │     │  Fichiers JSON      │
│  Tailwind CSS + shadcn   │     │   Multer (uploads)        │     │  (server/db/)       │
│  Framer Motion           │     │   bcrypt (auth)           │     │  25 fichiers JSON   │
│  Recharts (graphiques)   │     │   CORS + Rate Limiting    │     │                     │
│  Axios + SSE             │     │   24 routes API           │     │                     │
└──────────────────────────┘     └───────────────────────────┘     └─────────────────────┘
```

---

## 📌 2. STACK TECHNOLOGIQUE

### Frontend
| Technologie | Rôle |
|-------------|------|
| React 19 + TypeScript | Framework UI avec typage statique |
| Vite | Build tool ultra-rapide |
| Tailwind CSS 4 | Styles utilitaires |
| shadcn/ui | 40+ composants UI professionnels |
| Framer Motion | Animations fluides |
| React Router 7 | Navigation SPA |
| Axios + axios-retry | HTTP avec retry automatique |
| Recharts | Graphiques interactifs |
| jsPDF | Génération de PDF |
| date-fns | Manipulation de dates |
| Zod + React Hook Form | Validation de formulaires |

### Backend
| Technologie | Rôle |
|-------------|------|
| Node.js 18+ | Runtime JavaScript serveur |
| Express.js 4 | Framework HTTP |
| JWT | Authentification (8h) |
| bcryptjs | Hash des mots de passe |
| Multer | Upload de fichiers |
| SSE | Synchronisation temps réel |
| Rate limiting | Protection anti-DDoS |

---

## 📌 3. MODULES FONCTIONNELS

### 3.1 Authentification
- Inscription / Connexion / Déconnexion
- Token JWT (8h), auto-déconnexion
- Réinitialisation de mot de passe
- Routes protégées

### 3.2 Produits & Stock
- CRUD avec photos multiples et slideshow
- Code produit auto-généré
- Suivi des stocks avec alertes

### 3.3 Ventes
- Ventes simples et multiples
- Filtrage par mois/année/client
- Export PDF et génération de factures
- Calcul automatique des bénéfices

### 3.4 Clients
- CRUD avec cartes visuelles
- Recherche avec auto-complétion
- Historique des achats

### 3.5 Commandes & Réservations
- CRUD avec statuts (en attente → livrée)
- Lien automatique avec RDV et tâches
- Possibilité de reporter

### 3.6 Rendez-vous
- Calendrier mensuel interactif
- Notifications de RDV à venir
- Statistiques détaillées

### 3.7 Prêts
- **Prêts famille** : suivi des remboursements
- **Prêts produits** : crédits clients avec alertes de retard

### 3.8 Dépenses & Comptabilité
- Dépenses variables et fixes
- Comptabilité (entrées vs sorties)
- Achats et fournisseurs
- Bénéfices avec historique

### 3.9 Messages
- Messagerie interne avec statut lu/non lu

### 3.10 Objectifs
- Barre de progression dans la navbar
- Réinitialisation au 1er du mois (commence à 2000€)

### 3.11 Pointage & Travail ⭐
- Pointage journalier/horaire par entreprise
- Gestion des travailleurs et entreprises
- **Avances sur salaire** avec contrôle du plafond
- Total du mois/année avec avances
- Détail par personne avec reste

### 3.12 Tâches ⭐
- Planification avec date/heure/importance
- Assignation à un travailleur
- Vues : calendrier, jour (timeline), semaine
- Lien avec commandes

### 3.13 Notes Kanban ⭐
- Tableau Kanban avec colonnes personnalisables
- Drag & drop entre colonnes
- Dessins intégrés (canvas → JPEG)
- Séparateurs visuels colorés
- Vue détail cliquable

### 3.14 Tendances
- Graphiques de ventes par mois/produit/client
- Comparaison mois en cours vs précédent

---

## 📌 4. STRUCTURE DES FICHIERS

### Frontend (src/) — ~100 fichiers
```
src/
├── pages/          28 fichiers     # Pages de l'application
├── components/     80+ fichiers    # Composants React
├── services/api/   24 fichiers     # Services API
├── contexts/       ~3 fichiers     # Contextes React
├── hooks/          ~5 fichiers     # Hooks personnalisés
└── lib/            ~2 fichiers     # Utilitaires
```

### Backend (server/) — ~75 fichiers
```
server/
├── server.js       1 fichier       # Point d'entrée (347 lignes)
├── middleware/      2 fichiers      # Auth + Security
├── models/         23 fichiers     # Modèles de données
├── routes/         24 fichiers     # Routes API
├── db/             25 fichiers     # Base de données JSON
└── uploads/        ~n fichiers     # Fichiers uploadés
```

---

## 📌 5. API REST

24 groupes de routes API, toutes préfixées par `/api/` :

| Route | Méthodes | Authentification |
|-------|----------|-----------------|
| `/api/auth/*` | POST | Non (login/register publics) |
| `/api/products` | GET, POST, PUT, DELETE | GET public, reste protégé |
| `/api/sales` | GET, POST, PUT, DELETE | Protégé |
| `/api/clients` | GET, POST, PUT, DELETE | Protégé |
| `/api/commandes` | GET, POST, PUT, DELETE | Protégé |
| `/api/rdv` | GET, POST, PUT, DELETE | Protégé |
| `/api/rdv-notifications` | GET, POST, PUT, DELETE | Protégé |
| `/api/pretfamilles` | GET, POST, PUT, DELETE | Protégé |
| `/api/pretproduits` | GET, POST, PUT, DELETE | Protégé |
| `/api/depenses` | GET, POST, PUT, DELETE | Protégé |
| `/api/benefices` | GET, POST, DELETE | Protégé |
| `/api/compta` | GET, POST, PUT, DELETE | Protégé |
| `/api/nouvelle-achat` | GET, POST, PUT, DELETE | Protégé |
| `/api/fournisseurs` | GET, POST, PUT, DELETE | Protégé |
| `/api/remboursements` | GET, POST, DELETE | Protégé |
| `/api/messages` | GET, POST, PUT, DELETE | Protégé |
| `/api/objectif` | GET, POST, PUT, DELETE | Protégé |
| `/api/pointages` | GET, POST, PUT, DELETE | Protégé |
| `/api/travailleurs` | GET, POST, PUT, DELETE | Protégé |
| `/api/entreprises` | GET, POST, PUT, DELETE | Protégé |
| `/api/taches` | GET, POST, PUT, DELETE | Protégé |
| `/api/notes` | GET, POST, PUT, DELETE | Protégé |
| `/api/avances` | GET, POST, PUT, DELETE | Protégé |
| `/api/sync/events` | GET (SSE) | Protégé |

---

## 📌 6. SÉCURITÉ

| Couche | Protection |
|--------|-----------|
| Auth | JWT signé (8h expiration) |
| Mots de passe | bcrypt (10 rounds salt) |
| CORS | Whitelist|
| Rate Limiting | 100 req/min par IP |
| Sanitization | Nettoyage XSS/injection |
| Headers | X-Frame-Options, CSP, etc. |
| Erreurs | Stack traces masquées en prod |

---

## 📌 7. DÉPLOIEMENT

| Composant | Plateforme |
|-----------|-----------|
| Frontend |  Vercel |
| Backend | Render (persistent disk) |
| BDD | Fichiers JSON sur Render |

---

## 📌 8. DOCUMENTATION

| Document | Contenu |
|----------|---------|
| `API_DOCUMENTATION.md` | Tous les endpoints API avec exemples |
| `ARCHITECTURE.md` | Architecture technique complète |
| `BACKEND_GUIDE.md` | Guide du backend avec structure détaillée |
| `CAHIER_DE_CHARGE.md` | Spécifications fonctionnelles |
| `FRONTEND_GUIDE.md` | Guide du frontend avec composants |
| `MAINTENANCE_GUIDE.md` | Guide de maintenance pas à pas |
| `DOCUMENTATION_COMPLETE.md` | Documentation technique exhaustive |
| `DOCUMENTATION_PROJET.md` | Documentation du projet |
| `DEPLOYMENT.md` | Guide de déploiement |
| `SECURITY.md` | Guide de sécurité |
| `TESTS_GUIDE.md` | Guide de tests |

---

## 💬 Widget Messagerie Instantanée (Live Chat)

Chat en direct visiteur ↔ admin avec :
- Envoi instantané (SSE + polling 2s)
- **Emoji picker** (20 emojis)
- **Like ❤️** un message
- **Modifier** ses propres messages
- **Supprimer** ses propres messages (affiche notice)
- Indicateur de frappe temps réel

**Composants** : `LiveChatVisitor.tsx`, `LiveChatAdmin.tsx`  
**Backend** : `server/routes/messagerie.js`  
**Base** : `server/db/messagerie.json`

---

## 🏭 Fournisseurs

Gestion automatique des fournisseurs (auto-créés lors d'ajout produit/achat).  
**API** : `server/routes/fournisseurs.js` | **Base** : `server/db/fournisseurs.json`

---

## 👤 Profil & Paramètres

Gestion complète du profil utilisateur et des paramètres de l'application.

**Fonctionnalités** : Édition profil, upload photo, changement mot de passe, sauvegarde/restauration/suppression BDD (chiffrement AES-256), gestion des rôles, configuration des modules.

**Composants décomposés** : `ProfileCard`, `ProfileAvatar`, `ProfileInfoCard`, `PasswordSection`, `ParametresSection`, `IndisponibiliteSection`, `ModuleSettingsSection`

**Backend** : `server/routes/profile.js`, `server/routes/settings.js`  
**Base** : `users.json`, `settings.json`, `moduleSettings.json`, `indisponible.json`, `parametretache.json`, `prixpointage.json`  
**Note** : La sauvegarde scanne dynamiquement tous les `*.json` dans `server/db/` — les nouveaux fichiers de BDD sont automatiquement inclus.
