// Hook personnalisé pour la gestion des produits
import { useState, useEffect, useCallback, useRef } from 'react';
import { productApiService } from '@/services/api';
import { realtimeService } from '@/services/realtimeService';
import { Product, ProductFormData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const lastDataRef = useRef<Product[]>([]);
  const { toast } = useToast();

  const fetchProducts = useCallback(async (isInitialLoad = false) => {
    try {
      const data = await productApiService.getAll();
      const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(data);
      
      if (hasChanged || isInitialLoad) {
        setProducts(data);
        lastDataRef.current = data;
      }
      
      if (isInitialLoad) {
        setHasInitialLoad(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des produits:', error);
      if (!hasInitialLoad) {
        setProducts([]);
        lastDataRef.current = [];
      }
      setIsLoading(false);
    }
  }, [hasInitialLoad]);

  useEffect(() => {
    fetchProducts(true);

    const token = localStorage.getItem('token');
    realtimeService.connect(token);

    const unsubscribe = realtimeService.addDataListener((data) => {
      if (data.products) {
        const newData = data.products || [];
        const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(newData);
        
        if (hasChanged) {
          setProducts(newData);
          lastDataRef.current = newData;
          setIsLoading(false);
        }
      }
    });

    const unsubscribeSync = realtimeService.addSyncListener((event) => {
      if (event.type === 'force-sync') {
        fetchProducts(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSync();
    };
  }, [fetchProducts]);

  const searchProducts = useCallback((query: string): Product[] => {
    if (query.length < 3) return [];
    return products.filter(product => 
      product.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [products]);

  const addProduct = useCallback(async (data: ProductFormData): Promise<boolean> => {
    try {
      await productApiService.create(data);
      toast({
        title: "Succès",
        description: "Produit ajouté avec succès",
        className: "notification-success",
      });
      fetchProducts(false);
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout",
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    }
  }, [fetchProducts, toast]);

  const updateProduct = useCallback(async (id: string, data: Partial<ProductFormData>): Promise<boolean> => {
    try {
      await productApiService.update(id, data);
      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
        className: "notification-success",
      });
      fetchProducts(false);
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    }
  }, [fetchProducts, toast]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      await productApiService.delete(id);
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
        className: "notification-success",
      });
      fetchProducts(false);
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    }
  }, [fetchProducts, toast]);

  const refetch = useCallback(() => {
    fetchProducts(false);
  }, [fetchProducts]);

  return {
    products,
    isLoading: isLoading && !hasInitialLoad,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch,
  };
};

export default useProducts;
