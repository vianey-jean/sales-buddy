import React, { memo, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  /** Page actuelle (1-indexed) */
  currentPage: number;
  /** Nombre total de pages */
  totalPages: number;
  /** Callback appelé lors du changement de page */
  onPageChange: (page: number) => void;
  /** Nombre total d'éléments */
  totalItems?: number;
  /** Éléments par page */
  itemsPerPage?: number;
  /** Afficher les boutons first/last */
  showFirstLast?: boolean;
  /** Afficher le compteur d'éléments */
  showItemCount?: boolean;
  /** Nombre de pages visibles autour de la page courante */
  siblingCount?: number;
  /** Classes CSS additionnelles */
  className?: string;
  /** Taille des boutons */
  size?: 'sm' | 'md' | 'lg';
  /** Désactiver la pagination */
  disabled?: boolean;
}

/**
 * Composant de pagination réutilisable
 * Accessible et responsive
 */
const Pagination: React.FC<PaginationProps> = memo(({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showFirstLast = true,
  showItemCount = true,
  siblingCount = 1,
  className,
  size = 'md',
  disabled = false
}) => {
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  }, [currentPage, totalPages, onPageChange, disabled]);

  // Calcul des pages visibles
  const visiblePages = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // Afficher toutes les pages si <= 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);
      
      // Calculer la plage autour de la page courante
      const leftSibling = Math.max(2, currentPage - siblingCount);
      const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);
      
      // Ellipsis gauche
      if (leftSibling > 2) {
        pages.push('ellipsis');
      }
      
      // Pages centrales
      for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      // Ellipsis droite
      if (rightSibling < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Toujours afficher la dernière page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages, siblingCount]);

  // Calcul du compteur d'éléments
  const itemCountText = useMemo(() => {
    if (!showItemCount || !totalItems || !itemsPerPage) return null;
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    return `${start}-${end} sur ${totalItems}`;
  }, [showItemCount, currentPage, totalItems, itemsPerPage]);

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4",
        className
      )}
      aria-label="Pagination"
      role="navigation"
    >
      {/* Compteur d'éléments */}
      {itemCountText && (
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {itemCountText}
        </div>
      )}

      {/* Boutons de pagination */}
      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        {/* Première page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            className={cn(sizeStyles[size], "hidden sm:flex")}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || disabled}
            aria-label="Première page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Page précédente */}
        <Button
          variant="outline"
          size="icon"
          className={sizeStyles[size]}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Numéros de pages */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={cn(
                    "flex items-center justify-center text-muted-foreground",
                    sizeStyles[size]
                  )}
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                size="icon"
                className={cn(
                  sizeStyles[size],
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={() => handlePageChange(page)}
                disabled={disabled}
                aria-label={`Page ${page}`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Page suivante */}
        <Button
          variant="outline"
          size="icon"
          className={sizeStyles[size]}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Dernière page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon"
            className={cn(sizeStyles[size], "hidden sm:flex")}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || disabled}
            aria-label="Dernière page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
