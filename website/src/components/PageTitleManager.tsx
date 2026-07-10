import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitleManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'AstroAi4u';

    // Map paths to titles
    const routeTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/numerology': 'Numerology',
      '/birth-chart': 'Birth Chart',
      '/reports': 'Astrology Reports',
      '/ai-chat': 'AI Chat',
      '/palm-reading': 'Palm Reading',
      '/coffee-reading': 'Coffee Reading',
      '/face-reading': 'Face Reading',
      '/tarot-reading': 'Tarot Reading',
      '/style-forecaster': 'Style Forecaster',
      '/pro': 'Pro Subscription',
      '/settings': 'Settings',
      '/previous-readings': 'Previous Readings',
      '/support': 'Support',
      '/help-center': 'Help Center',
      '/contact': 'Contact Us',
      '/privacy': 'Privacy Policy',
      '/terms': 'Terms of Service',
      '/login': 'Login',
      '/signup': 'Sign Up',
    };

    if (routeTitles[path]) {
      title = routeTitles[path];
    } else if (path.startsWith('/shared-')) {
      title = 'Shared Reading';
    } else if (path === '/') {
      title = 'AstroAi4u | AI Astrology';
    }

    document.title = `${title} | AstroAi4u`;
  }, [location]);

  return null;
};

export default PageTitleManager;
