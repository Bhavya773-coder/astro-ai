import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import VerifyOtpPage from './components/VerifyOtpPage';
import NewPasswordPage from './components/NewPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import OnboardingStep1 from './components/OnboardingStep1';
import OnboardingStep2 from './components/OnboardingStep2';
import OnboardingStep3 from './components/OnboardingStep3';
import MainPage from './components/MainPage';
import NumerologyPage from './components/NumerologyPage';
import BirthChartPage from './components/BirthChartPage';
import ReportsPage from './components/ReportsPage';
import SignUpPage from './components/SignUpPage';
import ProtectedRoute from './auth/ProtectedRoute';
import GPTChatPage from './components/GPTChatPage';
import { AppDataProvider } from './state/AppDataContext';

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
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/new-password" element={<NewPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/onboarding/step-1" element={<OnboardingStep1 />} />
            <Route path="/onboarding/step-2" element={<OnboardingStep2 />} />
            <Route path="/onboarding/step-3" element={<OnboardingStep3 />} />
            <Route path="/dashboard" element={<MainPage />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppDataProvider>
      </div>
    </Router>
  );
}

export default App;
