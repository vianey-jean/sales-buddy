# Documentation des Composants Comptabilité

## Vue d'ensemble

Ce document décrit les nouveaux composants réutilisables créés pour le module de comptabilité. Ces composants permettent de rendre les cartes de statistiques cliquables et d'afficher des modales de détails.

---

## 📁 Structure des fichiers

```
src/components/dashboard/comptabilite/
├── ComptabiliteModule.tsx          # Composant principal
├── shared/                          # Composants réutilisables génériques
│   ├── index.ts                    # Exports centralisés
│   ├── ClickableStatCard.tsx       # Carte cliquable avec effet premium
│   └── DetailsModal.tsx            # Modale générique pour détails
├── details/                         # Composants d'affichage des détails
│   ├── index.ts                    # Exports centralisés
│   ├── AchatsProduitsDetails.tsx   # Liste des achats produits
│   ├── AutresDepensesDetails.tsx   # Liste des autres dépenses
│   └── SoldeNetDetails.tsx         # Détail du calcul du solde net
└── index.ts                        # Exports du module principal
```

---

## 🧩 Composants Partagés (`shared/`)

### ClickableStatCard

Carte de statistique cliquable avec effet de survol premium.

**Props:**
| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `title` | `string` | ✅ | Titre de la statistique |
| `value` | `number` | ✅ | Valeur numérique à afficher |
| `subtitle` | `string` | ❌ | Texte descriptif sous la valeur |
| `icon` | `LucideIcon` | ✅ | Icône Lucide à afficher |
| `colorScheme` | `'green' \| 'red' \| 'blue' \| 'indigo' \| 'orange' \| 'cyan' \| 'emerald' \| 'purple'` | ✅ | Thème de couleur |
| `onClick` | `() => void` | ✅ | Fonction appelée au clic |
| `formatValue` | `(value: number) => string` | ❌ | Fonction de formatage |
| `isNegative` | `boolean` | ❌ | Si true, utilise les couleurs négatives |

**Exemple d'utilisation:**
```tsx
import { ClickableStatCard } from '@/components/dashboard/comptabilite/shared';
import { ArrowUpCircle } from 'lucide-react';

<ClickableStatCard
  title="Total Crédit"
  value={1500}
  subtitle="Argent entrant"
  icon={ArrowUpCircle}
  colorScheme="green"
  onClick={() => setShowModal(true)}
  formatValue={formatEuro}
/>
```

---

### DetailsModal

Modale générique pour afficher des listes de détails.

**Props:**
| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `open` | `boolean` | ✅ | État d'ouverture de la modale |
| `onOpenChange` | `(open: boolean) => void` | ✅ | Callback pour changer l'état |
| `title` | `string` | ✅ | Titre de la modale |
| `subtitle` | `string` | ❌ | Sous-titre (période, etc.) |
| `icon` | `LucideIcon` | ✅ | Icône pour le titre |
| `colorScheme` | `string` | ✅ | Thème de couleur |
| `totalLabel` | `string` | ❌ | Label du total |
| `totalValue` | `number` | ❌ | Valeur totale |
| `itemCount` | `number` | ❌ | Nombre d'éléments |
| `formatValue` | `(value: number) => string` | ❌ | Fonction de formatage |
| `children` | `React.ReactNode` | ✅ | Contenu de la modale |

**Exemple d'utilisation:**
```tsx
import { DetailsModal } from '@/components/dashboard/comptabilite/shared';
import { Package } from 'lucide-react';

<DetailsModal
  open={showModal}
  onOpenChange={setShowModal}
  title="Détails Achats"
  subtitle="Janvier 2026"
  icon={Package}
  colorScheme="indigo"
  totalLabel="Total"
  totalValue={1500}
  formatValue={formatEuro}
>
  <AchatsProduitsDetails achats={achats} formatEuro={formatEuro} />
</DetailsModal>
```

---

## 📊 Composants de Détails (`details/`)

### AchatsProduitsDetails

Affiche la liste détaillée des achats de type "achat_produit".

