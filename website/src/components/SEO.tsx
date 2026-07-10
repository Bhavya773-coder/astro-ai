import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  canonical?: string;
  noIndex?: boolean;
  structuredData?: object;
}

const defaultSEO = {
  title: 'AstroAi4u | AI Astrology & Personalized Oracle',
  description: 'AstroAi4u - Your Personal AI Astrologer & My Oracle. Get AI-powered astrology readings, daily horoscopes, personalized tarot, numerology insights, birth charts & face reading.',
  keywords: 'AstroAi4u, AI Astrology, Personalized AI, My Oracle, Astrology Using AI, AI Astrologer, Free Horoscope, Daily Horoscope, Online Tarot Reading, Numerology, Birth Chart, Face Reading, Zodiac Signs, Palm Reading, Coffee Reading, Style Forecaster',
  ogImage: 'https://astroai4u.com/og-image.jpg',
};

export const SEO: React.FC<SEOProps> = ({
  title = defaultSEO.title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  ogTitle,
  ogDescription,
  ogImage = defaultSEO.ogImage,
  ogUrl,
  ogType = 'website',
  canonical,
  noIndex = false,
  structuredData,
}) => {
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={finalOgTitle} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="AstroAi4u" />
      <meta property="og:locale" content="en_US" />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={finalOgTitle} />

      {/* Structured Data JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Pre-configured SEO presets for common pages
export const SEOPresets = {
  home: {
    title: 'AstroAi4u | AI Astrology & Personalized Cosmic Oracle',
    description: 'AstroAi4u - Your Personal AI Astrologer & My Oracle. Get AI-powered astrology readings, daily horoscopes, personalized tarot, numerology insights, birth charts & face reading.',
    keywords: 'AstroAi4u, AI Astrology, Personalized AI, My Oracle, Astrology Using AI, AI Astrologer, Free Horoscope, Daily Horoscope, Online Tarot Reading, Numerology, Birth Chart, Face Reading, Zodiac Signs, Palm Reading, Coffee Reading',
    canonical: 'https://astroai4u.com/',
  },
  aiChat: {
    title: 'AI Chat | AstroAi4u - Your Personal AI Astrologer',
    description: 'Chat with your personal AI astrologer. Get instant astrological guidance, horoscope readings, and cosmic insights powered by AI.',
    keywords: 'AI Chat Astrology, AI Astrologer Chat, Personal AI Oracle, Chat with Astrologer AI, AstroAi4u Chatbot',
  },
  birthChart: {
    title: 'Free Birth Chart Analysis | AI-Powered | AstroAi4u',
    description: 'Get your personalized AI-powered birth chart analysis. Discover your cosmic blueprint with detailed astrological interpretations.',
    keywords: 'Free Birth Chart, AI Birth Chart Analysis, Natal Chart Online, Vedic Birth Chart, Kundli Online, Astrology Birth Chart, AstroAi4u',
  },
  numerology: {
    title: 'AI Numerology Calculator | Personalized Insights | AstroAi4u',
    description: 'Discover your life path number and personal numerology with AI. Get accurate numerology readings and predictions.',
    keywords: 'Numerology Calculator, Life Path Number, AI Numerology, Personal Numbers, Numerology Reading, Destiny Number, AstroAi4u',
  },
  tarotReading: {
    title: 'Online Tarot Reading | AI-Powered Tarot Cards | AstroAi4u',
    description: 'Get your free AI-powered online tarot card reading. Receive personalized tarot interpretations and spiritual guidance.',
    keywords: 'Online Tarot Reading, Free Tarot Cards, AI Tarot Reading, Tarot Spread, Tarot Interpretation, Spiritual Tarot, AstroAi4u',
  },
  palmReading: {
    title: 'AI Palm Reading | Hand Line Analysis | AstroAi4u',
    description: 'Get your palm reading with AI. Discover what your hand lines reveal about your life, love, and destiny.',
    keywords: 'Palm Reading, Hand Line Analysis, AI Palmistry, Chiromancy, Palm Lines Reading, Free Palm Reading, AstroAi4u',
  },
  faceReading: {
    title: 'AI Face Reading | Facial Astrology Analysis | AstroAi4u',
    description: 'Get your face reading with AI. Discover what your facial features reveal about your personality and destiny.',
    keywords: 'Face Reading, Facial Astrology, AI Face Analysis, Physiognomy, Face Reading Online, Personality Face Reading, AstroAi4u',
  },
  coffeeReading: {
    title: 'Coffee Cup Reading | AI Tasseography | AstroAi4u',
    description: 'Get your coffee cup reading with AI. Discover what your coffee grounds reveal about your future and destiny.',
    keywords: 'Coffee Reading, Tasseography, Coffee Cup Reading, AI Coffee Reading, Turkish Coffee Reading, Fortune Telling Coffee, AstroAi4u',
  },
  styleForecaster: {
    title: 'StyleForecaster | AI Fashion & Style Guide | AstroAi4u',
    description: 'Get AI-powered daily style and fashion recommendations based on your astrological profile. Dress in harmony with cosmic energies.',
    keywords: 'AI Style Guide, Fashion Astrology, Daily Style Tips, Cosmic Fashion, Style Forecaster, Astrology Fashion, AstroAi4u',
  },
  dressingStyler: {
    title: 'Dressing Styler | AI Fashion & Style Guide | AstroAi4u',
    description: 'Get AI-powered daily style and fashion recommendations based on your astrological profile. Dress in harmony with cosmic energies.',
    keywords: 'AI Style Guide, Fashion Astrology, Daily Style Tips, Cosmic Fashion, Dressing Styler, Astrology Fashion, AstroAi4u',
  },
  reports: {
    title: 'Online Kundli | Compatibility & Forecasts | AstroAi4u',
    description: 'Generate comprehensive Kundli matching, compatibility analysis, yearly forecasts, and personalized cosmic recommendations.',
    keywords: 'Online Kundli, Kundli Matching, Compatibility Analysis, Yearly Forecast, AI Kundli Report, Love Compatibility, Zodiac Compatibility, AstroAi4u',
  },
  horoscope: {
    title: 'Free Daily Horoscope | AI-Powered Zodiac Readings | AstroAi4u',
    description: 'Get your free daily horoscope powered by AI. Accurate zodiac readings for all 12 signs with personalized astrological insights.',
    keywords: 'Daily Horoscope, Free Horoscope, Zodiac Signs, AI Horoscope, Astrology Today, Horoscope Reading, AstroAi4u',
  },
  dashboard: {
    title: 'Dashboard | AstroAi4u - Your Personal AI Astrologer',
    description: 'Your personal astrology dashboard. Access daily horoscopes, birth charts, tarot readings, and AI astrological insights.',
    keywords: 'Astrology Dashboard, Personal Astrology, AI Astrologer Dashboard, Daily Cosmic Insights, AstroAi4u',
  },
  previousReadings: {
    title: 'Previous Readings | AstroAi4u - Your Reading History',
    description: 'View your previous astrology readings, tarot spreads, and spiritual insights on AstroAi4u.',
    keywords: 'Previous Readings, Astrology History, Past Tarot, Reading Archive, AstroAi4u',
  },
  proSubscription: {
    title: 'Pro Subscription | AstroAi4u - Unlock Premium Astrology',
    description: 'Upgrade to AstroAi4u Pro for unlimited AI astrology readings, premium features, and exclusive cosmic insights.',
    keywords: 'Astrology Pro, Premium Astrology, AI Astrology Subscription, Unlimited Readings, AstroAi4u',
  },
  subscriptionSuccess: {
    title: 'Subscription Activated | AstroAi4u Pro',
    description: 'Your AstroAi4u Pro subscription has been successfully activated. Enjoy unlimited AI astrology readings and premium features.',
    keywords: 'Astrology Subscription, Pro Activated, Premium Astrology Access, AstroAi4u',
  },
  settings: {
    title: 'Settings | AstroAi4u - Your Personal AI Astrologer',
    description: 'Manage your AstroAi4u account settings, preferences, and profile.',
    keywords: 'Astrology Settings, Account Settings, Profile Management, AstroAi4u',
  },
  adminDashboard: {
    title: 'Admin Dashboard | AstroAi4u',
    description: 'AstroAi4u admin dashboard for managing users, content, and platform analytics.',
    keywords: 'Admin Dashboard, Platform Management, AstroAi4u',
    noIndex: true,
  },
  support: {
    title: 'Support | AstroAi4u - Help Center',
    description: 'Get help and support for AstroAi4u. Find answers to common questions about AI astrology, tarot, numerology, and more.',
    keywords: 'AstroAi4u Support, Astrology Help, AI Astrology Support, Help Center',
  },
  helpCenter: {
    title: 'Help Center | AstroAi4u - FAQs & Guides',
    description: 'Find answers to frequently asked questions about AstroAi4u. Learn how to use AI astrology, tarot readings, birth charts, and more.',
    keywords: 'AstroAi4u FAQ, Astrology Help Center, How to Use AI Astrology, Astrology Guide',
  },
  contact: {
    title: 'Contact Us | AstroAi4u - Get in Touch',
    description: 'Contact AstroAi4u for support, feedback, or partnership inquiries. Reach out to our team for any astrology-related questions.',
    keywords: 'Contact AstroAi4u, Astrology Support, Reach Us, AI Astrology Contact',
  },
  privacy: {
    title: 'Privacy Policy | AstroAi4u - Data Protection',
    description: 'Read AstroAi4u privacy policy. Learn how we protect your personal data and astrological information.',
    keywords: 'Privacy Policy, Data Protection, AstroAi4u Privacy, Astrology Data Security',
  },
  terms: {
    title: 'Terms of Service | AstroAi4u - User Agreement',
    description: 'Read AstroAi4u terms of service. Understand the rules and guidelines for using our AI astrology platform.',
    keywords: 'Terms of Service, User Agreement, AstroAi4u Terms, Astrology Platform Rules',
  },
  login: {
    title: 'Login | AstroAi4u - Your Personal AI Astrologer',
    description: 'Sign in to AstroAi4u to access your personalized astrological insights, daily horoscopes, and AI-powered guidance.',
    keywords: 'AstroAi4u Login, Sign In Astrology, AI Astrologer Login',
    noIndex: true,
  },
  signup: {
    title: 'Sign Up | AstroAi4u - Your Personal AI Astrologer',
    description: 'Create your AstroAi4u account to unlock personalized astrology readings, daily horoscopes, and AI-powered cosmic guidance.',
    keywords: 'AstroAi4u Sign Up, Create Account Astrology, Register AI Astrologer',
    noIndex: true,
  },
  signupOtp: {
    title: 'Verify OTP | AstroAi4u - Account Verification',
    description: 'Verify your AstroAi4u account with OTP. Complete your registration to access AI astrology readings.',
    keywords: 'OTP Verification, Account Verification, AstroAi4u OTP',
    noIndex: true,
  },
  forgotPassword: {
    title: 'Forgot Password | AstroAi4u - Password Recovery',
    description: 'Reset your AstroAi4u password. Recover access to your personalized astrology readings and AI astrologer.',
    keywords: 'Forgot Password, Password Reset, Account Recovery',
    noIndex: true,
  },
  verifyOtp: {
    title: 'Verify OTP | AstroAi4u - Password Reset',
    description: 'Verify your identity with OTP to reset your AstroAi4u password.',
    keywords: 'OTP Verification, Password Reset OTP',
    noIndex: true,
  },
  newPassword: {
    title: 'New Password | AstroAi4u - Set New Password',
    description: 'Set a new password for your AstroAi4u account. Secure your personalized astrology readings and data.',
    keywords: 'New Password, Set Password, Account Security',
    noIndex: true,
  },
  resetPassword: {
    title: 'Reset Password | AstroAi4u - Password Recovery',
    description: 'Reset your AstroAi4u password to regain access to your AI astrology readings and cosmic insights.',
    keywords: 'Reset Password, Password Recovery, Account Access',
    noIndex: true,
  },
  onboarding: {
    title: 'Welcome | AstroAi4u - Onboarding',
    description: 'Complete your AstroAi4u onboarding to unlock personalized AI astrology readings and cosmic insights.',
    keywords: 'AstroAi4u Onboarding, Astrology Setup, Personalize Astrology',
    noIndex: true,
  },
  googleAuthCallback: {
    title: 'Google Authentication | AstroAi4u',
    description: 'Processing Google authentication for AstroAi4u.',
    noIndex: true,
  },
  sharedChat: {
    title: 'Shared Chat | AstroAi4u - AI Astrology Conversation',
    description: 'View a shared AI astrology conversation from AstroAi4u.',
    keywords: 'Shared Astrology Chat, AI Chat Share, Cosmic Conversation',
  },
  sharedHoroscope: {
    title: 'Shared Horoscope | AstroAi4u - Daily Zodiac Reading',
    description: 'View a shared horoscope reading from AstroAi4u.',
    keywords: 'Shared Horoscope, Daily Zodiac, Astrology Share',
  },
  sharedNumerology: {
    title: 'Shared Numerology | AstroAi4u - Number Reading',
    description: 'View a shared numerology reading from AstroAi4u.',
    keywords: 'Shared Numerology, Number Reading, Life Path Share',
  },
  sharedChatResponse: {
    title: 'Shared Response | AstroAi4u - AI Astrology Insight',
    description: 'View a shared AI astrology response from AstroAi4u.',
    keywords: 'Shared Astrology Response, AI Insight Share',
  },
  sharedPalmReading: {
    title: 'Shared Palm Reading | AstroAi4u - Hand Analysis',
    description: 'View a shared palm reading from AstroAi4u.',
    keywords: 'Shared Palm Reading, Hand Line Analysis',
  },
  sharedCoffeeReading: {
    title: 'Shared Coffee Reading | AstroAi4u - Tasseography',
    description: 'View a shared coffee cup reading from AstroAi4u.',
    keywords: 'Shared Coffee Reading, Tasseography Share',
  },
  sharedFaceReading: {
    title: 'Shared Face Reading | AstroAi4u - Facial Analysis',
    description: 'View a shared face reading from AstroAi4u.',
    keywords: 'Shared Face Reading, Facial Astrology Share',
  },
  sharedStyle: {
    title: 'Shared Style | AstroAi4u - Fashion Astrology',
    description: 'View a shared style reading from AstroAi4u.',
    keywords: 'Shared Style, Fashion Astrology Share',
  },
  publicHoroscope: {
    title: 'Free Daily Horoscope | AI-Powered Zodiac Readings | AstroAi4u',
    description: 'Get your free daily horoscope powered by AI. Accurate zodiac readings for all 12 signs with personalized astrological insights.',
    keywords: 'Daily Horoscope, Free Horoscope, Zodiac Signs, AI Horoscope, Astrology Today',
  },
  publicBirthChart: {
    title: 'Free Birth Chart | AI-Powered Natal Chart | AstroAi4u',
    description: 'Generate your free birth chart with AI. Discover your cosmic blueprint with personalized natal chart analysis.',
    keywords: 'Free Birth Chart, Natal Chart, AI Birth Chart, Vedic Astrology, Kundli Online',
  },
  publicNumerology: {
    title: 'Free Numerology Calculator | AI-Powered | AstroAi4u',
    description: 'Calculate your life path number and numerology with AI. Get free personalized numerology readings and insights.',
    keywords: 'Free Numerology, Numerology Calculator, Life Path Number, AI Numerology',
  },
  publicAIChat: {
    title: 'Free AI Astrologer | Chat with AI Astrology | AstroAi4u',
    description: 'Chat with our free AI astrologer. Get instant astrological guidance, horoscope readings, and cosmic insights powered by AI.',
    keywords: 'Free AI Astrologer, AI Chat Astrology, Chat with Astrologer AI, Free Astrology Chat',
  },
  publicReports: {
    title: 'Free Kundli Online | Compatibility & Forecasts | AstroAi4u',
    description: 'Get free online Kundli reports including compatibility matching, yearly forecasts, and personalized AI recommendations.',
    keywords: 'Free Kundli Online, Kundli Matching, Compatibility Report, Birth Chart Report, Yearly Forecast, AI Kundli',
  },
  notFound: {
    title: 'Page Not Found | AstroAi4u',
    description: 'The page you are looking for could not be found. Explore AstroAi4u for AI astrology readings and cosmic insights.',
    keywords: '404, Page Not Found, AstroAi4u',
    noIndex: true,
  },
};

export default SEO;
