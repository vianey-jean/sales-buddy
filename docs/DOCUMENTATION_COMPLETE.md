# Documentation Complète du Projet - Gestion des Ventes

## 📋 Table des matières

1. [Architecture Générale](#architecture-générale)
2. [Structure Frontend (React)](#structure-frontend)
3. [Structure Backend (Express/Node.js)](#structure-backend)
4. [Composants Décomposés](#composants-décomposés)
5. [Hooks Personnalisés](#hooks-personnalisés)
6. [Services API](#services-api)
7. [Types TypeScript](#types-typescript)
8. [Contextes React](#contextes-react)
9. [Pages de l'Application](#pages)
10. [Système de Remboursement](#système-de-remboursement)

---

## Architecture Générale

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  Vite + TypeScript + Tailwind CSS + Framer Motion    │
├─────────────────────────────────────────────────────┤
│  Pages → Composants → Hooks → Services API           │
│  Contextes (Auth, App, Theme, Accessibility)         │
└────────────────────┬────────────────────────────────┘
                     │ HTTP (Axios)
┌────────────────────▼────────────────────────────────┐
│                  Backend (Express.js)                 │
│  Node.js + JSON file storage + JWT Auth              │
├─────────────────────────────────────────────────────┤
│  Routes → Middleware → Models → DB (JSON files)      │
└─────────────────────────────────────────────────────┘
```

## Structure Frontend

### Pages (`src/pages/`)
| Page | Fichier | Description |
|------|---------|-------------|
| Accueil | `HomePage.tsx` | Landing page premium avec hero, features, CTA |
| Dashboard | `DashboardPage.tsx` | Tableau de bord principal avec 6 onglets |
| Clients | `ClientsPage.tsx` | Gestion CRUD des clients VIP |
| Commandes | `CommandesPage.tsx` | Commandes et réservations avec sync RDV |
| Tendances | `TendancesPage.tsx` | Analytics, graphiques, recommandations IA et analyse clients |
| RDV | `RdvPage.tsx` | Gestion des rendez-vous avec calendrier |
| Messages | `MessagesPage.tsx` | Messagerie interne |
| Produits | `ProduitsPage.tsx` | Inventaire produits avec photos, codes uniques |
| Login | `LoginPage.tsx` | Authentification |
| Register | `RegisterPage.tsx` | Inscription |

### Composants Décomposés

#### Dashboard (`src/pages/dashboard/`)
- **DashboardHero.tsx** - Section titre animé avec icônes premium
- **DashboardTabNavigation.tsx** - 6 onglets configurés via tableau de données
- **DashboardTabContent.tsx** - Contenu de chaque onglet avec header visuel

#### Clients (`src/pages/clients/`)
- **ClientHero.tsx** - Header héroïque avec compteur et bouton d'ajout
- **ClientSearchSection.tsx** - Barre de recherche avec indicateur de résultats

#### Tendances (`src/pages/tendances/`)
- **TendancesHero.tsx** - Section titre animée
- **TendancesClientsTab.tsx** - Analyse clients : top acheteurs, CA par client, tri, détails cliquables
- **TendancesOverviewTab.tsx** - Vue d'ensemble des tendances
- **TendancesProductsTab.tsx** - Analyse par produit
- **TendancesCategoriesTab.tsx** - Analyse par catégorie
- **TendancesStockTab.tsx** - Analyse du stock
- **TendancesRecommendationsTab.tsx** - Recommandations d'achat IA
- **useTendancesData.ts** - Hook centralisant toute la logique de calcul

#### Dashboard Ventes (`src/components/dashboard/`)
- **SalesTable.tsx** - Tableau des ventes temps réel, mois en cours, lignes rouges pour remboursements
- **AddSaleForm.tsx** - Formulaire ajout/modification vente avec bouton Rembourser
- **RefundForm.tsx** - Formulaire de remboursement avec confirmation de stock
- **ViewRefundsModal.tsx** - Modal de consultation des remboursements du mois
- **MultiProductSaleForm.tsx** - Vente multi-produits avec bouton Rembourser
- **InvoiceGenerator.tsx** - Génération de factures PDF
- **VentesParClientsModal.tsx** - Ventes groupées par client
- **ProfitCalculator.tsx** - Calculateur de bénéfices
- **Inventaire.tsx** - Gestion d'inventaire
- **DepenseDuMois.tsx** - Dépenses mensuelles
- **PretFamilles.tsx** - Prêts familles
- **PretProduits.tsx** - Prêts produits avec avances

#### Sections Dashboard
- **SalesManagementSection.tsx** - Section boutons d'actions : vente multi, facture, ventes par clients, remboursement, voir remboursements
- **SalesOverviewSection.tsx** - Aperçu ventes avec stats cliquables, navigation vers /produits
- **AdvancedDashboardSection.tsx** - Dashboard avancé

#### Comptabilité (`src/components/dashboard/comptabilite/`)
- **ComptabiliteModule.tsx** - Module principal
- **ComptabiliteHeader.tsx** - En-tête
- **ComptabiliteStatsCards.tsx** - Cartes statistiques
- **ComptabiliteTabs.tsx** - Onglets
- **AchatFormDialog.tsx** - Formulaire d'achat
- **DepenseFormDialog.tsx** - Formulaire de dépense
- Modaux: AchatsProduitsModal, AutresDepensesModal, BeneficeReelModal, etc.

### Hooks (`src/hooks/`)
| Hook | Description |
|------|-------------|
| `useClients` | Gestion des clients avec CRUD |
| `useCommandes` | Gestion des commandes |
| `useComptabilite` | Données comptables |
| `useProducts` | Gestion des produits |
| `useSales` | Gestion des ventes |
| `useRdv` | Gestion des rendez-vous |
| `useObjectif` | Objectifs mensuels |
| `use-mobile` | Détection mobile |
| `use-currency-formatter` | Formatage monétaire |
| `use-messages` | Messages internes |
| `use-auto-logout` | Déconnexion automatique |
| `useBusinessCalculations` | Calculs métier |
| `useClientSync` | Synchronisation clients |
| `usePhoneActions` | Actions téléphone |

### Services API (`src/services/api/`)
| Service | Endpoint | Description |
|---------|----------|-------------|
| `authApi` | `/api/auth/*` | Authentification JWT |
| `clientApi` | `/api/clients/*` | CRUD clients |
| `productApi` | `/api/products/*` | CRUD produits |
| `saleApi` | `/api/sales/*` | CRUD ventes |
| `commandeApi` | `/api/commandes/*` | CRUD commandes |
| `rdvApi` | `/api/rdv/*` | CRUD rendez-vous |
| `comptaApi` | `/api/compta/*` | Comptabilité |
| `depenseApi` | `/api/depenses/*` | Dépenses |
| `beneficeApi` | `/api/benefices/*` | Bénéfices |
| `objectifApi` | `/api/objectif/*` | Objectifs |
| `remboursementApi` | `/api/remboursements/*` | Remboursements |
| `pretProduitApi` | `/api/pretproduits/*` | Prêts produits |
| `pretFamilleApi` | `/api/pretfamilles/*` | Prêts familles |
| `nouvelleAchatApi` | `/api/nouvelle-achat/*` | Nouveaux achats |
| `rdvNotificationsApi` | `/api/rdv-notifications/*` | Notifications RDV |

### Contextes (`src/contexts/`)
| Contexte | Description |
|----------|-------------|
| `AuthContext` | Gestion JWT, login/logout, état utilisateur |
| `AppContext` | Données globales (ventes, produits, clients), refreshData |
| `ThemeContext` | Thème clair/sombre |
| `FormProtectionContext` | Protection contre perte de formulaire |

---

## Structure Backend

### Routes (`server/routes/`)
| Route | Méthodes | Description |
|-------|----------|-------------|
| `/api/auth` | POST login/register | Authentification |
| `/api/clients` | GET, POST, PUT, DELETE | Clients |
| `/api/products` | GET, POST, PUT, DELETE | Produits (avec codes uniques auto-générés) |
| `/api/sales` | GET, POST, PUT, DELETE | Ventes |
| `/api/commandes` | GET, POST, PUT, DELETE | Commandes |
| `/api/rdv` | GET, POST, PUT, DELETE | Rendez-vous |
| `/api/compta` | GET, POST, PUT, DELETE | Comptabilité |
| `/api/depenses` | GET, POST, PUT, DELETE | Dépenses |
| `/api/benefices` | GET, POST, PUT, DELETE | Bénéfices |
| `/api/objectif` | GET, PUT | Objectifs mensuels |
| `/api/messages` | GET, POST, PUT, DELETE | Messages |
| `/api/remboursements` | GET, POST, DELETE | Remboursements |

### Middleware (`server/middleware/`)
| Middleware | Description |
|-----------|-------------|
| `auth.js` | Vérification JWT token |
| `security.js` | Rate limiting, CORS, headers sécurité |
| `validation.js` | Validation des entrées |
| `upload.js` | Upload de fichiers (photos produits) |
| `sync.js` | Synchronisation temps réel SSE |

### Modèles (`server/models/`)
| Modèle | Fichier JSON | Description |
|--------|-------------|-------------|
| `User.js` | `users.json` | Utilisateurs |
| `Client.js` | `clients.json` | Clients |
| `Product.js` | `products.json` | Produits (avec generateProductCode) |
| `Sale.js` | `sales.json` | Ventes (y compris remboursements négatifs) |
| `Commande.js` | `commandes.json` | Commandes |
| `Rdv.js` | `rdv.json` | Rendez-vous |
| `Compta.js` | `compta.json` | Comptabilité |
| `DepenseDuMois.js` | `depensedumois.json` | Dépenses mensuelles |
| `Benefice.js` | `benefice.json` | Bénéfices |
| `Objectif.js` | `objectif.json` | Objectifs |
| `Message.js` | `messages.json` | Messages |
| `NouvelleAchat.js` | `nouvelle_achat.json` | Nouveaux achats |
| `PretFamille.js` | `pretfamilles.json` | Prêts familles |
| `PretProduit.js` | `pretproduits.json` | Prêts produits |
| `Remboursement.js` | `remboursement.json` | Remboursements |
| `RdvNotification.js` | `rdvNotifications.json` | Notifications RDV |

### Base de données (`server/db/`)
Stockage exclusif en fichiers JSON. Pas de Supabase ni de base de données externe.

---

## Types TypeScript (`src/types/`)
| Type | Description |
|------|-------------|
| `Client` | id, nom, phone, adresse, dateCreation |
| `Product` | id, description, purchasePrice, quantity, code, photos |
| `Sale` | id, date, products[], clientName, profit, isRefund, originalSaleId |
| `SaleProduct` | productId, description, quantitySold, purchasePrice, sellingPrice, profit |
| `Commande` | id, clientNom, produits[], type, statut |
| `RDV` | id, titre, date, heureDebut, heureFin, statut |
| `Depense` | id, description, montant, date, categorie |

---

## Système de Remboursement

### Flux de remboursement

```
1. Utilisateur clique "Remboursement" ou "Rembourser" sur une vente
2. Recherche du client (min. 3 caractères) dans sales.json
3. Sélection de la vente à rembourser
4. Modification optionnelle : retrait de produits, changement de quantité/prix
5. Validation → Confirmation de remise en stock (si prix intégral)
6. Enregistrement :
   - Entrée négative dans sales.json (isRefund: true)
   - Entrée dans remboursement.json
   - Stock mis à jour si confirmé
```

### Logique de stock lors du remboursement

| Cas | Stock restauré ? | Explication |
|-----|-----------------|-------------|
| Prix remboursé = Prix de vente original | OUI (si confirmé) | Remboursement total → demande confirmation |
| Prix remboursé < Prix de vente original | NON | Remboursement partiel → pas de remise en stock |

### Calcul du bénéfice remboursé
```
bénéfice = (quantité × prix_remboursement_unitaire) - (quantité × prix_achat_unitaire)
// Stocké en négatif dans sales.json
```

### Suppression d'un remboursement

| Cas | Stock modifié ? | Explication |
|-----|----------------|-------------|
| Remboursement avec stock restauré | OUI (diminution) | Le stock est diminué de la quantité remboursée |
| Remboursement partiel (pas de stock) | NON | Aucun changement de stock |

### Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `src/components/dashboard/RefundForm.tsx` | Formulaire de remboursement avec confirmation stock |
| `src/components/dashboard/ViewRefundsModal.tsx` | Consultation remboursements du mois |
| `src/components/dashboard/AddSaleForm.tsx` | Bouton Rembourser + suppression remboursement |
| `src/components/dashboard/SalesTable.tsx` | Affichage lignes rouges pour remboursements |
| `src/components/dashboard/sections/SalesManagementSection.tsx` | Boutons Remboursement et Voir Remboursements |
| `src/services/api/remboursementApi.ts` | API client (getAll, getByMonth, searchSalesByClient, create, delete) |
| `server/routes/remboursements.js` | Routes backend (GET, POST, DELETE) |
| `server/models/Remboursement.js` | Modèle CRUD (getAll, getByMonthYear, create, delete) |
| `server/db/remboursement.json` | Stockage des remboursements |

---

## Fonctionnalités Clés

### 🔐 Authentification
- JWT avec refresh token
- Auto-logout après inactivité
- Route protégée via `ProtectedRoute`

### 📊 Tableau de Bord
- 6 onglets : Ventes, Prêts Familles, Prêts Produits, Dépenses, Inventaire, Calcul Bénéfice
- Données temps réel via SSE (Server-Sent Events)
- Graphiques Recharts interactifs
- Stats cliquables avec navigation vers /produits

### 🛒 Gestion des Ventes
- Vente mono-produit et multi-produits
- Remboursement total ou partiel avec gestion de stock
- Export PDF (jsPDF + autoTable)
- Facture par client
- Classement ventes par clients

### 💸 Remboursements
- Recherche par nom de client
- Sélection de vente spécifique
- Modification quantité et prix de remboursement
- Confirmation de remise en stock (remboursement intégral)
- Visualisation remboursements du mois
- Suppression avec gestion inverse du stock

### 📅 Rendez-vous
- Calendrier interactif avec drag & drop
- Synchronisation avec réservations
- Notifications et rappels

### 📈 Tendances & Analytics
- Graphiques par produit, catégorie, période
- Recommandations d'achat par ROI
- Alertes stock critique
- **Analyse clients** : classement par CA (tri asc/desc), détails cliquables avec historique achats, remboursements, fréquence
- Intelligence artificielle de suggestions

### 💰 Comptabilité
- Module complet achats/dépenses
- Bilan mensuel automatique
- Export PDF comptable

---

## 💬 Widget Messagerie Instantanée (Live Chat)

### Composants
- `LiveChatVisitor.tsx` — Widget public pour les visiteurs
- `LiveChatAdmin.tsx` — Widget admin avec liste de conversations

### Fonctionnalités
- Envoi/réception instantanée via SSE + polling fallback 2s
- **Emoji picker** : 20 emojis intégrés
- **Like** : Aimer le message de l'autre (❤️ toggle)
- **Modifier** : Modifier ses propres messages (affiche "modifié")
- **Supprimer** : Supprimer ses propres messages (affiche "Ce message a été supprimé")
- Indicateur de frappe en temps réel (points rouges animés)

### API Backend (`server/routes/messagerie.js`)
- `POST /api/messagerie/send` — Envoyer
- `PUT /api/messagerie/edit/:id` — Modifier (propre message)
- `DELETE /api/messagerie/delete/:id` — Supprimer (propre message)
- `POST /api/messagerie/like/:id` — Like/unlike
- `GET /api/messagerie/events` — SSE temps réel

### Base de données : `server/db/messagerie.json`

---

## 🏭 Fournisseurs

- Auto-créés lors d'ajout produit ou achat comptabilité
- Recherche autocomplétion, CRUD complet
- API : `server/routes/fournisseurs.js`
- Base : `server/db/fournisseurs.json`

---

## 👤 Profil & Paramètres

### Page : `src/pages/ProfilePage.tsx`
Décomposée en composants réutilisables :
- `ProfileCard.tsx` — Avatar animé + identité + rôle
- `ProfileAvatar.tsx` — Anneaux pulsants verts autour de la photo
- `ProfileInfoCard.tsx` — Édition des informations personnelles
- `PasswordSection.tsx` — Changement de mot de passe avec force check
- `ParametresSection.tsx` — Configuration admin (sauvegarde, rôles, modules)

### API
- Frontend : `src/services/api/profileApi.ts`, `src/services/api/settingsApi.ts`
- Backend : `server/routes/profile.js`, `server/routes/settings.js`
- La sauvegarde/restauration scanne dynamiquement `server/db/*.json`

### Base de données
- `users.json`, `settings.json`, `moduleSettings.json`, `indisponible.json`, `parametretache.json`, `prixpointage.json`
