// Hook personnalisé pour la gestion des ventes
import { useState, useEffect, useCallback, useRef } from 'react';
import { saleApiService } from '@/services/api';
import { realtimeService } from '@/services/realtimeService';
import { Sale } from '@/types/sale';
import { useToast } from '@/hooks/use-toast';

export const useSales = (month?: number, year?: number) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const lastDataRef = useRef<Sale[]>([]);
  const { toast } = useToast();

  const fetchSales = useCallback(async (isInitialLoad = false) => {
    try {
      const data = month !== undefined && year !== undefined
        ? await saleApiService.getByMonth(month, year)
        : await saleApiService.getAll();
      
      const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(data);
      
      if (hasChanged || isInitialLoad) {
        setSales(data);
        lastDataRef.current = data;
      }
      
      if (isInitialLoad) {
        setHasInitialLoad(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des ventes:', error);
      if (!hasInitialLoad) {
        setSales([]);
        lastDataRef.current = [];
      }
      setIsLoading(false);
    }
  }, [month, year, hasInitialLoad]);

  useEffect(() => {
    fetchSales(true);

    const token = localStorage.getItem('token');
    realtimeService.connect(token);

    const unsubscribe = realtimeService.addDataListener((data) => {
      if (data.sales) {
        const newData = data.sales || [];
        const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(newData);
        
        if (hasChanged) {
          setSales(newData);
          lastDataRef.current = newData;
          setIsLoading(false);
        }
      }
    });

    const unsubscribeSync = realtimeService.addSyncListener((event) => {
      if (event.type === 'force-sync') {
        fetchSales(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSync();
    };
  }, [fetchSales]);

  const addSale = useCallback(async (data: Omit<Sale, 'id'>): Promise<boolean> => {
    try {
      await saleApiService.create(data);
      toast({
        title: "Succès",
        description: "Vente ajoutée avec succès",
        className: "notification-success",
      });
      fetchSales(false);
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
  }, [fetchSales, toast]);

  const updateSale = useCallback(async (id: string, data: Partial<Sale>): Promise<boolean> => {
    try {
      await saleApiService.update(id, data);
      toast({
        title: "Succès",
        description: "Vente mise à jour avec succès",
        className: "notification-success",
      });
      fetchSales(false);
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
  }, [fetchSales, toast]);

  const deleteSale = useCallback(async (id: string): Promise<boolean> => {
    try {
      await saleApiService.delete(id);
      toast({
        title: "Succès",
        description: "Vente supprimée avec succès",
        className: "notification-success",
      });
      fetchSales(false);
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
  }, [fetchSales, toast]);

  const exportMonth = useCallback(async (exportMonth: number, exportYear: number): Promise<boolean> => {
    try {
      await saleApiService.exportMonth(exportMonth, exportYear);
      toast({
        title: "Succès",
        description: "Export effectué avec succès",
        className: "notification-success",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export",
        variant: "destructive",
        className: "notification-erreur",
      });
      return false;
    }
  }, [toast]);

  const refetch = useCallback(() => {
    fetchSales(false);
  }, [fetchSales]);

  return {
    sales,
    isLoading: isLoading && !hasInitialLoad,
    addSale,
    updateSale,
    deleteSale,
    exportMonth,
    refetch,
  };
};

export default useSales;
