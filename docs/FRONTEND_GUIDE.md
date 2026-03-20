
# 🎨 Guide Frontend — Documentation Complète

> **Version** : 5.0.0  
> **Dernière mise à jour** : Mars 2026  
> **Framework** : React 19 + TypeScript  
> **Build** : Vite  
> **Styles** : Tailwind CSS 4 + shadcn/ui

---

## 📌 1. Structure des composants

### Hiérarchie complète
```
src/components/
│
├── ui/                          # Composants de base shadcn/ui
│   ├── button.tsx               # Boutons avec variants
│   ├── input.tsx                # Champs de saisie
│   ├── card.tsx                 # Cartes conteneur
│   ├── dialog.tsx               # Modales/dialogues
│   ├── select.tsx               # Listes déroulantes
│   ├── toast.tsx                # Notifications toast
│   ├── tabs.tsx                 # Onglets
│   ├── calendar.tsx             # Calendrier date-picker
│   ├── tooltip.tsx              # Infobulles
│   └── ... (40+ composants)     # Voir src/components/ui/
│
├── auth/                        # Authentification
│   └── (composants de connexion/inscription)
│
├── dashboard/                   # Tableau de bord principal
│   ├── StatCard.tsx             # Carte de statistique (chiffre + icône + couleur)
│   ├── AddProductForm.tsx       # Formulaire d'ajout de produit
│   ├── EditProductForm.tsx      # Formulaire d'édition de produit
│   ├── AddSaleForm.tsx          # Formulaire d'ajout de vente
│   ├── SalesTable.tsx           # Tableau des ventes avec tri/filtre
│   ├── VentesProduits.tsx       # Vue des ventes par produit
│   ├── Inventaire.tsx           # Gestion de l'inventaire
│   ├── InvoiceGenerator.tsx     # Générateur de factures PDF
│   ├── ProfitCalculator.tsx     # Calcul des bénéfices
│   ├── MonthlyResetHandler.tsx  # Réinitialisation mensuelle
│   ├── AdvancedDashboard.tsx    # Dashboard avancé avec graphiques
│   ├── DepenseDuMois.tsx        # Suivi des dépenses mensuelles
│   ├── PhotoUploadSection.tsx   # Upload de photos produits
│   ├── ProductPhotoSlideshow.tsx# Diaporama photos produits
│   ├── ProductSearchInput.tsx   # Recherche de produit avec auto-complétion
│   ├── ClientSearchInput.tsx    # Recherche de client avec auto-complétion
│   ├── ExportSalesDialog.tsx    # Export de ventes en PDF
│   ├── RefundForm.tsx           # Formulaire de remboursement
│   ├── ViewRefundsModal.tsx     # Historique des remboursements
│   ├── VentesParClientsModal.tsx # Ventes groupées par client
│   ├── PretFamilles.tsx         # Gestion des prêts famille
│   ├── PretProduits.tsx         # Gestion des prêts produits
│   ├── PretProduitsGrouped.tsx  # Prêts produits groupés par client
│   ├── PretRetardNotification.tsx # Alertes de retard de paiement
│   ├── ActionButton.tsx         # Bouton d'action premium
│   │
│   ├── accounting/              # Sous-module comptabilité
│   │   └── (achats, fournisseurs)
│   ├── comptabilite/            # Module comptabilité avancé
│   │   └── (bilans, graphiques)
│   ├── forms/                   # Formulaires spécifiques dashboard
│   ├── inventory/               # Gestion d'inventaire avancée
│   ├── prets/                   # Composants prêts
│   ├── reports/                 # Rapports et exports
│   └── sections/                # Sections du dashboard
│       ├── SalesOverviewSection.tsx  # Vue d'ensemble des ventes
│       └── SalesManagementSection.tsx # Gestion des ventes
│
├── clients/                     # Module Clients
│   ├── ClientCard.tsx           # Carte d'un client (nom, tél, adresse, actions)
│   ├── ClientSearchBar.tsx      # Barre de recherche clients
│   ├── ClientsGrid.tsx          # Grille de cartes clients
│   ├── ClientsHero.tsx          # En-tête hero du module clients
│   └── index.ts                 # Exports groupés
│
├── commandes/                   # Module Commandes
│   ├── CommandeFormDialog.tsx   # Formulaire de commande (modale)
│   ├── CommandesDialogs.tsx     # Dialogues groupés (détail, modification)
│   ├── CommandesHero.tsx        # En-tête hero du module commandes
│   ├── CommandesSearchBar.tsx   # Recherche de commandes
│   ├── CommandesStatsButtons.tsx # Boutons de statistiques
│   ├── CommandesTable.tsx       # Tableau des commandes
│   ├── ConfirmationDialogs.tsx  # Dialogues de confirmation
│   ├── RdvConfirmationModal.tsx # Confirmation de création RDV
│   ├── RdvCreationModal.tsx     # Formulaire de création RDV
│   ├── ReporterModal.tsx        # Reporter une commande
│   ├── TacheConflictModal.tsx   # Gestion conflit de tâche
│   └── index.ts                 # Exports groupés
│
├── navbar/                      # Barre de navigation
│   ├── ObjectifIndicator.tsx    # Indicateur de progression objectif (dans la navbar)
│   ├── ObjectifStatsModal.tsx   # Statistiques d'objectif (modale)
│   └── modals/
│       ├── ObjectifChangesModal.tsx  # Historique des changements d'objectif
│       │                              # Filtre par mois en cours, réinitialise au 1er
│       ├── BeneficesHistoriqueModal.tsx # Historique des bénéfices
│       └── VentesHistoriqueModal.tsx    # Historique des ventes
│
├── notes/                       # Module Notes Kanban
│   ├── NotesKanbanView.tsx      # Vue principale du Kanban board
│   │                             # Gère les colonnes, le drag & drop, les séparateurs
│   ├── KanbanColumn.tsx         # Une colonne du Kanban (titre, notes, actions)
│   ├── NoteCard.tsx             # Carte d'une note (titre, contenu, dessin, priorité)
│   │                             # Cliquable pour voir le détail
│   │                             # Boutons modifier/supprimer avec confirmation
│   ├── NoteFormModal.tsx        # Formulaire de création/modification de note
│   │                             # Gère l'upload de dessins vers le serveur
│   ├── DrawingCanvas.tsx        # Canvas HTML5 pour dessiner
│   │                             # Export en JPEG pour enregistrement
│   ├── ColumnFormModal.tsx      # Formulaire de création/modification de colonne
│   ├── ConfirmModal.tsx         # Dialogue de confirmation générique
│   └── constants.ts             # Constantes (couleurs, priorités)
│
├── pointage/                    # Module Pointage
│   ├── PointageHero.tsx         # En-tête hero du pointage
│   │                             # Boutons : Ajouter Entreprise, Travailleur,
│   │                             # Nouveau Pointage, Prise Avance,
│   │                             # Afficher par Personne
│   │                             # Total du mois cliquable → MonthDetailModal
│   ├── PointageCalendar.tsx     # Calendrier mensuel avec pointages coloriés
│   ├── PointageEntreprisesList.tsx # Liste des entreprises
│   ├── PointageTravailleursList.tsx # Liste des travailleurs
│   ├── PointageTabNav.tsx       # Navigation par onglets (Pointage/Tâches/Notes)
│   ├── TravailleurSearchInput.tsx # Recherche de travailleur
│   └── modals/
│       ├── PointageFormModal.tsx  # Formulaire de pointage
│       ├── EditPointageModal.tsx  # Modification d'un pointage
│       ├── DayDetailModal.tsx    # Détail d'un jour de pointage
│       ├── MonthDetailModal.tsx  # Détail du mois (pointages + avances + reste)
│       ├── YearlyTotalModal.tsx  # Total annuel par entreprise avec avances
│       ├── ParPersonneModal.tsx  # Détail par personne avec avances et reste
│       ├── AvanceModal.tsx       # Formulaire de prise d'avance
│       │                         # Recherche travailleur/entreprise
│       │                         # Affiche le total du mois et le reste
│       │                         # Validation : avance ≤ total du mois
│       ├── EntrepriseModal.tsx   # CRUD entreprise
│       ├── TravailleurModal.tsx  # CRUD travailleur
│       └── PointageConfirmDialogs.tsx # Dialogues de confirmation
│
├── tache/                       # Module Tâches
│   ├── TacheView.tsx            # Vue principale (orchestrateur)
│   │                             # Gère le state et les modales
│   ├── TacheHero.tsx            # En-tête avec compteurs cliquables
│   │                             # (total, pertinentes, optionnelles, terminées)
│   ├── TacheCalendar.tsx        # Calendrier mensuel avec marqueurs de tâches
│   ├── TacheDayModal.tsx        # Vue détaillée du jour (timeline heures)
│   ├── TacheFormModal.tsx       # Formulaire de création/modification
│   │                             # (date, heures, description, importance, travailleur)
│   ├── TacheWeekModal.tsx       # Vue hebdomadaire (7 jours)
│   ├── TacheNotificationBar.tsx # Barre de notifications
│   ├── TacheValidationModal.tsx # Validation avant action
│   └── TacheConfirmDialog.tsx   # Dialogue de confirmation
│
├── rdv/                         # Module Rendez-vous
│   ├── RdvCalendar.tsx          # Calendrier mensuel avec marqueurs RDV
│   ├── RdvCard.tsx              # Carte d'un rendez-vous
│   ├── RdvForm.tsx              # Formulaire de RDV
│   ├── RdvNotifications.tsx     # Notifications de RDV à venir
│   ├── RdvStatsCards.tsx        # Cartes de statistiques RDV
│   ├── RdvStatsDetailsModal.tsx # Détails des stats RDV
│   ├── RdvStatsModals.tsx       # Modales de stats RDV
│   └── index.ts                 # Exports groupés
│
├── tendances/                   # Module Tendances
│   └── TendancesStatsModals.tsx # Modales de statistiques avancées
│
├── business/                    # Composants métier
│   └── PureSalesTable.tsx       # Tableau de ventes pur (sans logique métier)
│
├── forms/                       # Formulaires génériques
│   └── ClientForm.tsx           # Formulaire de client réutilisable
│
├── common/                      # Composants partagés
├── shared/                      # Utilitaires UI partagés
├── navigation/                  # Composants de navigation
├── accessibility/               # Composants d'accessibilité
│
├── Layout.tsx                   # Layout principal (navbar + contenu + footer)
├── Navbar.tsx                   # Barre de navigation principale
├── Footer.tsx                   # Pied de page
├── ScrollToTop.tsx              # Retour en haut de page automatique
├── PasswordInput.tsx            # Input de mot de passe avec visibilité
└── PasswordStrengthChecker.tsx  # Indicateur de force du mot de passe
```