**Props:**
| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `achats` | `NouvelleAchat[]` | ✅ | Liste des achats (filtrée automatiquement) |
| `formatEuro` | `(value: number) => string` | ✅ | Fonction de formatage monétaire |

**Exemple:**
```tsx
import { AchatsProduitsDetails } from '@/components/dashboard/comptabilite/details';

<AchatsProduitsDetails 
  achats={achats} 
  formatEuro={formatEuro} 
/>
```

---

### AutresDepensesDetails

Affiche la liste des dépenses hors achats produits (taxes, carburant, autres).

**Props:**
| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `achats` | `NouvelleAchat[]` | ✅ | Liste des achats (filtrée automatiquement) |
| `formatEuro` | `(value: number) => string` | ✅ | Fonction de formatage monétaire |

**Caractéristiques:**
- Affiche une icône différente selon le type (Fuel, Receipt, DollarSign)
- Couleurs adaptées au type de dépense
- Affiche la catégorie si disponible

**Exemple:**
```tsx
import { AutresDepensesDetails } from '@/components/dashboard/comptabilite/details';

<AutresDepensesDetails 
  achats={achats} 
  formatEuro={formatEuro} 
/>
```

---

### SoldeNetDetails

Affiche le détail du calcul du solde net avec indicateurs visuels.

**Props:**
| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `totalCredit` | `number` | ✅ | Total des crédits (ventes) |
| `totalDebit` | `number` | ✅ | Total des débits |
| `achatsTotal` | `number` | ✅ | Total des achats produits |
| `depensesTotal` | `number` | ✅ | Total des autres dépenses |
| `soldeNet` | `number` | ✅ | Solde net calculé |
| `formatEuro` | `(value: number) => string` | ✅ | Fonction de formatage |

**Caractéristiques:**
- Comparaison visuelle Crédit vs Débit avec cards
- Barre de progression colorée
- Détail de la composition du débit
- Indicateur visuel positif/négatif
- Formule de calcul affichée

**Exemple:**
```tsx
import { SoldeNetDetails } from '@/components/dashboard/comptabilite/details';

<SoldeNetDetails 
  totalCredit={5000}
  totalDebit={2000}
  achatsTotal={1500}
  depensesTotal={500}
  soldeNet={3000}
  formatEuro={formatEuro} 
/>
```

---

## 🎨 Thèmes de couleurs disponibles

Les composants supportent les schémas de couleurs suivants:
- `green` - Vert émeraude (pour crédit, gains)
- `red` - Rouge rose (pour débit, pertes)
- `blue` - Bleu indigo (pour statistiques neutres)
- `indigo` - Indigo violet (pour achats produits)
- `orange` - Orange ambre (pour autres dépenses)
- `cyan` - Cyan bleu (pour solde net)
- `emerald` - Émeraude teal (pour bénéfice réel positif)
- `purple` - Violet fuchsia (pour exports, actions spéciales)

---

## 💡 Prompts d'utilisation

### Ajouter une nouvelle carte cliquable

```
Ajoute une nouvelle carte cliquable pour afficher [STATISTIQUE] 
en utilisant ClickableStatCard avec le colorScheme [COULEUR] 
et ouvrant une modale DetailsModal au clic.
```

### Créer un nouveau composant de détails

```
Crée un nouveau composant de détails pour afficher [TYPE_DONNÉES] 
dans le dossier details/ en suivant le pattern de AchatsProduitsDetails.
Le composant doit recevoir les données et formatEuro en props.
```

### Ajouter une modale à une section existante

```
Rends la section [NOM_SECTION] cliquable en ajoutant un état showModal 
et en utilisant Dialog pour afficher les détails avec DetailsModal.
```

---

## ✅ Bonnes pratiques

1. **Toujours utiliser les composants partagés** pour garantir la cohérence visuelle
2. **Passer formatEuro en prop** plutôt que de l'importer dans chaque composant
3. **Filtrer les données au niveau du composant de détail**, pas dans le parent
4. **Utiliser les colorSchemes définis** plutôt que des couleurs personnalisées
5. **Exporter via index.ts** pour faciliter les imports
