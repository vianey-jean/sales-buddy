
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';
import { 
  Home, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Settings, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
  ariaLabel?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    href: '/',
    icon: Home,
    ariaLabel: 'Aller à la page d\'accueil'
  },
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: BarChart3,
    ariaLabel: 'Accéder au tableau de bord'
  },
  {
    id: 'sales',
    label: 'Ventes',
    href: '/ventes',
    icon: ShoppingCart,
    ariaLabel: 'Gérer les ventes'
  },
  {
    id: 'tendances',
    label: 'Tendances',
    href: '/tendances',
    icon: BarChart3,
    ariaLabel: 'Voir les tendances et analyses'
  }
];

interface AccessibleNavigationProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

export const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  className,
  variant = 'horizontal'
}) => {
  const location = useLocation();
  const { settings, announceToScreenReader } = useAccessibility();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  useEffect(() => {
    // Annoncer les changements de page aux lecteurs d'écran
    const currentItem = navigationItems.find(item => item.href === location.pathname);
    if (currentItem) {
      announceToScreenReader(`Navigation vers ${currentItem.label}`);
    }
  }, [location.pathname, announceToScreenReader]);

  const handleKeyDown = (event: React.KeyboardEvent, itemId: string) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const currentIndex = navigationItems.findIndex(item => item.id === itemId);
        const nextIndex = (currentIndex + 1) % navigationItems.length;
        setFocusedItem(navigationItems[nextIndex].id);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const currentIndexUp = navigationItems.findIndex(item => item.id === itemId);
        const prevIndex = currentIndexUp === 0 ? navigationItems.length - 1 : currentIndexUp - 1;
        setFocusedItem(navigationItems[prevIndex].id);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Le lien sera activé automatiquement
        break;
        
      case 'Escape':
        setIsMenuOpen(false);
        setFocusedItem(null);
        break;
    }
  };

  const renderNavigationItem = (item: NavigationItem, index: number) => {
    const isActive = location.pathname === item.href;
    const isFocused = focusedItem === item.id;

    return (
      <li key={item.id} role="none">
        <Link
          to={item.href}
          className={cn(
            'flex items-center px-4 py-2 rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'hover:bg-primary/10 hover:text-primary',
            isActive && 'bg-primary text-primary-foreground font-medium',
            isFocused && 'ring-2 ring-primary ring-offset-2',
            variant === 'vertical' ? 'justify-start' : 'justify-center',
            className
          )}
          aria-label={item.ariaLabel || item.label}
          aria-current={isActive ? 'page' : undefined}
          onFocus={() => setFocusedItem(item.id)}
          onBlur={() => setFocusedItem(null)}
          onKeyDown={(e) => handleKeyDown(e, item.id)}
          tabIndex={isMenuOpen || variant === 'horizontal' ? 0 : -1}
        >
          <item.icon 
            className={cn(
              'h-5 w-5',
              variant === 'horizontal' ? 'mr-2' : 'mr-3'
            )} 
            aria-hidden="true" 
          />
          <span className={variant === 'vertical' ? 'block' : 'hidden sm:block'}>
            {item.label}
          </span>
          {isActive && (
            <span className="sr-only">
              - Page actuelle
            </span>
          )}
        </Link>
      </li>
    );
  };

  if (variant === 'horizontal') {
    return (
      <nav 
        className={cn('relative', className)}
        role="navigation"
        aria-label="Navigation principale"
      >
        {/* Menu mobile */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          {isMenuOpen && (
            <ul
              id="mobile-menu"
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-50"
              role="menu"
            >
              {navigationItems.map((item, index) => renderNavigationItem(item, index))}
            </ul>
          )}
        </div>

        {/* Menu desktop */}
        <ul 
          className="hidden md:flex space-x-1"
          role="menubar"
        >
          {navigationItems.map((item, index) => renderNavigationItem(item, index))}
        </ul>
      </nav>
    );
  }

  return (
    <nav 
      className={cn('w-full', className)}
      role="navigation"
      aria-label="Navigation principale"
    >
      <ul className="space-y-1" role="menu">
        {navigationItems.map((item, index) => renderNavigationItem(item, index))}
      </ul>
    </nav>
  );
};

export default AccessibleNavigation;