---

## 📌 2. Pages de l'application

```
src/pages/
│
├── Index.tsx                    # Page d'accueil (redirection selon auth)
├── HomePage.tsx                 # Page d'accueil publique
├── LoginPage.tsx                # Page de connexion
├── RegisterPage.tsx             # Page d'inscription
├── ResetPasswordPage.tsx        # Réinitialisation du mot de passe
├── NotFound.tsx                 # Page 404
├── AboutPage.tsx                # Page À propos
├── ContactPage.tsx              # Page de contact
│
├── DashboardPage.tsx            # Tableau de bord principal
│   └── dashboard/               # Sous-pages du dashboard
│
├── ProduitsPage.tsx             # Gestion des produits
├── Produits.tsx                 # Vue alternative des produits
│
├── Ventes.tsx                   # Gestion des ventes
├── VentesEmbedded.tsx           # Ventes intégrées (pour iframe)
│
├── ClientsPage.tsx              # Gestion des clients
│   └── clients/                 # Sous-pages clients
│
├── CommandesPage.tsx            # Gestion des commandes
│
├── RdvPage.tsx                  # Gestion des rendez-vous
│   └── rdv/                     # Sous-pages RDV
│
├── PointagePage.tsx             # Pointage, Tâches et Notes (3 onglets)
│                                 # Onglet 1 : Pointage (calendrier, formulaires, avances)
│                                 # Onglet 2 : Tâches (TacheView)
│                                 # Onglet 3 : Notes Kanban (NotesKanbanView)
│
├── MessagesPage.tsx             # Messagerie
│
├── Comptabilite.tsx             # Page de comptabilité
├── Depenses.tsx                 # Page des dépenses
│
├── PretFamilles.tsx             # Prêts familles
├── PretProduits.tsx             # Prêts produits (crédits clients)
│
├── Tendances.tsx                # Analyses et tendances
├── TendancesPage.tsx            # Page alternative tendances
│   └── tendances/               # Sous-pages tendances
```

