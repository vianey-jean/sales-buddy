# 🔧 Guide de Maintenance — Documentation Complète

> **Version** : 1.0.0  
> **Dernière mise à jour** : Mars 2026  
> **But** : Permettre à toute personne, même sans expérience en code, de comprendre où se trouvent les fichiers et comment les modifier.

---

## 📌 Comment lire ce guide

Pour chaque module, nous indiquons :
- **Ce que ça fait** : description simple
- **Fichiers concernés** : chemin exact de chaque fichier
- **Pour modifier** : instructions pas à pas

> 💡 **Convention** : `Frontend` = ce que l'utilisateur voit (navigateur).  
> `Backend` = ce que le serveur fait (traitement des données).

---

## 📌 1. Page de Connexion (Login)

### Ce que ça fait
Permet à l'utilisateur de se connecter avec son email et mot de passe.

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/LoginPage.tsx` | Page de connexion visible |
| Frontend API | `src/services/api/authApi.ts` | Envoie email/mot de passe au serveur |
| Backend Route | `server/routes/auth.js` | Reçoit la requête et vérifie les identifiants |
| Backend Modèle | `server/models/User.js` | Lit les utilisateurs dans la base de données |
| Base de données | `server/db/users.json` | Stocke les utilisateurs (mots de passe hashés) |
| Middleware | `server/middleware/auth.js` | Vérifie le token JWT pour les routes protégées |

### Pour modifier
- **Changer le texte de la page** → Ouvrir `src/pages/LoginPage.tsx`
- **Changer la durée du token** → Ouvrir `server/routes/auth.js`, chercher `expiresIn`
- **Ajouter un champ au formulaire** → Modifier `LoginPage.tsx` (frontend) ET `auth.js` (backend)

---

## 📌 2. Page d'Inscription (Register)

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/RegisterPage.tsx` | Formulaire d'inscription |
| Frontend API | `src/services/api/authApi.ts` | Envoie les données au serveur |
| Backend Route | `server/routes/auth.js` | Crée le compte utilisateur |
| Backend Modèle | `server/models/User.js` | Sauvegarde dans users.json |
| Base de données | `server/db/users.json` | Stocke le nouvel utilisateur |

---

## 📌 3. Tableau de bord (Dashboard)

### Ce que ça fait
Page principale après connexion. Affiche les statistiques, les ventes récentes, et donne accès à toutes les fonctionnalités.

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/DashboardPage.tsx` | Page principale du dashboard |
| Composant | `src/components/dashboard/StatCard.tsx` | Carte de statistique |
| Composant | `src/components/dashboard/SalesTable.tsx` | Tableau des ventes |
| Composant | `src/components/dashboard/AdvancedDashboard.tsx` | Dashboard avancé |
| Composant | `src/components/dashboard/VentesProduits.tsx` | Ventes par produit |
| Composant | `src/components/dashboard/Inventaire.tsx` | Inventaire des produits |

### Pour modifier
- **Changer une carte de statistique** → `StatCard.tsx`
- **Modifier le tableau des ventes** → `SalesTable.tsx`
- **Ajouter un graphique** → Créer dans `src/components/dashboard/`

---

## 📌 4. Gestion des Produits

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/ProduitsPage.tsx` | Page des produits |
| Formulaire ajout | `src/components/dashboard/AddProductForm.tsx` | Formulaire d'ajout |
| Formulaire édition | `src/components/dashboard/EditProductForm.tsx` | Formulaire d'édition |
| Upload photos | `src/components/dashboard/PhotoUploadSection.tsx` | Gestion des photos |
| Slideshow | `src/components/dashboard/ProductPhotoSlideshow.tsx` | Diaporama photos |
| Recherche | `src/components/dashboard/ProductSearchInput.tsx` | Recherche auto-complétion |
| Frontend API | `src/services/api/productApi.ts` | Requêtes HTTP produits |
| Backend Route | `server/routes/products.js` | Routes API produits |
| Backend Modèle | `server/models/Product.js` | CRUD products.json |
| Base de données | `server/db/products.json` | Données des produits |
| Photos | `server/uploads/products/` | Photos uploadées |

