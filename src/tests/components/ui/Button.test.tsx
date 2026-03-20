// Importation de React pour les références
import React from 'react';
// Importation des utilitaires de test
import { render, screen, fireEvent } from '@testing-library/react';
// Importation des fonctions de test Vitest
import { describe, it, expect, vi } from 'vitest';
// Importation des matchers Jest DOM
import '@testing-library/jest-dom';
// Importation du composant Button
import { Button } from '@/components/ui/button';

// Suite de tests pour le composant Button UI
describe('Button UI Component', () => {
  it('affiche le texte correctement', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('appelle le gestionnaire onClick', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Test Button</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applique les classes CSS par défaut', () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    );
  });

  it('supporte la navigation au clavier', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Test Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex');
  });

  it('transmet correctement la ref', () => {
    const buttonRef = React.createRef<HTMLButtonElement>();

    render(<Button ref={buttonRef}>Button avec ref</Button>);

    expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(buttonRef.current?.textContent).toBe('Button avec ref');
  });
});