---

## 📌 3. Services API

Chaque ressource backend a son propre fichier API dans `src/services/api/`.

### Pattern type d'un service API

```typescript
// src/services/api/pointageApi.ts
import api from './api';  // Instance Axios configurée

export interface PointageEntry {
  id: string;
  date: string;
  entrepriseId: string;
  entrepriseNom: string;
  typePaiement: 'journalier' | 'horaire';
  heures: number;
  prixJournalier: number;
  prixHeure: number;
  montantTotal: number;
  travailleurId?: string;
  travailleurNom?: string;
  createdAt?: string;
}

const pointageApi = {
  getAll: () => api.get<PointageEntry[]>('/api/pointages'),
  getByMonth: (year: number, month: number) => 
    api.get<PointageEntry[]>(`/api/pointages?year=${year}&month=${month}`),
  getByYear: (year: number) => 
    api.get<PointageEntry[]>(`/api/pointages?year=${year}`),
  create: (data: Omit<PointageEntry, 'id' | 'createdAt'>) => 
    api.post<PointageEntry>('/api/pointages', data),
  update: (id: string, data: Partial<PointageEntry>) => 
    api.put<PointageEntry>(`/api/pointages/${id}`, data),
  delete: (id: string) => api.delete(`/api/pointages/${id}`),
};

export default pointageApi;
```