---

## 📌 5. Gestion des Ventes

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/Ventes.tsx` | Page des ventes |
| Formulaire | `src/components/dashboard/AddSaleForm.tsx` | Formulaire d'ajout de vente |
| Tableau | `src/components/dashboard/SalesTable.tsx` | Tableau des ventes |
| Export | `src/components/dashboard/ExportSalesDialog.tsx` | Export PDF |
| Facture | `src/components/dashboard/InvoiceGenerator.tsx` | Génération de facture |
| Bénéfice | `src/components/dashboard/ProfitCalculator.tsx` | Calcul bénéfice |
| Par client | `src/components/dashboard/VentesParClientsModal.tsx` | Ventes groupées par client |
| Frontend API | `src/services/api/saleApi.ts` | Requêtes HTTP ventes |
| Backend Route | `server/routes/sales.js` | Routes API ventes |
| Backend Modèle | `server/models/Sale.js` | CRUD sales.json |
| Base de données | `server/db/sales.json` | Données des ventes |

---

## 📌 6. Gestion des Clients

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/ClientsPage.tsx` | Page des clients |
| Carte client | `src/components/clients/ClientCard.tsx` | Affichage d'un client |
| Grille | `src/components/clients/ClientsGrid.tsx` | Grille de clients |
| Hero | `src/components/clients/ClientsHero.tsx` | En-tête hero |
| Recherche | `src/components/clients/ClientSearchBar.tsx` | Barre de recherche |
| Formulaire | `src/components/forms/ClientForm.tsx` | Formulaire de client |
| Frontend API | `src/services/api/clientApi.ts` | Requêtes HTTP clients |
| Backend Route | `server/routes/clients.js` | Routes API clients |
| Backend Modèle | `server/models/Client.js` | CRUD clients.json |
| Base de données | `server/db/clients.json` | Données des clients |

---

## 📌 7. Commandes & Réservations

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/CommandesPage.tsx` | Page des commandes |
| Formulaire | `src/components/commandes/CommandeFormDialog.tsx` | Création/édition |
| Tableau | `src/components/commandes/CommandesTable.tsx` | Tableau des commandes |
| Hero | `src/components/commandes/CommandesHero.tsx` | En-tête hero |
| Stats | `src/components/commandes/CommandesStatsButtons.tsx` | Boutons statistiques |
| Recherche | `src/components/commandes/CommandesSearchBar.tsx` | Recherche |
| Dialogues | `src/components/commandes/CommandesDialogs.tsx` | Dialogues de détail |
| Confirmation | `src/components/commandes/ConfirmationDialogs.tsx` | Confirmations |
| Reporter | `src/components/commandes/ReporterModal.tsx` | Reporter une commande |
| Créer RDV | `src/components/commandes/RdvCreationModal.tsx` | Créer un RDV |
| Frontend API | `src/services/api/commandeApi.ts` | Requêtes HTTP |
| Backend Route | `server/routes/commandes.js` | Routes API |
| Backend Modèle | `server/models/Commande.js` | CRUD commandes.json |
| Base de données | `server/db/commandes.json` | Données |

---

## 📌 8. Rendez-vous

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/RdvPage.tsx` | Page des rendez-vous |
| Calendrier | `src/components/rdv/RdvCalendar.tsx` | Calendrier mensuel |
| Carte RDV | `src/components/rdv/RdvCard.tsx` | Affichage d'un RDV |
| Formulaire | `src/components/rdv/RdvForm.tsx` | Formulaire de RDV |
| Notifications | `src/components/rdv/RdvNotifications.tsx` | Alertes RDV à venir |
| Stats | `src/components/rdv/RdvStatsCards.tsx` | Cartes de stats |
| Frontend API | `src/services/api/rdvApi.ts` | Requêtes HTTP |
| Backend Route | `server/routes/rdv.js` | Routes API |
| Backend Modèle | `server/models/Rdv.js` | CRUD rdv.json |
| Base de données | `server/db/rdv.json` | Données |

