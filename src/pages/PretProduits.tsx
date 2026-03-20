
import React from 'react';
import { Navigate } from 'react-router-dom';

const PretProduits: React.FC = () => {
  // Redirige vers la page Dashboard qui contient la gestion des prêts produits
  return <Navigate to="/" replace />;
};

export default PretProduits;
