import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MonthlyResetHandler: React.FC = () => {
  const { user } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkMonthEntry = async () => {
      // Éviter les vérifications multiples
      if (!user || hasChecked.current) return;
      hasChecked.current = true;

      try {
        // Appeler la route qui vérifie si une entrée existe pour le mois en cours
        // et la crée si elle n'existe pas (sans supprimer les données précédentes)
        const response = await axios.get(`${AUTH_BASE_URL}/api/depenses/check-month`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.created) {
          console.log('Nouvelle entrée créée pour le mois:', response.data.message);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du mois:', error);
        hasChecked.current = false;
      }
    };

    checkMonthEntry();
  }, [user]);

  // Reset le flag quand l'utilisateur change
  useEffect(() => {
    hasChecked.current = false;
  }, [user?.id]);

  return null;
};

export default MonthlyResetHandler;