---

## 📌 9. Pointage & Travail ⭐

### Ce que ça fait
Enregistre les heures de travail des travailleurs dans différentes entreprises. Permet de gérer les avances sur salaire.

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/PointagePage.tsx` | Page principale (3 onglets) |
| Hero | `src/components/pointage/PointageHero.tsx` | En-tête avec boutons |
| Calendrier | `src/components/pointage/PointageCalendar.tsx` | Calendrier mensuel |
| Navigation | `src/components/pointage/PointageTabNav.tsx` | Onglets Pointage/Tâches/Notes |
| Liste entreprises | `src/components/pointage/PointageEntreprisesList.tsx` | Liste entreprises |
| Liste travailleurs | `src/components/pointage/PointageTravailleursList.tsx` | Liste travailleurs |
| Recherche | `src/components/pointage/TravailleurSearchInput.tsx` | Recherche travailleur |
| **Formulaire pointage** | `src/components/pointage/modals/PointageFormModal.tsx` | Nouveau pointage |
| **Édition pointage** | `src/components/pointage/modals/EditPointageModal.tsx` | Modifier pointage |
| **Détail jour** | `src/components/pointage/modals/DayDetailModal.tsx` | Détail d'un jour |
| **Détail mois** | `src/components/pointage/modals/MonthDetailModal.tsx` | Total mois + avances |
| **Total année** | `src/components/pointage/modals/YearlyTotalModal.tsx` | Récap annuel + avances |
| **Par personne** | `src/components/pointage/modals/ParPersonneModal.tsx` | Détail par travailleur |
| **Avance** | `src/components/pointage/modals/AvanceModal.tsx` | Prise d'avance |
| **Entreprise** | `src/components/pointage/modals/EntrepriseModal.tsx` | CRUD entreprise |
| **Travailleur** | `src/components/pointage/modals/TravailleurModal.tsx` | CRUD travailleur |
| Confirmations | `src/components/pointage/modals/PointageConfirmDialogs.tsx` | Confirmations |
| Frontend API | `src/services/api/pointageApi.ts` | Requêtes pointages |
| Frontend API | `src/services/api/travailleurApi.ts` | Requêtes travailleurs |
| Frontend API | `src/services/api/entrepriseApi.ts` | Requêtes entreprises |
| Frontend API | `src/services/api/avanceApi.ts` | Requêtes avances |
| Backend Route | `server/routes/pointage.js` | Routes pointages |
| Backend Route | `server/routes/travailleur.js` | Routes travailleurs |
| Backend Route | `server/routes/entreprise.js` | Routes entreprises |
| Backend Route | `server/routes/avance.js` | Routes avances |
| Backend Modèle | `server/models/Pointage.js` | CRUD pointage.json |
| Backend Modèle | `server/models/Travailleur.js` | CRUD travailleur.json |
| Backend Modèle | `server/models/Entreprise.js` | CRUD entreprise.json |
| Backend Modèle | `server/models/Avance.js` | CRUD avance.json |
| Base de données | `server/db/pointage.json` | Pointages |
| Base de données | `server/db/travailleur.json` | Travailleurs |
| Base de données | `server/db/entreprise.json` | Entreprises |
| Base de données | `server/db/avance.json` | Avances |

### Pour modifier
- **Changer le formulaire de pointage** → `PointageFormModal.tsx`
- **Modifier le calcul des totaux** → `PointageHero.tsx` (affichage) et `MonthDetailModal.tsx` (détail)
- **Changer les règles d'avance** → `AvanceModal.tsx` (validation frontend)
- **Modifier l'affichage par personne** → `ParPersonneModal.tsx`
- **Ajouter un champ au travailleur** → `TravailleurModal.tsx` + `server/models/Travailleur.js`
- **Modifier le backend pointage** → `server/routes/pointage.js`

---

## 📌 10. Tâches ⭐

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Orchestrateur | `src/components/tache/TacheView.tsx` | Gère tout le module tâches |
| Hero | `src/components/tache/TacheHero.tsx` | En-tête avec compteurs |
| Calendrier | `src/components/tache/TacheCalendar.tsx` | Calendrier mensuel |
| Vue jour | `src/components/tache/TacheDayModal.tsx` | Timeline du jour |
| Vue semaine | `src/components/tache/TacheWeekModal.tsx` | Planning hebdomadaire |
| Formulaire | `src/components/tache/TacheFormModal.tsx` | Création/édition tâche |
| Notifications | `src/components/tache/TacheNotificationBar.tsx` | Alertes |
| Validation | `src/components/tache/TacheValidationModal.tsx` | Validation |
| Confirmation | `src/components/tache/TacheConfirmDialog.tsx` | Dialogue de confirmation |
| Frontend API | `src/services/api/tacheApi.ts` | Requêtes HTTP |
| Backend Route | `server/routes/tache.js` | Routes API |
| Backend Modèle | `server/models/Tache.js` | CRUD tache.json |
| Base de données | `server/db/tache.json` | Données |

### Pour modifier
- **Changer le formulaire de tâche** → `TacheFormModal.tsx`
- **Modifier la vue jour** → `TacheDayModal.tsx`
- **Changer la vue semaine** → `TacheWeekModal.tsx`

---

## 📌 11. Notes Kanban ⭐

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Vue Kanban | `src/components/notes/NotesKanbanView.tsx` | Board complet |
| Colonne | `src/components/notes/KanbanColumn.tsx` | Une colonne |
| Carte note | `src/components/notes/NoteCard.tsx` | Une note (cliquable) |
| Formulaire | `src/components/notes/NoteFormModal.tsx` | Création/édition note |
| Dessin | `src/components/notes/DrawingCanvas.tsx` | Canvas de dessin |
| Colonne form | `src/components/notes/ColumnFormModal.tsx` | Création/édition colonne |
| Confirmation | `src/components/notes/ConfirmModal.tsx` | Dialogue de confirmation |
| Constantes | `src/components/notes/constants.ts` | Couleurs, priorités |
| Frontend API | `src/services/api/noteApi.ts` | Requêtes + upload dessin |
| Backend Route | `server/routes/notes.js` | Routes API + upload |
| Backend Modèle | `server/models/Note.js` | CRUD notes.json + colonnes |
| Base de données | `server/db/notes.json` | Notes |
| Base de données | `server/db/noteColumns.json` | Colonnes |
| Dessins | `server/uploads/notes/dessin/` | Fichiers JPEG |

### Pour modifier
- **Changer l'apparence d'une note** → `NoteCard.tsx`
- **Modifier le formulaire de note** → `NoteFormModal.tsx`
- **Changer le canvas de dessin** → `DrawingCanvas.tsx`
- **Modifier les séparateurs** → `NotesKanbanView.tsx`

---

## 📌 12. Objectifs

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Indicateur navbar | `src/components/navbar/ObjectifIndicator.tsx` | Barre de progression |
| Stats | `src/components/navbar/ObjectifStatsModal.tsx` | Modale de stats |
| Changements | `src/components/navbar/modals/ObjectifChangesModal.tsx` | Historique du mois |
| Frontend API | `src/services/api/objectifApi.ts` | Requêtes HTTP |
| Backend Route | `server/routes/objectif.js` | Routes API |
| Backend Modèle | `server/models/Objectif.js` | CRUD objectif.json |
| Base de données | `server/db/objectif.json` | Données |

### Règle métier
- Au 1er du mois, les objectifs sont automatiquement réinitialisés
- Seuls les objectifs du mois en cours sont affichés
- Le compteur commence toujours à 2000€

---

## 📌 13. Dépenses

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Frontend Page | `src/pages/Depenses.tsx` | Page des dépenses |
| Composant | `src/components/dashboard/DepenseDuMois.tsx` | Suivi mensuel |
| Frontend API | `src/services/api/depenseApi.ts` | Requêtes HTTP |
| Backend Route | `server/routes/depenses.js` | Routes API |
| Backend Modèle | `server/models/DepenseDuMois.js` | CRUD |
| Base de données | `server/db/depensedumois.json` | Dépenses variables |
| Base de données | `server/db/depensefixe.json` | Dépenses fixes |

---

## 📌 14. Comptabilité & Bénéfices

### Fichiers concernés

| Côté | Fichier | Rôle |
|------|---------|------|
| Page compta | `src/pages/Comptabilite.tsx` | Page comptabilité |
| Historique bénéfices | `src/components/navbar/modals/BeneficesHistoriqueModal.tsx` | Historique |
| Historique ventes | `src/components/navbar/modals/VentesHistoriqueModal.tsx` | Historique |
| Frontend API | `src/services/api/comptaApi.ts` | Requêtes compta |
| Frontend API | `src/services/api/beneficeApi.ts` | Requêtes bénéfices |
| Backend Routes | `server/routes/compta.js`, `server/routes/benefices.js` | API |
| Backend Modèles | `server/models/Compta.js`, `server/models/Benefice.js` | CRUD |
| Bases de données | `server/db/compta.json`, `server/db/benefice.json` | Données |

---

## 📌 15. Messages

### Fichiers concernés

| Côté | Fichier |
|------|---------|
| Frontend Page | `src/pages/MessagesPage.tsx` |
| Frontend API | `src/services/api/index.ts` (via messageApi) |
| Backend Route | `server/routes/messages.js` |
| Backend Modèle | `server/models/Message.js` |
| Base de données | `server/db/messages.json` |

---

## 📌 16. Tendances & Analyses

### Fichiers concernés

| Côté | Fichier |
|------|---------|
| Frontend Page | `src/pages/TendancesPage.tsx` |
| Stats modales | `src/components/tendances/TendancesStatsModals.tsx` |

---

## 📌 17. Prêts (Familles & Produits)

### Fichiers concernés

| Côté | Fichier |
|------|---------|
| Page familles | `src/pages/PretFamilles.tsx` |
| Page produits | `src/pages/PretProduits.tsx` |
| Composant familles | `src/components/dashboard/PretFamilles.tsx` |
| Composant produits | `src/components/dashboard/PretProduits.tsx` |
| Groupé | `src/components/dashboard/PretProduitsGrouped.tsx` |
| Alerte retard | `src/components/dashboard/PretRetardNotification.tsx` |
| API familles | `src/services/api/pretFamilleApi.ts` |
| API produits | `src/services/api/pretProduitApi.ts` |
| Backend familles | `server/routes/pretfamilles.js`, `server/models/PretFamille.js` |
| Backend produits | `server/routes/pretproduits.js`, `server/models/PretProduit.js` |
| BDD | `server/db/pretfamilles.json`, `server/db/pretproduits.json` |

---

## 📌 18. Page Contact

### Fichiers concernés

| Côté | Fichier |
|------|---------|
| Frontend Page | `src/pages/ContactPage.tsx` |

### Pour modifier
- Ouvrir `src/pages/ContactPage.tsx`
- Modifier le texte, les coordonnées ou le formulaire

---

## 📌 19. Page À Propos

### Fichiers concernés

| Côté | Fichier |
|------|---------|
| Frontend Page | `src/pages/AboutPage.tsx` |

---

## 📌 20. Navigation & Layout

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/components/Layout.tsx` | Structure générale (navbar + contenu + footer) |
| `src/components/Navbar.tsx` | Barre de navigation principale |
| `src/components/Footer.tsx` | Pied de page |
| `src/components/ScrollToTop.tsx` | Remontée automatique en haut |

