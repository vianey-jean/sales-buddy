# 📋 Cahier des Charges — Application de Gestion Commerciale

> **Version** : 5.0.0  
> **Dernière mise à jour** : Mars 2026  
> **Client** : Gestion Ventes & Agendas  
> **Activité** : Vente de perruques, tissages et extensions capillaires

---

## 📌 1. Présentation du Projet

Application web professionnelle de gestion commerciale complète permettant de centraliser toutes les opérations d'une activité commerciale : ventes, stocks, clients, rendez-vous, comptabilité, pointage des travailleurs, tâches et notes.

### Objectifs principaux
- Centraliser la gestion des ventes (mono et multi-produits)
- Suivre les stocks en temps réel avec alertes
- Gérer les clients avec historique complet
- Planifier et suivre les rendez-vous
- Gérer les commandes et réservations
- Suivre la comptabilité (achats, dépenses, bénéfices)
- Gérer le pointage des travailleurs et les avances
- Planifier et assigner des tâches
- Prendre des notes avec Kanban et dessins
- Analyser les tendances et performances

---

## 📌 2. Spécifications Fonctionnelles

### 2.1 Authentification (Module Auth)
| Fonctionnalité | Description |
|----------------|-------------|
| Inscription | Formulaire complet (nom, prénom, email, mot de passe, genre, adresse, téléphone) |
| Connexion | Email + mot de passe, token JWT 8h |
| Déconnexion | Suppression du token local |
| Réinitialisation | Demande par email + nouveau mot de passe |
| Auto-déconnexion | Après inactivité prolongée |
| Routes protégées | Redirection automatique vers /login si non authentifié |

### 2.2 Gestion des Produits
| Fonctionnalité | Description |
|----------------|-------------|
| CRUD complet | Création, lecture, modification, suppression |
| Photos multiples | Upload de plusieurs photos avec slideshow |
| Code auto-généré | Format P/T/E/X-XX-XXXXXX |
| Recherche | Par description et code produit |
| Stock | Suivi des quantités avec alertes de rupture |
| Prix d'achat | Pour calcul automatique des bénéfices |

### 2.3 Gestion des Ventes
| Fonctionnalité | Description |
|----------------|-------------|
| Vente simple | Un seul produit |
| Vente multiple | Plusieurs produits dans une seule vente |
| Client associé | Lien automatique avec la base clients |
| Filtrage | Par mois, par année, par client |
| Export | Génération de factures PDF |
| Remboursement | Gestion des retours avec traçabilité |

### 2.4 Gestion des Clients
| Fonctionnalité | Description |
|----------------|-------------|
| CRUD complet | Nom, téléphone, adresse |
| Historique | Toutes les ventes du client |
| Recherche | Par nom et téléphone |
| Carte client | Affichage visuel avec détails |

### 2.5 Commandes & Réservations
| Fonctionnalité | Description |
|----------------|-------------|
| CRUD complet | Client, produit, prix, avance, date livraison |
| Statuts | En attente → En cours → Livrée / Annulée |
| Lien RDV | Création automatique de RDV depuis une commande |
| Lien tâche | Création de tâche depuis une commande |
| Reporter | Possibilité de reporter une commande |

### 2.6 Rendez-vous
| Fonctionnalité | Description |
|----------------|-------------|
| Calendrier | Vue mensuelle interactive avec marqueurs |
| CRUD complet | Date, heure, client, description, lieu |
| Notifications | Alertes de RDV à venir |
| Statistiques | Nombre de RDV par mois avec détails |

### 2.7 Prêts Familles
| Fonctionnalité | Description |
|----------------|-------------|
| Suivi des prêts | Montant total, remboursé, restant |
| Historique | Tous les remboursements |

### 2.8 Prêts Produits (Crédits clients)
| Fonctionnalité | Description |
|----------------|-------------|
| Vente à crédit | Produit livré, paiement échelonné |
| Suivi | Avance reçue, reste à payer |
| Alertes retard | Notification si paiement en retard |
| Groupé par client | Vue synthétique par client |

### 2.9 Dépenses
| Fonctionnalité | Description |
|----------------|-------------|
| Dépenses variables | Saisie quotidienne avec catégorie |
| Dépenses fixes | Free, Internet, Assurances (montants fixes mensuels) |
| Catégories | Salaire, courses, restaurant, free, internet, assurance, autre |
| Solde calculé | Calcul automatique du solde après chaque opération |

### 2.10 Comptabilité
| Fonctionnalité | Description |
|----------------|-------------|
| Bilan mensuel | Entrées vs sorties |
| Achats | Suivi des achats fournisseurs |
| Fournisseurs | Base de données fournisseurs |
| Bénéfices | Calcul automatique (prix vente - prix achat) |
| Historique | Graphiques et tableaux mensuels |

### 2.11 Messages
| Fonctionnalité | Description |
|----------------|-------------|
| Messagerie interne | Envoi et réception de messages |
| Marquage lu/non lu | Gestion du statut de lecture |

### 2.12 Objectifs
| Fonctionnalité | Description |
|----------------|-------------|
| Objectif mensuel | Barre de progression dans la navbar |
| Réinitialisation | Automatique au 1er du mois |
| Valeur initiale | Commence toujours à 2000€ |
| Historique | Changements visibles du mois en cours uniquement |

