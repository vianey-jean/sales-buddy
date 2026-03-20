
# 📡 Documentation API Complète

> **Version** : 5.0.0  
> **Dernière mise à jour** : Mars 2026  
> **Base URL Production** : `https://server-gestion-ventes.onrender.com`  
> **Base URL Local** : `http://localhost:10000`

---

## 📌 Table des matières

1. [Authentification](#authentification)
2. [Produits](#produits)
3. [Ventes](#ventes)
4. [Clients](#clients)
5. [Commandes & Réservations](#commandes--réservations)
6. [Rendez-vous](#rendez-vous)
7. [Notifications RDV](#notifications-rdv)
8. [Prêts Familles](#prêts-familles)
9. [Prêts Produits](#prêts-produits)
10. [Dépenses](#dépenses)
11. [Bénéfices](#bénéfices)
12. [Comptabilité](#comptabilité)
13. [Nouvelle Achat](#nouvelle-achat)
14. [Fournisseurs](#fournisseurs)
15. [Remboursements](#remboursements)
16. [Messages](#messages)
17. [Objectifs](#objectifs)
18. [Pointage](#pointage)
19. [Travailleurs](#travailleurs)
20. [Entreprises](#entreprises)
21. [Tâches](#tâches)
22. [Notes (Kanban)](#notes-kanban)
23. [Avances](#avances)
24. [Synchronisation temps réel (SSE)](#synchronisation-temps-réel)
25. [Gestion des erreurs](#gestion-des-erreurs)

---

## 🔐 Authentification

Toutes les routes protégées (🔒) nécessitent un header `Authorization` :
```
Authorization: Bearer <jwt_token>
```
Le token JWT expire après **8 heures**. Après expiration, l'utilisateur est automatiquement redirigé vers `/login`.

### POST `/api/auth/register`
🔓 **Public** — Inscription d'un nouvel utilisateur

**Request Body :**
```json
{
  "email": "string (requis, unique)",
  "password": "string (requis, min 6 caractères)",
  "firstName": "string (requis)",
  "lastName": "string (requis)",
  "gender": "male | female | other",
  "address": "string",
  "phone": "string"
}
```

**Response (201) :**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

### POST `/api/auth/login`
🔓 **Public** — Connexion utilisateur

**Request Body :**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200) :**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  }
}
```

### POST `/api/auth/reset-password-request`
🔓 **Public** — Demande de réinitialisation de mot de passe

**Request Body :**
```json
{ "email": "string" }
```

### POST `/api/auth/reset-password`
🔓 **Public** — Réinitialisation de mot de passe

**Request Body :**
```json
{
  "email": "string",
  "newPassword": "string (min 6 caractères)"
}
```

---

## 📦 Produits

### GET `/api/products`
🔓 **Public** — Liste tous les produits

**Response :**
```json
[
  {
    "id": "string",
    "description": "string",
    "purchasePrice": 500,
    "quantity": 10,
    "imageUrl": "string | null",
    "images": ["url1", "url2"],
    "code": "P-AB-123456"
  }
]
```

### POST `/api/products`
🔒 — Créer un produit

**Request Body :** `multipart/form-data` (pour upload de photos)
```json
{
  "description": "string (requis)",
  "purchasePrice": "number (requis)",
  "quantity": "number (requis)"
}
```

### PUT `/api/products/:id`
🔒 — Modifier un produit

### DELETE `/api/products/:id`
🔒 — Supprimer un produit

---

## 💰 Ventes

### GET `/api/sales`
🔒 — Liste toutes les ventes

### GET `/api/sales/by-month?month=3&year=2026`
🔒 — Ventes filtrées par mois

**Query Parameters :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `month` | number (1-12) | Mois |
| `year` | number | Année |

### POST `/api/sales`
🔒 — Enregistrer une vente

**Request Body :**
```json
{
  "date": "2026-03-08",
  "productId": "string",
  "sellingPrice": 750,
  "quantitySold": 2,
  "clientName": "Marie Dupont",
  "clientPhone": "0692123456",
  "clientAddress": "123 Rue de la Paix"
}
```

### PUT `/api/sales/:id`
🔒 — Modifier une vente

### DELETE `/api/sales/:id`
🔒 — Supprimer une vente

---

## 👥 Clients

### GET `/api/clients`
🔒 — Liste tous les clients

### POST `/api/clients`
🔒 — Créer un client
```json
{
  "nom": "string",
  "phone": "string",
  "adresse": "string"
}
```

### PUT `/api/clients/:id`
🔒 — Modifier un client

### DELETE `/api/clients/:id`
🔒 — Supprimer un client

---

## 📋 Commandes & Réservations

### GET `/api/commandes`
🔒 — Liste toutes les commandes

### POST `/api/commandes`
🔒 — Créer une commande
```json
{
  "clientName": "string",
  "clientPhone": "string",
  "description": "string",
  "prixVente": 500,
  "avance": 200,
  "dateLivraison": "2026-03-15",
  "status": "en_attente | en_cours | livree | annulee"
}
```

### PUT `/api/commandes/:id`
🔒 — Modifier une commande

### DELETE `/api/commandes/:id`
🔒 — Supprimer une commande

---

## 📅 Rendez-vous

### GET `/api/rdv`
🔒 — Liste tous les rendez-vous

### GET `/api/rdv?date=2026-03-08`
🔒 — RDV filtrés par date

### POST `/api/rdv`
🔒 — Créer un rendez-vous
```json
{
  "date": "2026-03-08",
  "heure": "14:00",
  "clientName": "string",
  "clientPhone": "string",
  "description": "string",
  "lieu": "string"
}
```

### PUT `/api/rdv/:id`
🔒 — Modifier un RDV

### DELETE `/api/rdv/:id`
🔒 — Supprimer un RDV

---

## 🔔 Notifications RDV

### GET `/api/rdv-notifications`
🔒 — Liste les notifications de RDV

### POST `/api/rdv-notifications`
🔒 — Créer une notification

### PUT `/api/rdv-notifications/:id`
🔒 — Marquer comme lue

### DELETE `/api/rdv-notifications/:id`
🔒 — Supprimer une notification

---

## 👨‍👩‍👧‍👦 Prêts Familles

### GET `/api/pretfamilles`
🔒 — Liste tous les prêts famille

### POST `/api/pretfamilles`
🔒 — Créer un prêt
```json
{
  "nom": "Famille Martin",
  "pretTotal": 2000,
  "soldeRestant": 2000,
  "dernierRemboursement": 0,
  "dateRemboursement": "2026-03-08"
}
```

### PUT `/api/pretfamilles/:id`
🔒 — Modifier (rembourser)

### DELETE `/api/pretfamilles/:id`
🔒 — Supprimer

---

## 🛍️ Prêts Produits

### GET `/api/pretproduits`
🔒 — Liste tous les prêts produits (crédits clients)

### POST `/api/pretproduits`
🔒 — Créer un prêt produit
```json
{
  "nom": "string",
  "phone": "string",
  "date": "2026-03-08",
  "description": "Perruque Blonde",
  "prixVente": 450,
  "avanceRecue": 200,
  "reste": 250,
  "estPaye": false
}
```

### PUT `/api/pretproduits/:id`
🔒 — Modifier

### DELETE `/api/pretproduits/:id`
🔒 — Supprimer

---

## 💸 Dépenses

### GET `/api/depenses`
🔒 — Liste les dépenses du mois

### GET `/api/depenses/fixes`
🔒 — Dépenses fixes mensuelles

### POST `/api/depenses`
🔒 — Ajouter une dépense
```json
{
  "date": "2026-03-08",
  "description": "Courses",
  "categorie": "courses | salaire | restaurant | free | internet | assurance | autre",
  "debit": 150,
  "credit": 0
}
```

### PUT `/api/depenses/:id`
🔒 — Modifier

### DELETE `/api/depenses/:id`
🔒 — Supprimer

### PUT `/api/depenses/fixes`
🔒 — Modifier les dépenses fixes

---

## 📊 Bénéfices

### GET `/api/benefices`
🔒 — Liste les bénéfices

### POST `/api/benefices`
🔒 — Enregistrer un bénéfice
```json
{
  "date": "2026-03-08",
  "montant": 500,
  "description": "Bénéfice mars"
}
```

### DELETE `/api/benefices/:id`
🔒 — Supprimer

---

## 🧾 Comptabilité

### GET `/api/compta`
🔒 — Données comptables

### POST `/api/compta`
🔒 — Ajouter une entrée comptable

### PUT `/api/compta/:id`
🔒 — Modifier

### DELETE `/api/compta/:id`
🔒 — Supprimer

---

## 🛒 Nouvelle Achat

### GET `/api/nouvelle-achat`
🔒 — Liste les achats

### POST `/api/nouvelle-achat`
🔒 — Enregistrer un achat

### PUT `/api/nouvelle-achat/:id`
🔒 — Modifier

### DELETE `/api/nouvelle-achat/:id`
🔒 — Supprimer

---

## 🏭 Fournisseurs

### GET `/api/fournisseurs`
🔒 — Liste les fournisseurs

### POST `/api/fournisseurs`
🔒 — Ajouter

### PUT `/api/fournisseurs/:id`
🔒 — Modifier

### DELETE `/api/fournisseurs/:id`
🔒 — Supprimer

---

## 🔄 Remboursements

### GET `/api/remboursements`
🔒 — Liste les remboursements

### POST `/api/remboursements`
🔒 — Enregistrer un remboursement

### DELETE `/api/remboursements/:id`
🔒 — Supprimer

---

## 💬 Messages

### GET `/api/messages`
🔒 — Liste les messages

### POST `/api/messages`
🔒 — Envoyer un message

### PUT `/api/messages/:id`
🔒 — Modifier (marquer lu)

### DELETE `/api/messages/:id`
🔒 — Supprimer

---

## 🎯 Objectifs

### GET `/api/objectif`
🔒 — Liste les objectifs

> **Note** : Les objectifs se réinitialisent automatiquement au 1er du mois. Le compteur recommence à 2000€.

### POST `/api/objectif`
🔒 — Ajouter un objectif
```json
{
  "montant": 500,
  "description": "Objectif vente semaine",
  "date": "2026-03-08"
}
```

### PUT `/api/objectif/:id`
🔒 — Modifier

### DELETE `/api/objectif/:id`
🔒 — Supprimer

---

## ⏱️ Pointage

### GET `/api/pointages`
🔒 — Liste tous les pointages

### GET `/api/pointages?year=2026&month=3`
🔒 — Pointages par mois

### GET `/api/pointages?year=2026`
🔒 — Pointages par année

### GET `/api/pointages?date=2026-03-08`
🔒 — Pointages par date

### POST `/api/pointages`
🔒 — Créer un pointage
```json
{
  "date": "2026-03-08",
  "entrepriseId": "string",
  "entrepriseNom": "string",
  "typePaiement": "journalier | horaire",
  "heures": 8,
  "prixJournalier": 80,
  "prixHeure": 10,
  "montantTotal": 80,
  "travailleurId": "string",
  "travailleurNom": "string"
}
```

### PUT `/api/pointages/:id`
🔒 — Modifier

### DELETE `/api/pointages/:id`
🔒 — Supprimer

---

## 👷 Travailleurs

### GET `/api/travailleurs`
🔒 — Liste les travailleurs

### POST `/api/travailleurs`
🔒 — Ajouter un travailleur
```json
{
  "nom": "string",
  "prenom": "string",
  "telephone": "string",
  "adresse": "string"
}
```

### PUT `/api/travailleurs/:id`
🔒 — Modifier

### DELETE `/api/travailleurs/:id`
🔒 — Supprimer

---

## 🏢 Entreprises

### GET `/api/entreprises`
🔒 — Liste les entreprises

### POST `/api/entreprises`
🔒 — Ajouter une entreprise
```json
{
  "nom": "string",
  "adresse": "string",
  "telephone": "string"
}
```

### PUT `/api/entreprises/:id`
🔒 — Modifier

### DELETE `/api/entreprises/:id`
🔒 — Supprimer

---

## ✅ Tâches

### GET `/api/taches`
🔒 — Liste toutes les tâches

### GET `/api/taches?date=2026-03-08`
🔒 — Tâches par date

### GET `/api/taches?year=2026&month=3`
🔒 — Tâches par mois

### GET `/api/taches?startDate=2026-03-01&endDate=2026-03-07`
🔒 — Tâches par semaine

### GET `/api/taches/:id`
🔒 — Détail d'une tâche

### POST `/api/taches`
🔒 — Créer une tâche
```json
{
  "date": "2026-03-08",
  "heureDebut": "08:00",
  "heureFin": "12:00",
  "description": "Livraison client",
  "importance": "pertinent | optionnel",
  "travailleurId": "string",
  "travailleurNom": "string",
  "completed": false,
  "parentId": "string (optionnel, pour sous-tâches)",
  "commandeId": "string (optionnel, lien commande)"
}
```

### PUT `/api/taches/:id`
🔒 — Modifier

### DELETE `/api/taches/:id`
🔒 — Supprimer

---

## 📝 Notes (Kanban)

### Colonnes

#### GET `/api/notes/columns`
🔒 — Liste les colonnes du Kanban

#### POST `/api/notes/columns`
🔒 — Créer une colonne
```json
{
  "title": "À faire",
  "color": "#3B82F6",
  "order": 0
}
```

#### PUT `/api/notes/columns/:id`
🔒 — Modifier une colonne

#### DELETE `/api/notes/columns/:id`
🔒 — Supprimer une colonne

### Notes

#### GET `/api/notes`
🔒 — Liste toutes les notes

#### POST `/api/notes`
🔒 — Créer une note
```json
{
  "title": "string",
  "content": "string",
  "columnId": "string",
  "color": "#FBBF24",
  "priority": "low | medium | high",
  "drawing": "/uploads/notes/dessin/image.jpeg (optionnel)"
}
```

#### PUT `/api/notes/:id`
🔒 — Modifier une note

#### DELETE `/api/notes/:id`
🔒 — Supprimer une note

#### PUT `/api/notes/:id/move`
🔒 — Déplacer une note vers une autre colonne
```json
{
  "columnId": "target-column-id",
  "order": 0
}
```

#### PUT `/api/notes/batch/reorder`
🔒 — Réorganiser plusieurs notes
```json
{
  "updates": [
    { "id": "note-1", "columnId": "col-1", "order": 0 },
    { "id": "note-2", "columnId": "col-1", "order": 1 }
  ]
}
```

### Upload de dessin

#### POST `/api/notes/upload-drawing`
🔒 — Uploader un dessin (base64 → JPEG)

**Request Body :**
```json
{
  "drawing": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response :**
```json
{
  "url": "/uploads/notes/dessin/dessin_1709913600_abc123.jpeg",
  "filename": "dessin_1709913600_abc123.jpeg"
}
```

> **Note** : Le fichier est sauvegardé dans `server/uploads/notes/dessin/`. L'URL retournée est relative au serveur.

---

## 💵 Avances

### GET `/api/avances`
🔒 — Liste toutes les avances

### GET `/api/avances?travailleurId=xxx`
🔒 — Avances d'un travailleur spécifique

### GET `/api/avances?year=2026&month=3`
🔒 — Avances par mois

### GET `/api/avances?travailleurId=xxx&entrepriseId=yyy&year=2026&month=3`
🔒 — Avances filtrées par travailleur, entreprise et mois

### POST `/api/avances`
🔒 — Enregistrer une avance
```json
{
  "travailleurId": "string",
  "travailleurNom": "string",
  "entrepriseId": "string",
  "entrepriseNom": "string",
  "montant": 500,
  "date": "2026-03-08",
  "totalPointageMois": 2000,
  "resteApresAvance": 1500
}
```

> **Règle métier** : Le montant de l'avance ne peut pas dépasser le total des pointages du mois en cours pour ce travailleur.

### PUT `/api/avances/:id`
🔒 — Modifier

### DELETE `/api/avances/:id`
🔒 — Supprimer

---

## 📡 Synchronisation temps réel

### GET `/api/sync/events`
🔒 — Connexion Server-Sent Events (SSE)

**Headers requis :**
```
Accept: text/event-stream
Cache-Control: no-cache
Authorization: Bearer <token>
```

**Événements reçus :**
| Événement | Description |
|-----------|-------------|
| `connected` | Connexion SSE établie |
| `data-changed` | Des données ont été modifiées (déclenche un refresh) |
| `force-sync` | Synchronisation forcée demandée |

**Exemple d'utilisation :**
```javascript
const eventSource = new EventSource('/api/sync/events', {
  headers: { 'Authorization': `Bearer ${token}` }
});

eventSource.addEventListener('data-changed', (event) => {
  const data = JSON.parse(event.data);
  console.log('Données modifiées:', data);
  // Recharger les données affectées
});
```

---

## ⚠️ Gestion des erreurs

### Codes HTTP

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Ressource créée avec succès |
| `400` | Requête invalide (données manquantes ou incorrectes) |
| `401` | Non authentifié (token manquant ou expiré) |
| `403` | Accès interdit |
| `404` | Ressource non trouvée |
| `429` | Trop de requêtes (rate limiting) |
| `500` | Erreur serveur interne |

### Format des erreurs
```json
{
  "error": "Description courte",
  "message": "Description détaillée de l'erreur",
  "details": "Information supplémentaire (dev only)"
}
```

### Rate Limiting
- **100 requêtes/minute** par adresse IP
- **1000 requêtes/heure** par utilisateur authentifié
- Les routes SSE (`/api/sync/events`) sont exemptées du rate limiting

---

## 🔧 Exemple d'utilisation complet

```javascript
// 1. Connexion
const loginResponse = await fetch('https://server-gestion-ventes.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'motdepasse' })
});
const { token } = await loginResponse.json();

// 2. Récupérer les produits
const products = await fetch('https://server-gestion-ventes.onrender.com/api/products', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 3. Créer un pointage
await fetch('https://server-gestion-ventes.onrender.com/api/pointages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    date: '2026-03-08',
    entrepriseId: '1',
    entrepriseNom: 'Entreprise A',
    typePaiement: 'journalier',
    heures: 8,
    prixJournalier: 80,
    prixHeure: 0,
    montantTotal: 80,
    travailleurId: '1',
    travailleurNom: 'Jean Martin'
  })
});

// 4. Enregistrer une avance
await fetch('https://server-gestion-ventes.onrender.com/api/avances', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    travailleurId: '1',
    travailleurNom: 'Jean Martin',
    entrepriseId: '1',
    entrepriseNom: 'Entreprise A',
    montant: 500,
    date: '2026-03-08',
    totalPointageMois: 2000,
    resteApresAvance: 1500
  })
});
```

---

## 📡 Messagerie Instantanée (Widget Live Chat)

### Endpoints

#### SSE - Connexion temps réel
```
GET /api/messagerie/events?visitorId={id}&adminId={id}
```
Retourne un flux SSE avec les événements : `connected`, `new_message`, `typing`, `admin_status`, `message_edited`, `message_deleted`, `message_liked`.

#### Envoyer un message
```
POST /api/messagerie/send
Body: { visitorId, visitorNom, adminId, contenu, from }
```

#### Modifier un message (propres messages uniquement)
```
PUT /api/messagerie/edit/:messageId
Body: { contenu, from }
Response: Message mis à jour avec edited: true, editedAt
```

#### Supprimer un message (propres messages uniquement)
```
DELETE /api/messagerie/delete/:messageId
Body: { from }
Response: Message avec deleted: true, contenu vidé
```

#### Aimer/Retirer un like
```
POST /api/messagerie/like/:messageId
Body: { from }  // "visitor" ou "admin"
Response: Message avec tableau likes[] mis à jour
```

#### Indicateur de frappe
```
POST /api/messagerie/typing
Body: { visitorId, adminId, from, isTyping }
```

#### Marquer comme lu
```
PUT /api/messagerie/mark-read/:visitorId/:adminId
Body: { reader }  // "visitor" ou "admin"
```

#### Conversations admin
```
GET /api/messagerie/conversations (Auth requis)
```

#### Messages d'une conversation
```
GET /api/messagerie/messages/:visitorId/:adminId
```

#### Statut admin en ligne
```
GET /api/messagerie/admin-status
```

#### Compteur non lus admin
```
GET /api/messagerie/unread-count/:adminId
```

### Structure d'un message
```json
{
  "id": "msg_123456_abc",
  "visitorId": "visitor_123",
  "visitorNom": "Visiteur",
  "adminId": "1",
  "contenu": "Bonjour !",
  "from": "visitor",
  "date": "2026-03-09T10:00:00Z",
  "lu": false,
  "edited": false,
  "deleted": false,
  "likes": ["admin"]
}
```

### Fonctionnalités du Widget
- **Emoji** : Sélecteur d'emojis intégré (20 emojis courants)
- **Like/Aimer** : Cliquer sur un message pour l'aimer (toggle ❤️)
- **Modifier** : Modifier ses propres messages (affiche "modifié")
- **Supprimer** : Supprimer ses propres messages (affiche "Ce message a été supprimé")
- **Temps réel** : SSE + polling fallback 2s
- **Indicateur de frappe** : Points rouges animés

---

## 🏭 Fournisseurs

### Gestion des fournisseurs dans les produits et la comptabilité

Les fournisseurs sont gérés automatiquement : lors de l'ajout d'un produit ou d'un achat en comptabilité, le nom du fournisseur saisi est enregistré dans `fournisseurs.json` s'il n'existe pas déjà.

### Endpoints
```
GET    /api/fournisseurs           → Liste tous les fournisseurs
GET    /api/fournisseurs/search?q= → Recherche par nom
POST   /api/fournisseurs           → Créer (si n'existe pas)
DELETE /api/fournisseurs/:id       → Supprimer
```

### Structure
```json
{
  "id": "1772979865742",
  "nom": "Happy Friday hair Store",
  "dateCreation": "2026-03-08T14:24:25.742Z"
}
```

---

## 👤 Profil Utilisateur

### Endpoints
```
GET    /api/profile              → Récupérer le profil de l'utilisateur connecté
PUT    /api/profile              → Modifier les informations du profil (firstName, lastName, gender, address, phone)
PUT    /api/profile/password     → Changer le mot de passe (currentPassword, newPassword, confirmPassword)
POST   /api/profile/photo        → Upload de la photo de profil (multipart/form-data, champ "photo")
```

### Structure ProfileData
```json
{
  "id": "123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "gender": "male",
  "address": "12 rue de la Paix",
  "phone": "0692123456",
  "profilePhoto": "photo-123.jpg",
  "role": "administrateur principale"
}
```

### Réponses
- `PUT /api/profile` → `{ success: true, user: ProfileData }`
- `PUT /api/profile/password` → `{ success: true }`
- `POST /api/profile/photo` → `{ photoUrl: "photo-123.jpg" }`

---

## ⚙️ Paramètres (Settings)

### Endpoints
```
GET    /api/settings                → Récupérer les paramètres + isAdmin
PUT    /api/settings                → Modifier les paramètres (admin requis)
GET    /api/settings/users          → Liste des utilisateurs (admin principale)
PUT    /api/settings/user-role      → Changer le rôle d'un utilisateur (admin principale)
POST   /api/settings/backup         → Sauvegarder toutes les données (encryptionCode requis, min 6 chars)
POST   /api/settings/restore        → Restaurer des données (encryptedData + decryptionCode)
POST   /api/settings/delete-all     → Supprimer toutes les données (password requis, admin principale)
POST   /api/settings/verify-password → Vérifier le mot de passe admin
```

### Notes importantes
- La sauvegarde/restauration scanne dynamiquement tous les fichiers `.json` dans `server/db/`
- Les nouveaux fichiers de base de données sont automatiquement inclus dans les sauvegardes
- La suppression réinitialise chaque fichier (tableau vide ou objet vide selon le type), tout en préservant le compte admin principale