---

## 📌 21. Configuration serveur (Backend)

### Fichier principal : `server/server.js`

| Section | Lignes | Description |
|---------|--------|-------------|
| En-tête | 1-15 | Documentation du fichier |
| Imports | 17-32 | Chargement des modules |
| Init Express | 37-39 | Création de l'app Express |
| Compression | 46 | Compression gzip |
| Security headers | 48-49 | Headers de sécurité HTTP |
| CORS | 52-97 | Configuration des origines autorisées |
| Rate limit | 99-109 | Limitation à 100 req/min |
| Body parser | 114-116 | Parsing JSON (limite 10mb) |
| Sanitization | 118-124 | Nettoyage des inputs (sauf dessins) |
| Init BDD | 126-248 | Création des fichiers JSON par défaut |
| Import routes | 250-275 | Chargement de tous les fichiers de routes |
| Montage routes | 277-302 | `app.use('/api/...', routeHandler)` |
| Fichiers statiques | 304-305 | Serveur de fichiers uploads |
| Handler 404 | 307-310 | Route non trouvée |
| Erreurs globales | 312-325 | Gestion centralisée des erreurs |
| Arrêt gracieux | 327-340 | SIGTERM, exceptions, rejections |
| Démarrage | 342-347 | `app.listen(PORT)` |

