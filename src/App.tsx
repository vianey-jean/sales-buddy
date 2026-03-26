// Résumé :
// Ce fichier définit la configuration principale de l'application React.
// - Fournit les Contexts globaux : Auth, App, Theme, Accessibilité
// - Configure les routes avec sécurité (ProtectedRoute) et lazy loading
// - Utilise ErrorBoundary pour isoler les erreurs critiques
// - Améliore les performances en chargeant les pages "à la demande"

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecurityCheckPage from '@/components/security/SecurityCheckPage';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';

// Sécurité et erreurs
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import CookieConsent from '@/components/CookieConsent';

// Fallback pendant chargement des pages
import PremiumLoading from '@/components/ui/premium-loading';

// ==================
// Lazy loading pages
// ==================
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
// TendancesPage removed - content moved to Comptabilité & Finances in Dashboard
const ClientsPage = lazy(() => import('@/pages/ClientsPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const CommandesPage = lazy(() => import('@/pages/CommandesPage'));
const RdvPage = lazy(() => import('@/pages/RdvPage'));
const ProduitsPage = lazy(() => import('@/pages/ProduitsPage'));
const PointagePage = lazy(() => import('@/pages/PointagePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const SharedNotesPage = lazy(() => import('@/pages/SharedNotesPage'));
const SharedViewPage = lazy(() => import('@/pages/SharedViewPage'));

function App() {
  const [securityVerified, setSecurityVerified] = useState(() => {
    try {
      const data = sessionStorage.getItem('security_verified');
      if (data) {
        const parsed = JSON.parse(data);
        // Vérifier que la session est encore valide (même session navigateur)
        if (parsed.verified && parsed.timestamp) {
          const elapsed = Date.now() - parsed.timestamp;
          // Valide pendant 24h max
          if (elapsed < 24 * 60 * 60 * 1000) {
            return true;
          }
        }
      }
    } catch {
      // ignore
    }
    return false;
  });

  if (!securityVerified) {
    return (
      <ThemeProvider>
        <SecurityCheckPage onVerified={() => setSecurityVerified(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <AppProvider>
              <Router>
                {/* Suspense : gestion du chargement asynchrone */}
                <Suspense
                  fallback={
                    <PremiumLoading
                      text="Chargement des données en cours..."
                      size="xl"
                      overlay={true}
                      variant="default"
                    />
                  }
                >
                  <Routes>
                    {/* Routes publiques */}
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="shared/notes/:token" element={<SharedNotesPage />} />
                    <Route path="shared/:token" element={<SharedViewPage />} />

                    {/* Routes protégées */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Route Tendances supprimée - contenu dans Dashboard > Comptabilité & Finances */}
                    <Route
                      path="/clients"
                      element={
                        <ProtectedRoute>
                          <ClientsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/commandes"
                      element={
                        <ProtectedRoute>
                          <CommandesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/rdv"
                      element={
                        <ProtectedRoute>
                          <RdvPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/produits"
                      element={
                        <ProtectedRoute>
                          <ProduitsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pointage"
                      element={
                        <ProtectedRoute>
                          <PointagePage />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Page 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
              <Toaster />
              <CookieConsent />
            </AppProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
