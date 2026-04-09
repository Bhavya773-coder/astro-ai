import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { CosmicBackground } from './CosmicBackground';
import { LoadingSpinner } from './CosmicUI';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        navigate('/login?error=google_auth_failed');
        return;
      }

      if (!code) {
        navigate('/login?error=no_code');
        return;
      }

      try {
        const response = await apiFetch('/api/auth/google', {
          method: 'POST',
          body: JSON.stringify({ 
            code,
            redirectUri: window.location.origin + window.location.pathname
          })
        });

        if (response?.token && response?.user) {
          setAuth(response.token, response.user);
          navigate('/dashboard');
        } else {
          navigate('/login?error=invalid_response');
        }
      } catch (err: any) {
        navigate('/login?error=backend_error');
      }
    };

    handleGoogleCallback();
  }, [location.search, navigate, setAuth]);

  return (
    <CosmicBackground className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-cyan mb-6 shadow-cosmic">
          <LoadingSpinner size="lg" className="text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2 text-glow">Completing Sign In</h2>
        <p className="text-white/60">Please wait while we authenticate you with Google...</p>
      </div>
    </CosmicBackground>
  );
};

export default GoogleAuthCallback;
