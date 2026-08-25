import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './components/ThemeProvider';

// Pages
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import CitizenDashboard from './pages/citizen/CitizenDashboard';

import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AskAIPage from './pages/citizen/AskAIPage';
import ProfilePage from './pages/citizen/ProfilePage';
import CasesPage from './pages/citizen/CasesPage';
import DocumentsPage from './pages/citizen/DocumentsPage';
import TimelinePage from './pages/citizen/TimelinePage';
import JudgmentsPage from './pages/citizen/JudgmentsPage';
import { PublicLandingPage } from './pages/landing/PublicLandingPage';

// Components
import { AuthGateModal } from './components/ui/AuthGateModal';
import { FloatingAskAIWorkspace } from './components/FloatingAskAIWorkspace';

function App() {
  const { initialize, user, role } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="nyayaaI-theme">
      <BrowserRouter>
        <AuthGateModal />
        <FloatingAskAIWorkspace />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLandingPage />} />
          
          <Route path="/login" element={user ? <Navigate to={`/${role}/dashboard`} replace /> : <Navigate to="/?auth=login" replace />} />
          <Route path="/signup" element={user ? <Navigate to={`/${role}/dashboard`} replace /> : <Navigate to="/?auth=signup" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/ask-ai" element={<AskAIPage />} />
            <Route path="/citizen/cases" element={<CasesPage />} />
            <Route path="/citizen/documents" element={<DocumentsPage />} />
            <Route path="/citizen/timeline" element={<TimelinePage />} />
            <Route path="/citizen/judgments" element={<JudgmentsPage />} />
            <Route path="/citizen/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['lawyer']} />}>
            <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
