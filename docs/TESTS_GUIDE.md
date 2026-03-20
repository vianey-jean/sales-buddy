
# Guide des Tests

## Stratégie de test

### Pyramide des tests
```
    /\
   /  \    E2E Tests (Playwright)
  /____\   
 /      \   Integration Tests
/__________\  Unit Tests (Vitest + RTL)
```

## Tests unitaires (Frontend)

### Configuration Vitest
```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
  },
});
```

### Tests de composants React
```typescript
// Exemple: StatCard.test.tsx
describe('StatCard', () => {
  const defaultProps = {
    title: 'Test Statistic',
    description: 'Test description',
    value: 1234
  };

  it('affiche le titre et la valeur correctement', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Test Statistic')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('est un composant pur (même rendu pour mêmes props)', () => {
    const { rerender } = render(<StatCard {...defaultProps} />);
    const firstRender = screen.getByRole('article').innerHTML;
    
    rerender(<StatCard {...defaultProps} />);
    const secondRender = screen.getByRole('article').innerHTML;
    
    expect(firstRender).toBe(secondRender);
  });
});
```

### Tests de hooks personnalisés
```typescript
// Exemple: useBusinessCalculations.test.tsx
describe('useBusinessCalculations', () => {
  const mockSales = [
    {
      id: '1',
      sellingPrice: 100,
      quantitySold: 2,
      profit: 80
    }
  ];

  it('calcule les statistiques correctement', () => {
    const { result } = renderHook(() => useBusinessCalculations(mockSales));

    expect(result.current.totalRevenue).toBe(200);
    expect(result.current.totalProfit).toBe(80);
  });

  it('recalcule uniquement quand les données changent', () => {
    const { result, rerender } = renderHook(
      ({ sales }) => useBusinessCalculations(sales),
      { initialProps: { sales: mockSales } }
    );

    const firstResult = result.current;
    rerender({ sales: mockSales });
    
    expect(result.current).toBe(firstResult);
  });
});
```

## Tests d'intégration

### Tests de contextes
```typescript
// Exemple: AuthContext.test.tsx
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  it('connecte un utilisateur avec succès', async () => {
    mockAuthService.login.mockResolvedValue({
      token: 'mock-token',
      user: { id: '1', email: 'test@example.com' }
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.login({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(success).toBe(true);
    });
  });
});
```

### Tests de workflow complets
```typescript
// Exemple: SalesWorkflow.test.tsx
describe('Workflow de gestion des ventes', () => {
  it('crée une vente complète', async () => {
    renderWithProviders(<VentesProduits />);

    // Ouvrir le formulaire
    fireEvent.click(screen.getByRole('button', { name: /ajouter une vente/i }));

    // Remplir les champs
    fireEvent.change(screen.getByLabelText(/produit/i), { target: { value: 'Product 1' } });
    fireEvent.change(screen.getByLabelText(/prix de vente/i), { target: { value: '100' } });

    // Soumettre
    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

    // Vérifier la création
    await waitFor(() => {
      expect(mockApiService.addSale).toHaveBeenCalled();
    });
  });
});
```

## Tests de services

### Tests de formatage
```typescript
// Exemple: FormatService.test.ts
describe('FormatService', () => {
  describe('formatCurrency', () => {
    it('formate les montants en euros', () => {
      expect(FormatService.formatCurrency(1234.56)).toBe('1 234,56 €');
    });

    it('gère les valeurs invalides', () => {
      expect(FormatService.formatCurrency(NaN)).toBe('0,00 €');
    });
  });

  describe('immutabilité du service', () => {
    it('le service est immuable', () => {
      expect(Object.isFrozen(FormatService)).toBe(true);
    });
  });
});
```

## Tests E2E (End-to-End)

### Configuration Playwright (mockée)
```typescript
// Exemple: userJourney.test.ts
describe('User Journey E2E Tests', () => {
  it('parcours complet utilisateur', async () => {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();

    // Navigation et connexion
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Vérification de la redirection
    await page.waitForSelector('[data-testid="dashboard"]');
    
    await browser.close();
  });
});
```

## Tests Backend

### Tests d'API
```javascript
// Exemple: products.test.js
describe('Products API', () => {
  beforeEach(() => {
    // Reset des données de test
    products.length = 0;
  });

  describe('GET /api/products', () => {
    it('retourne tous les produits', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/products', () => {
    it('crée un nouveau produit', async () => {
      const newProduct = {
        description: 'Test Product',
        purchasePrice: 50,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send(newProduct)
        .expect(201);

      expect(response.body.description).toBe('Test Product');
    });

    it('échoue sans authentification', async () => {
      await request(app)
        .post('/api/products')
        .send({})
        .expect(401);
    });
  });
});
```

### Tests de middleware
```javascript
// Exemple: auth.middleware.test.js
describe('Auth Middleware', () => {
  it('accepte un token valide', () => {
    const req = {
      headers: { authorization: `Bearer ${validToken}` }
    };
    const res = {};
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('rejette un token invalide', () => {
    const req = {
      headers: { authorization: 'Bearer invalid-token' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

## Couverture de tests

### Configuration de couverture
```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/setup.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

## Mocking et utilitaires

### Mocks des services
```typescript
// Mock d'API service
const mockApiService = {
  getProducts: vi.fn().mockResolvedValue([]),
  addProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn()
};

vi.mock('@/service/api', () => ({
  productService: mockApiService
}));
```

### Providers de test
```typescript
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <AppProvider>
        {component}
      </AppProvider>
    </AuthProvider>
  );
};
```

## Bonnes pratiques

### Organisation des tests
- Un fichier de test par composant/service
- Tests groupés par fonctionnalité
- Données de test réutilisables
- Nettoyage après chaque test

### Assertions expressives
```typescript
// ✅ Bon
expect(screen.getByText('Test')).toBeInTheDocument();

// ❌ Moins bon
expect(screen.getByText('Test')).toBeTruthy();
```

### Tests d'accessibilité
```typescript
it('respecte les standards d\'accessibilité', () => {
  render(<Component />);
  
  expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  expect(screen.getByLabelText('Input field')).toBeInTheDocument();
});
```
