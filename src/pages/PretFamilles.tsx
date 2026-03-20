
import React from 'react';
import { Navigate } from 'react-router-dom';

const PretFamilles: React.FC = () => {
  // Redirige vers la page Dashboard qui contient la gestion des prêts familles
  return <Navigate to="/" replace />;
};

export default PretFamilles;
