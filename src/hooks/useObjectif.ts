import { useState, useEffect, useCallback } from 'react';
import { objectifApi, ObjectifData } from '@/services/api/objectifApi';

export const useObjectif = () => {
  const [data, setData] = useState<ObjectifData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjectif = useCallback(async () => {
    try {
      setLoading(true);
      // This will fetch and recalculate from sales.json automatically
      const result = await objectifApi.get();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching objectif:', err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateObjectif = useCallback(async (newObjectif: number) => {
    try {
      const result = await objectifApi.updateObjectif(newObjectif);
      setData(result);
      // DO NOT recalculate after updating - it would overwrite the custom objectif
      return result;
    } catch (err) {
      console.error('Error updating objectif:', err);
      throw err;
    }
  }, []);

  const recalculate = useCallback(async () => {
    try {
      const result = await objectifApi.recalculate();
      setData(result);
      return result;
    } catch (err) {
      console.error('Error recalculating:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchObjectif();
    
    // Recalculate every 30 seconds to keep in sync with sales
    const interval = setInterval(() => {
      objectifApi.recalculate().then(setData).catch(console.error);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchObjectif]);

  return {
    data,
    loading,
    error,
    fetchObjectif,
    updateObjectif,
    recalculate
  };
};

export default useObjectif;
