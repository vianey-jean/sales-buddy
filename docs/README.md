# 📚 Documentation du Projet - Système de Gestion Commerciale

## Vue d'ensemble

Application web complète de gestion commerciale développée avec React/TypeScript en frontend et Node.js/Express en backend.

## Documentation principale

👉 **[DOCUMENTATION_PROJET.md](./DOCUMENTATION_PROJET.md)** - Documentation complète et professionnelle

## Fichiers de documentation

| Fichier | Description |
|---------|-------------|
| [DOCUMENTATION_PROJET.md](./DOCUMENTATION_PROJET.md) | Documentation principale complète |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Documentation API REST |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture technique |
| [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) | Guide développement frontend |
| [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) | Guide développement backend |
| [TESTS_GUIDE.md](./TESTS_GUIDE.md) | Guide des tests |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guide de déploiement |
| [SECURITY.md](./SECURITY.md) | Guide de sécurité |

## Technologies utilisées

### Frontend
- React 19 avec TypeScript
- Vite pour le build
- Tailwind CSS + Shadcn/UI
- React Context pour l'état global
- React Router pour la navigation
- Framer Motion pour les animations

### Backend
- Node.js avec Express.js
- JSON pour le stockage (développement)
- JWT pour l'authentification
- Bcrypt pour le hachage
- CORS + Rate Limiting pour la sécurité

### Tests
- Vitest pour les tests unitaires
- React Testing Library pour les composants
- Tests E2E et intégration

## Démarrage rapide

```bash
# Frontend
npm install
npm run dev

# Backend (dans /server)
cd server
npm install
npm run dev
```

## Structure du projet

```
src/
├── components/     # Composants React
├── contexts/       # Contextes React  
├── hooks/          # Hooks personnalisés
├── pages/          # Pages de l'application
├── services/       # Services métier et API
├── types/          # Définitions TypeScript
└── tests/          # Tests

server/
├── routes/         # Routes API
├── middleware/     # Middlewares
├── models/         # Modèles de données
└── db/             # Fichiers JSON (base de données)
```

---

*Documentation mise à jour - Janvier 2026*
