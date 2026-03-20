
import { Navigate } from "react-router-dom";

/**
 * Composant de la page d'index
 * Redirige automatiquement vers la page d'accueil
 */
const Index = () => {
  return <Navigate to="/home" replace />;
};

export default Index;