### Pour ajouter une nouvelle route
1. Créer `server/db/nouveau.json` → `[]`
2. Créer `server/models/Nouveau.js` → copier un modèle existant
3. Créer `server/routes/nouveau.js` → copier une route existante
4. Dans `server/server.js` :
   - Ligne ~275 : `const nouveauRoutes = require('./routes/nouveau');`
   - Ligne ~302 : `app.use('/api/nouveau', nouveauRoutes);`
5. Créer `src/services/api/nouveauApi.ts` → copier un API existant

---

## 📌 22. Problèmes courants et solutions

### Erreur 401 (Non authentifié)
- **Cause** : Token JWT expiré ou absent
- **Solution** : Se reconnecter (le token dure 8 heures)
- **Fichier** : `server/middleware/auth.js`

### Erreur 400 (Bad Request)
- **Cause** : Données invalides ou sanitization trop agressive
- **Solution** : Vérifier le format des données envoyées
- **Fichier** : `server/middleware/security.js` (sanitization)

### Erreur 429 (Too Many Requests)
- **Cause** : Rate limiting déclenché
- **Solution** : Attendre 1 minute
- **Fichier** : `server/middleware/security.js`

### Dessin non enregistré
- **Cause** : Le base64 est trop gros ou la sanitization le bloque
- **Solution** : Vérifier que le path `/api/notes/upload-drawing` est exempté de sanitization
- **Fichier** : `server/server.js` ligne 118-124