### Liste complète des services API

| Fichier | Ressource | Endpoints principaux |
|---------|-----------|---------------------|
| `api.ts` | Configuration de base | Instance Axios, intercepteurs, retry |
| `authApi.ts` | Authentification | login, register, resetPassword |
| `productApi.ts` | Produits | CRUD + upload photos |
| `saleApi.ts` | Ventes | CRUD + filtrage par mois |
| `clientApi.ts` | Clients | CRUD |
| `commandeApi.ts` | Commandes | CRUD + statuts |
| `rdvApi.ts` | Rendez-vous | CRUD + filtrage par date |
| `rdvNotificationsApi.ts` | Notifications RDV | CRUD |
| `pretFamilleApi.ts` | Prêts famille | CRUD |
| `pretProduitApi.ts` | Prêts produits | CRUD |
| `depenseApi.ts` | Dépenses | CRUD + fixes |
| `beneficeApi.ts` | Bénéfices | CRUD |
| `comptaApi.ts` | Comptabilité | CRUD |
| `nouvelleAchatApi.ts` | Achats | CRUD |
| `fournisseurApi.ts` | Fournisseurs | CRUD |
| `remboursementApi.ts` | Remboursements | CRUD |
| `objectifApi.ts` | Objectifs | CRUD |
| `noteApi.ts` | Notes Kanban | CRUD + colonnes + upload dessin |
| `pointageApi.ts` | Pointage | CRUD + filtrage mois/année |
| `travailleurApi.ts` | Travailleurs | CRUD |
| `entrepriseApi.ts` | Entreprises | CRUD |
| `tacheApi.ts` | Tâches | CRUD + filtrage date/mois/semaine |
| `avanceApi.ts` | Avances | CRUD + filtrage travailleur/mois |

---

## 📌 4. Instance Axios (`api.ts`)

**Fichier** : `src/services/api/api.ts`

