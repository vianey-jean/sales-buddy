# Cahier de Charge - Module Comptabilité

## 1. Vue d'ensemble

Le **ComptabiliteModule** est le composant central de gestion comptable de l'application. Il permet de suivre les achats, dépenses, ventes et bénéfices.

---

## 2. Architecture Frontend

### 2.1 Composants

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `ComptabiliteModule` | `ComptabiliteModule.tsx` | Composant principal, orchestration |
| `ProductSearchInput` | `ProductSearchInput.tsx` | Recherche de produits avec suggestions |
| `AchatFormDialog` | `AchatFormDialog.tsx` | Modal d'ajout d'achat |
| `DepenseFormDialog` | `DepenseFormDialog.tsx` | Modal d'ajout de dépense |
| `ComptabiliteStatsCards` | `ComptabiliteStatsCards.tsx` | Cartes statistiques cliquables |
| `AchatsHistoriqueList` | `AchatsHistoriqueList.tsx` | Liste historique des achats |

### 2.2 Flux de données

```
Utilisateur → Formulaire d'achat → API Backend → nouvelle_achat.json + products.json
```

---

## 3. Architecture Backend

### 3.1 Fichiers JSON

| Fichier | Rôle |
|---------|------|
| `products.json` | Inventaire des produits (stock, prix) |
| `nouvelle_achat.json` | Historique des achats et dépenses |

### 3.2 Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/nouvelle-achat` | Récupérer tous les achats |
| GET | `/api/nouvelle-achat/monthly/:year/:month` | Achats par mois |
| POST | `/api/nouvelle-achat` | Créer un achat |
| POST | `/api/nouvelle-achat/depense` | Créer une dépense |

---

## 4. Logique de création d'achat

### Cas 1: Produit existant sélectionné
1. Mise à jour du stock dans `products.json`
2. Enregistrement dans `nouvelle_achat.json`

### Cas 2: Nouveau produit
1. **Création du produit** dans `products.json`
2. Enregistrement dans `nouvelle_achat.json`

### Cas 3: Vérification par description (Backend)
Si aucun `productId` fourni, le backend vérifie si un produit existe avec la même description pour éviter les doublons.

---

## 5. Types TypeScript

```typescript
interface NouvelleAchat {
  id: string;
  date: string;
  productId?: string;
  productDescription: string;
  purchasePrice: number;
  quantity: number;
  fournisseur: string;
  caracteristiques: string;
  totalCost: number;
  type: 'achat_produit' | 'taxes' | 'carburant' | 'autre_depense';
}

interface ComptabiliteData {
  salesTotal: number;
  salesProfit: number;
  salesCost: number;
  salesCount: number;
  achatsTotal: number;
  depensesTotal: number;
  beneficeReel: number;
  totalDebit: number;
  totalCredit: number;
  soldeNet: number;
}
```

---

## 6. Dépendances

- `nouvelleAchatApiService` - Service API achats
- `productApiService` - Service API produits
- `useCurrencyFormatter` - Formatage monétaire
- `framer-motion` - Animations
- `recharts` - Graphiques
