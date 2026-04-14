import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './auth/AuthContext';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import VerifyOtpPage from './components/VerifyOtpPage';
import NewPasswordPage from './components/NewPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import OnboardingFlow from './components/OnboardingFlow';
import SupportPage from './components/SupportPage';
import HelpCenterPage from './components/HelpCenterPage';
import ContactPage from './components/ContactPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import MainPage from './components/MainPage';
import NumerologyPage from './components/NumerologyPage';
import BirthChartPage from './components/BirthChartPage';
import ReportsPage from './components/ReportsPage';
import ProSubscriptionPage from './components/ProSubscriptionPage';
import SubscriptionSuccessPage from './components/SubscriptionSuccessPage';
import SignUpPage from './components/SignUpPage';
import ProtectedRoute from './auth/ProtectedRoute';
import GPTChatPage from './components/GPTChatPage';
import DressingStylerPage from './components/DressingStylerPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import SettingsPage from './components/SettingsPage';
import SharedChatPage from './components/SharedChatPage';
import SharedHoroscopePage from './components/SharedHoroscopePage';
import SharedNumerologyPage from './components/SharedNumerologyPage';
import FeedbackButton from './components/FeedbackButton';
import { AppDataProvider } from './state/AppDataContext';

// Wrapper component to handle authenticated redirect for homepage
const HomePageWrapper: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  
  if (isInitializing) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <HomePage />;
};

// Wrapper for auth pages (login/signup) - redirect to dashboard if already logged in
const AuthPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  
  if (isInitializing) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#fbbf24',
                secondary: '#1f2937',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1f2937',
              },
            },
          }}
        />
        <AppDataProvider>
          <Routes>
            <Route path="/" element={<HomePageWrapper />} />

            <Route path="/login" element={<AuthPageWrapper><LoginPage /></AuthPageWrapper>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/new-password" element={<NewPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
            <Route path="/signup" element={<AuthPageWrapper><SignUpPage /></AuthPageWrapper>} />
            <Route
              path="/onboarding/*"
              element={
                <ProtectedRoute>
                  <OnboardingFlow />
                </ProtectedRoute>
              }
            />
            
            {/* Public Legal & Support Routes */}
            <Route path="/support" element={<SupportPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/numerology"
              element={
                <ProtectedRoute>
                  <NumerologyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/birth-chart"
              element={
                <ProtectedRoute>
                  <BirthChartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-chat"
              element={
                <ProtectedRoute>
                  <GPTChatPage />
                </ProtectedRoute>
              }
            />
            {/* Public shared routes - no auth required */}
            <Route path="/shared-chat/:shareId" element={<SharedChatPage />} />
            <Route path="/shared-horoscope/:shareId" element={<SharedHoroscopePage />} />
            <Route path="/shared-numerology/:shareId" element={<SharedNumerologyPage />} />
            <Route
              path="/style-forcaster"
              element={
                <ProtectedRoute>
                  <DressingStylerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pro"
              element={
                <ProtectedRoute>
                  <ProSubscriptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription-success"
              element={
                <ProtectedRoute>
                  <SubscriptionSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FeedbackButton />
        </AppDataProvider>
      </div>
    </Router>
  );
}

export default App;