### Données non synchronisées
- **Cause** : Connexion SSE perdue
- **Solution** : Recharger la page
- **Fichier** : `server/routes/sync.js`

---

## 💬 Maintenance Widget Messagerie Instantanée

### Fichiers concernés
| Fichier | Rôle |
|---------|------|
| `src/components/livechat/LiveChatVisitor.tsx` | Widget visiteur |
| `src/components/livechat/LiveChatAdmin.tsx` | Widget admin |
| `server/routes/messagerie.js` | Routes API backend |
| `server/db/messagerie.json` | Base de données messages |

### Fonctionnalités
- Emoji, Like ❤️, Modifier/Supprimer ses messages, temps réel SSE

### Problèmes courants
- **Messages non instantanés** : Vérifier SSE + polling 2s dans les composants
- **Like/Edit/Delete non fonctionnel** : Vérifier routes `/api/messagerie/edit`, `/delete`, `/like`

---

## 🏭 Maintenance Fournisseurs

### Fichiers
| Fichier | Rôle |
|---------|------|
| `server/routes/fournisseurs.js` | Routes API |
| `server/models/Fournisseur.js` | Modèle CRUD |
| `server/db/fournisseurs.json` | Base de données |
| `src/services/api/fournisseurApi.ts` | Service frontend |
