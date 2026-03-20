
// Test unitaire complet des composants Card UI
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Suite de tests pour les composants Card
describe('Card UI Components', () => {
  // Tests du composant Card principal
  describe('Card', () => {
    // Test de rendu de base du composant Card
    it('rend le composant Card correctement', () => {
      // Rendu du composant Card avec du contenu
      render(
        <Card data-testid="test-card">
          <div>Contenu de la carte</div>
        </Card>
      );
      
      // Vérification que la carte est présente dans le DOM
      const card = screen.getByTestId('test-card');
      expect(card).toBeInTheDocument();
      
      // Vérification du contenu
      expect(screen.getByText('Contenu de la carte')).toBeInTheDocument();
    });

    // Test des classes CSS par défaut
    it('applique les classes CSS par défaut', () => {
      // Rendu avec data-testid pour identification
      render(<Card data-testid="styled-card">Test</Card>);
      
      // Récupération de l'élément
      const card = screen.getByTestId('styled-card');
      
      // Vérification des classes par défaut de Card
      expect(card).toHaveClass(
        'rounded-lg',     // Coins arrondis
        'border',         // Bordure
        'bg-card',        // Couleur de fond
        'text-card-foreground', // Couleur du texte
        'shadow-sm'       // Ombre légère
      );
    });

    // Test des classes personnalisées
    it('accepte et applique les classes personnalisées', () => {
      // Rendu avec classes personnalisées
      render(
        <Card className="custom-class bg-red-500" data-testid="custom-card">
          Test
        </Card>
      );
      
      // Récupération de l'élément
      const card = screen.getByTestId('custom-card');
      
      // Vérification que les classes personnalisées sont appliquées
      expect(card).toHaveClass('custom-class', 'bg-red-500');
      // Vérification que les classes par défaut sont toujours présentes
      expect(card).toHaveClass('rounded-lg', 'border');
    });
  });

  // Tests du composant CardHeader
  describe('CardHeader', () => {
    // Test de rendu du header
    it('rend le CardHeader correctement', () => {
      // Rendu du header dans une carte
      render(
        <Card>
          <CardHeader data-testid="card-header">
            <h2>Titre de la carte</h2>
          </CardHeader>
        </Card>
      );
      
      // Vérification que le header est présent
      const header = screen.getByTestId('card-header');
      expect(header).toBeInTheDocument();
      expect(screen.getByText('Titre de la carte')).toBeInTheDocument();
    });

    // Test des classes CSS du header
    it('applique les classes CSS correctes au header', () => {
      // Rendu du header
      render(
        <CardHeader data-testid="header-styles">Header Content</CardHeader>
      );
      
      // Vérification des classes du header
      const header = screen.getByTestId('header-styles');
      expect(header).toHaveClass(
        'flex',          // Flexbox
        'flex-col',      // Direction colonne
        'space-y-1.5',   // Espacement vertical
        'p-6'            // Padding
      );
    });
  });

  // Tests du composant CardTitle
  describe('CardTitle', () => {
    // Test de rendu du titre
    it('rend le CardTitle correctement', () => {
      // Rendu du titre
      render(
        <CardTitle data-testid="card-title">
          Mon Titre de Carte
        </CardTitle>
      );
      
      // Vérification du titre
      const title = screen.getByTestId('card-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Mon Titre de Carte');
    });

    // Test des classes CSS du titre
    it('applique les classes CSS correctes au titre', () => {
      // Rendu du titre
      render(
        <CardTitle data-testid="title-styles">Titre</CardTitle>
      );
      
      // Vérification des classes du titre
      const title = screen.getByTestId('title-styles');
      expect(title).toHaveClass(
        'text-2xl',          // Taille de police
        'font-semibold',     // Poids de police
        'leading-none',      // Hauteur de ligne
        'tracking-tight'     // Espacement des lettres
      );
    });

    // Test du titre en tant qu'élément h3 par défaut
    it('utilise h3 comme élément par défaut', () => {
      // Rendu du titre
      render(<CardTitle>Titre H3</CardTitle>);
      
      // Vérification que c'est un élément h3
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Titre H3');
    });
  });

  // Tests du composant CardDescription
  describe('CardDescription', () => {
    // Test de rendu de la description
    it('rend la CardDescription correctement', () => {
      // Rendu de la description
      render(
        <CardDescription data-testid="card-description">
          Ceci est une description de carte détaillée.
        </CardDescription>
      );
      
      // Vérification de la description
      const description = screen.getByTestId('card-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Ceci est une description de carte détaillée.');
    });

    // Test des classes CSS de la description
    it('applique les classes CSS correctes à la description', () => {
      // Rendu de la description
      render(
        <CardDescription data-testid="description-styles">
          Description
        </CardDescription>
      );
      
      // Vérification des classes de la description
      const description = screen.getByTestId('description-styles');
      expect(description).toHaveClass(
        'text-sm',           // Petite taille de police
        'text-muted-foreground' // Couleur de texte atténuée
      );
    });
  });

  // Tests du composant CardContent
  describe('CardContent', () => {
    // Test de rendu du contenu
    it('rend le CardContent correctement', () => {
      // Rendu du contenu
      render(
        <CardContent data-testid="card-content">
          <p>Contenu principal de la carte</p>
          <button>Action</button>
        </CardContent>
      );
      
      // Vérification du contenu
      const content = screen.getByTestId('card-content');
      expect(content).toBeInTheDocument();
      expect(screen.getByText('Contenu principal de la carte')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    // Test des classes CSS du contenu
    it('applique les classes CSS correctes au contenu', () => {
      // Rendu du contenu
      render(
        <CardContent data-testid="content-styles">Contenu</CardContent>
      );
      
      // Vérification des classes du contenu
      const content = screen.getByTestId('content-styles');
      expect(content).toHaveClass(
        'p-6',    // Padding
        'pt-0'    // Padding-top à 0 (pour s'aligner avec le header)
      );
    });
  });

  // Tests du composant CardFooter
  describe('CardFooter', () => {
    // Test de rendu du footer
    it('rend le CardFooter correctement', () => {
      // Rendu du footer
      render(
        <CardFooter data-testid="card-footer">
          <button>Annuler</button>
          <button>Confirmer</button>
        </CardFooter>
      );
      
      // Vérification du footer
      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirmer' })).toBeInTheDocument();
    });

    // Test des classes CSS du footer
    it('applique les classes CSS correctes au footer', () => {
      // Rendu du footer
      render(
        <CardFooter data-testid="footer-styles">Footer</CardFooter>
      );
      
      // Vérification des classes du footer
      const footer = screen.getByTestId('footer-styles');
      expect(footer).toHaveClass(
        'flex',        // Flexbox
        'items-center', // Alignement vertical centré
        'p-6',         // Padding
        'pt-0'         // Padding-top à 0
      );
    });
  });

  // Tests d'intégration - carte complète
  describe('Carte complète intégrée', () => {
    // Test d'une carte avec tous les composants
    it('rend une carte complète avec tous les composants', () => {
      // Rendu d'une carte complète
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Titre de la Carte</CardTitle>
            <CardDescription>Description détaillée de la carte</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Contenu principal avec des informations importantes.</p>
            <ul>
              <li>Élément 1</li>
              <li>Élément 2</li>
            </ul>
          </CardContent>
          <CardFooter>
            <button>Action Secondaire</button>
            <button>Action Principale</button>
          </CardFooter>
        </Card>
      );
      
      // Vérifications de tous les éléments
      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Titre de la Carte');
      expect(screen.getByText('Description détaillée de la carte')).toBeInTheDocument();
      expect(screen.getByText('Contenu principal avec des informations importantes.')).toBeInTheDocument();
      expect(screen.getByText('Élément 1')).toBeInTheDocument();
      expect(screen.getByText('Élément 2')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Secondaire' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Principale' })).toBeInTheDocument();
    });

    // Test de l'ordre des éléments dans la carte
    it('maintient l\'ordre correct des éléments', () => {
      // Rendu d'une carte avec ordre spécifique
      render(
        <Card>
          <CardHeader>
            <CardTitle>Premier</CardTitle>
          </CardHeader>
          <CardContent>
            <span>Deuxième</span>
          </CardContent>
          <CardFooter>
            <span>Troisième</span>
          </CardFooter>
        </Card>
      );
      
      // Récupération de tous les éléments textuels
      const elements = screen.getAllByText(/(Premier|Deuxième|Troisième)/);
      
      // Vérification de l'ordre
      expect(elements[0]).toHaveTextContent('Premier');
      expect(elements[1]).toHaveTextContent('Deuxième');
      expect(elements[2]).toHaveTextContent('Troisième');
    });

    // Test de transmission des props HTML
    it('transmet les props HTML natives', () => {
      // Rendu avec propriétés HTML
      render(
        <Card 
          id="card-id"
          role="article"
          aria-labelledby="card-title"
          onClick={() => {}}
        >
          <CardTitle id="card-title">Titre</CardTitle>
          <CardContent>Contenu</CardContent>
        </Card>
      );
      
      // Vérification des attributs HTML
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('id', 'card-id');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      
      // Vérification de l'ID du titre
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveAttribute('id', 'card-title');
    });
  });
});
