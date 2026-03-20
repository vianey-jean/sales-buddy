
import React from 'react';
import { Navigate } from 'react-router-dom';

const Ventes: React.FC = () => {
  // Redirige vers la page Dashboard qui contient la gestion des ventes
  return <Navigate to="/" replace />;
};

export default Ventes;
