import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

const defaultSEO = {
  title: 'Astro AI | AI Astrology & Personalized Oracle | Astroai4u',
  description: 'Astro AI - Your Personal AI Astrologer & My Oracle. Get AI-powered astrology readings, daily horoscopes, personalized tarot, numerology insights, birth charts & face reading.',
  keywords: 'Astro AI, Astroai4u, AI Astrology, Personalized AI, My Oracle, Astrology Using AI',
  ogImage: 'https://astroai4u.com/og-image.jpg',
};

export const SEO: React.FC<SEOProps> = ({
  title = defaultSEO.title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  ogTitle,
  ogDescription,
  ogImage = defaultSEO.ogImage,
  canonical,
  noIndex = false,
}) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph
    updateMetaTag('og:title', ogTitle || title, true);
    updateMetaTag('og:description', ogDescription || description, true);
    updateMetaTag('og:image', ogImage, true);
    
    // Twitter
    updateMetaTag('twitter:title', ogTitle || title, true);
    updateMetaTag('twitter:description', ogDescription || description, true);
    updateMetaTag('twitter:image', ogImage, true);
    
    // Robots
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonical);
    }

    // Cleanup function
    return () => {
      // Meta tags are updated on next render, no cleanup needed
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, noIndex]);

  return null;
};

// Pre-configured SEO presets for common pages
export const SEOPresets = {
  home: {
    title: 'Astro AI | AI Astrology & Personalized Oracle | Astroai4u',
    description: 'Astro AI - Your Personal AI Astrologer & My Oracle. Get AI-powered astrology readings, daily horoscopes, personalized tarot, numerology insights, birth charts & face reading.',
    keywords: 'Astro AI, Astroai4u, AI Astrology, Personalized AI, My Oracle, Astrology Using AI',
  },
  aiChat: {
    title: 'AI Chat | Astro AI - Your Personal AI Astrologer',
    description: 'Chat with your personal AI astrologer. Get instant astrological guidance, horoscope readings, and cosmic insights powered by AI.',
    keywords: 'AI Chat Astrology, AI Astrologer Chat, Personal AI Oracle, Chat with Astrologer AI',
  },
  birthChart: {
    title: 'Free Birth Chart Analysis | AI-Powered | Astro AI',
    description: 'Get your personalized AI-powered birth chart analysis. Discover your cosmic blueprint with detailed astrological interpretations.',
    keywords: 'Free Birth Chart, AI Birth Chart Analysis, Natal Chart Online, Vedic Birth Chart',
  },
  numerology: {
    title: 'AI Numerology Calculator | Personalized Insights | Astro AI',
    description: 'Discover your life path number and personal numerology with AI. Get accurate numerology readings and predictions.',
    keywords: 'Numerology Calculator, Life Path Number, AI Numerology, Personal Numbers',
  },
  styleForecaster: {
    title: 'StyleForecaster | AI Fashion & Style Guide | Astro AI',
    description: 'Get AI-powered daily style and fashion recommendations based on your astrological profile. Dress in harmony with cosmic energies.',
    keywords: 'AI Style Guide, Fashion Astrology, Daily Style Tips, Cosmic Fashion',
  },
  reports: {
    title: 'Astrology Reports | Compatibility & Forecasts | Astro AI',
    description: 'Generate comprehensive astrology reports including compatibility analysis, yearly forecasts, and personalized recommendations.',
    keywords: 'Astrology Reports, Compatibility Analysis, Yearly Forecast, AI Astrology Report',
  },
  login: {
    title: 'Login | Astro AI - Your Personal AI Astrologer',
    description: 'Sign in to Astro AI to access your personalized astrological insights, daily horoscopes, and AI-powered guidance.',
    noIndex: true,
  },
  signup: {
    title: 'Sign Up | Astro AI - Your Personal AI Astrologer',
    description: 'Create your Astro AI account to unlock personalized astrology readings, daily horoscopes, and AI-powered cosmic guidance.',
    noIndex: true,
  },
};

export default SEO;
