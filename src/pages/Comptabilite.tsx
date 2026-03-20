
import React from 'react';
import { Navigate } from 'react-router-dom';

const Comptabilite: React.FC = () => {
  // Redirige vers la page Dashboard qui contient la comptabilité
  return <Navigate to="/" replace />;
};

export default Comptabilite;