### 2.13 Pointage & Travail ⭐ NOUVEAU
| Fonctionnalité | Description |
|----------------|-------------|
| Pointage journalier | Enregistrement des heures travaillées |
| Type de paiement | Journalier (forfait/jour) ou horaire (prix/heure) |
| Entreprises | Gestion des entreprises employeuses |
| Travailleurs | Base de données des travailleurs |
| **Avances sur salaire** | Prise d'avance avec contrôle du plafond |
| Total du mois | Vue cliquable avec détails et avances |
| Total de l'année | Récapitulatif annuel par entreprise avec avances |
| Par personne | Détail par travailleur avec avances et reste |
| Calendrier | Vue mensuelle avec pointages coloriés |

### 2.14 Tâches ⭐ NOUVEAU
| Fonctionnalité | Description |
|----------------|-------------|
| Planification | Date, heure début/fin, description |
| Importance | Pertinent ou optionnel |
| Assignation | Lien avec un travailleur |
| Vue semaine | Planning hebdomadaire |
| Vue jour | Timeline détaillée |
| Complétion | Marquage comme terminée |
| Lien commande | Tâche liée à une commande |

### 2.15 Notes Kanban ⭐ NOUVEAU
| Fonctionnalité | Description |
|----------------|-------------|
| Tableau Kanban | Colonnes personnalisables avec drag & drop |
| Notes riches | Titre, contenu, couleur, priorité |
| Dessins | Canvas de dessin intégré, sauvegardé en JPEG |
| Vue détail | Clic sur note pour voir les détails |
| Séparateurs | Lignes verticales colorées entre les colonnes |
| Confirmation | Dialogue de confirmation pour toute action |

### 2.16 Tendances & Analyses
| Fonctionnalité | Description |
|----------------|-------------|
| Graphiques | Ventes par mois, par produit, par client |
| Comparaison | Mois en cours vs mois précédent |
| Top produits | Classement des meilleures ventes |
| Top clients | Clients les plus actifs |

---

## 📌 3. Spécifications Techniques

### Frontend
- React 19 + TypeScript (strict mode)
- Vite (build tool)
- Tailwind CSS 4 (design system)
- shadcn/ui (composants)
- Framer Motion (animations)
- Recharts (graphiques)
- Axios (HTTP)
- React Router 7 (navigation)

### Backend
- Node.js 18+ avec Express.js
- JWT pour l'authentification (8h expiration)
- bcryptjs pour le hash des mots de passe
- Fichiers JSON comme base de données
- SSE pour la synchronisation temps réel
- Multer pour l'upload de fichiers
- Rate limiting et sanitization intégrés

### Déploiement
- Frontend :  Vercel
- Backend : Render (avec persistent disk)
- HTTPS obligatoire en production

---

## 📌 4. Contraintes et exigences

### Performance
- Temps de chargement initial < 3 secondes
- Synchronisation temps réel < 100ms
- Compression gzip activée

### Sécurité
- Mots de passe hashés (bcrypt, 10 rounds)
- Token JWT signé avec secret
- Rate limiting anti-DDoS
- Sanitization des inputs
- Headers de sécurité HTTP
- CORS restrictif

### Compatibilité
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablette, desktop)
- Mode sombre / clair

### Fiabilité
- Gestion gracieuse des erreurs réseau
- Retry automatique (2 tentatives) avec backoff exponentiel
- Sauvegarde automatique des données

---

## 📱 Widget Messagerie Instantanée (Live Chat)

### Description
Widget de chat en direct entre visiteurs du site et administrateurs, avec communication instantanée via SSE.

### Fonctionnalités
| Fonctionnalité | Description |
|----------------|-------------|
| Envoi de messages | Texte + emojis intégrés |
| Emoji picker | 20 emojis courants accessibles via bouton 😊 |
| Like/Aimer | Aimer le message de l'autre personne (❤️ toggle) |
| Modifier message | Modifier ses propres messages (mention "modifié") |
| Supprimer message | Supprimer ses propres messages (notice "message supprimé") |
| Indicateur de frappe | Points rouges animés en temps réel |
| Temps réel | SSE + polling fallback 2s |

### Composants
- `LiveChatVisitor.tsx` : Widget côté visiteur public
- `LiveChatAdmin.tsx` : Widget côté administrateur connecté

### Base de données
- `server/db/messagerie.json` : Stockage des messages

---

## 🏭 Fournisseurs

### Description
Gestion automatique des fournisseurs lors de l'ajout de produits et d'achats en comptabilité.

### Fonctionnalités
| Fonctionnalité | Description |
|----------------|-------------|
| Auto-création | Créé automatiquement lors d'un achat si inexistant |
| Recherche | Autocomplétion par nom partiel |
| Suppression | Suppression par ID |

### Base de données
- `server/db/fournisseurs.json`

---

## 👤 Module Profil & Paramètres

### Profil Utilisateur
| Fonctionnalité | Description |
|----------------|-------------|
| Visualisation | Affichage des informations personnelles avec avatar animé |
| Édition | Modification du prénom, nom, genre, adresse, téléphone avec confirmation |
| Photo de profil | Upload avec aperçu et confirmation |
| Mot de passe | Changement sécurisé avec vérification de force (PasswordStrengthChecker) |

### Paramètres (Admin)
| Fonctionnalité | Description |
|----------------|-------------|
| Sauvegarde | Chiffrement AES-256 + téléchargement JSON (scan dynamique de toute la BDD) |
| Restauration | Injection de données depuis fichier chiffré |
| Suppression totale | Réinitialisation complète (admin principale uniquement, 1 tentative) |
| Gestion des rôles | Promouvoir/rétrograder des utilisateurs (admin principale) |
| Modules | Configuration par module (commandes, pointage, tâches, notes) |
| Indisponibilités | Gestion des congés et absences |

### Base de données
- `server/db/users.json`, `server/db/settings.json`, `server/db/moduleSettings.json`, `server/db/indisponible.json`
