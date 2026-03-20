
import React from 'react';
import { Navigate } from 'react-router-dom';

const Produits: React.FC = () => {
  // Redirige vers la page Dashboard qui contient la gestion des produits
  return <Navigate to="/" replace />;
};

export default Produits;