L'instance Axios est le point central de toutes les communications HTTP :

```
Configuration :
- baseURL : VITE_API_BASE_URL ou https://server-gestion-ventes.onrender.com
- timeout : 30 secondes
- Content-Type : application/json
- withCredentials : false

Intercepteur de requête :
- Ajoute automatiquement le token JWT depuis localStorage

Intercepteur de réponse :
- 401 → Supprime le token et redirige vers /login
- Erreurs réseau → Log silencieux (pas d'alerte utilisateur)

Retry :
- 2 tentatives automatiques
- Backoff exponentiel (2s, 4s)
- Uniquement pour erreurs réseau ou 503
```

---

## 📌 5. Design System

### Tokens CSS (index.css)
Le design utilise des tokens CSS HSL dans `:root` et `.dark` :
- `--background`, `--foreground` — Fond et texte
- `--primary`, `--primary-foreground` — Couleur principale
- `--secondary`, `--muted`, `--accent` — Couleurs secondaires
- `--destructive` — Rouge pour actions dangereuses
- `--border`, `--ring` — Bordures et focus

### Composants shadcn/ui
Tous les composants UI de base proviennent de shadcn/ui et sont personnalisés via Tailwind CSS.

### Animations (Framer Motion)
Les animations sont gérées par Framer Motion pour :
- Transitions de pages
- Apparition de modales
- Animations de cartes
- Effets de hover premium (boutons gradient avec mirrorShine)

---

## 💬 Widget Messagerie Instantanée (Live Chat)

### Composants
- `src/components/livechat/LiveChatVisitor.tsx` — Widget flottant pour visiteurs
- `src/components/livechat/LiveChatAdmin.tsx` — Widget flottant pour administrateurs

### Fonctionnalités UI
- **Emoji picker** : Bouton 😊 ouvrant un panneau de 20 emojis
- **Like ❤️** : Clic sur message → menu contextuel → Aimer/Retirer
- **Modifier** : Menu contextuel → Modifier (propres messages uniquement) → champ inline
- **Supprimer** : Menu contextuel → Supprimer → affiche "🚫 Ce message a été supprimé"
- **Menu contextuel** : Apparaît au clic sur un message, avec options contextuelles
- **Indicateur de frappe** : 3 points rouges animés (bounce)
- **Temps réel** : SSE + polling fallback 2s

### État local
- `messages`, `showEmojis`, `editingId`, `editText`, `contextMenuId`

---

## 🏭 Fournisseurs (Frontend)
- Service API : `src/services/api/fournisseurApi.ts`
- Intégré dans formulaires produits et comptabilité avec autocomplétion

---

## 👤 Page Profil (ProfilePage)

### Architecture décomposée
La page profil est décomposée en composants réutilisables :

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `ProfileCard` | `src/components/profile/ProfileCard.tsx` | Carte d'identité : avatar, nom, email, rôle, statut |
| `ProfileAvatar` | `src/components/profile/ProfileAvatar.tsx` | Avatar animé avec anneaux pulsants verts |
| `ProfileInfoCard` | `src/components/profile/ProfileInfoCard.tsx` | Informations personnelles éditables (prénom, nom, email, téléphone, adresse, genre) |
| `PasswordSection` | `src/components/profile/PasswordSection.tsx` | Changement de mot de passe sécurisé avec PasswordStrengthChecker |
| `ParametresSection` | `src/components/profile/ParametresSection.tsx` | Paramètres globaux (admin uniquement) |
| `IndisponibiliteSection` | `src/components/profile/IndisponibiliteSection.tsx` | Gestion des congés/indisponibilités |
| `ModuleSettingsSection` | `src/components/profile/ModuleSettingsSection.tsx` | Configuration par module |

### Onglets
- **Profil** : Visible par tous les utilisateurs — avatar, infos, mot de passe
- **Paramètres** : Visible uniquement par les administrateurs — config, backup, rôles

### Services API
- `src/services/api/profileApi.ts` — Profil utilisateur
- `src/services/api/settingsApi.ts` — Paramètres globaux
