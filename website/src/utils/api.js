// Production-ready API configuration
// Supports both local development and production deployment

// Base API URL - Uses relative paths for production with Nginx reverse proxy
// Set REACT_APP_API_URL=/api in production for Nginx compatibility
// Leave unset for local development (will use relative paths)
export const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  GET_ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  REQUEST_OTP: '/auth/forgot-password/request-otp',
  VERIFY_OTP: '/auth/forgot-password/verify-otp',
  RESET_PASSWORD_WITH_OTP: '/auth/reset-password-with-otp',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Profile & Insights
  BASIC_PROFILE: '/profile/basic',
  GENERATE_INSIGHTS: '/profile/generate-insights',
  
  // Astrology Services
  HOROSCOPE: '/horoscope',
  BIRTH_CHART: '/birth-chart',
  NUMEROLOGY: '/numerology',
  
  // AI Chat
  AI_CHAT: '/ai-chat',
  
  // Reports
  KUNDLI: '/reports/kundli',
  BIRTH_CHART_REPORT: '/reports/birth-chart'
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
