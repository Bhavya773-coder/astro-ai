import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'astroai_auth_token';

export const saveAuthToken = async (token: string | null) => {
  if (token === null) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

export const loadAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

// Base URL resolution: can be configured or fallback to local LAN / dev / production URL
let customApiBaseUrl: string | null = null;

export const setCustomApiBaseUrl = (url: string | null) => {
  customApiBaseUrl = url;
};

let resolvedBaseUrl: string | null = null;

export const detectApiVersion = async () => {
  if (customApiBaseUrl) return;

  const baseOptions = (process.env.EXPO_PUBLIC_API_URL || 'https://astroai4u.com/api').replace(/\/+$/, '');
  const candidates = [baseOptions, `${baseOptions}/api`].map(url => url.replace(/\/+$/, ''));

  for (const url of candidates) {
    try {
      const res = await fetch(`${url}/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.status === 401 && contentType.includes('application/json')) {
        resolvedBaseUrl = url;
        return;
      }
    } catch (e) {
      // ignore and try next
    }
  }
};

// Start discovery immediately
detectApiVersion();

export const getBaseUrl = () => {
  if (customApiBaseUrl) return customApiBaseUrl;
  if (resolvedBaseUrl) return resolvedBaseUrl;
  const envUrl = process.env.EXPO_PUBLIC_API_URL || 'https://astroai4u.com/api';
  return envUrl.replace(/\/+$/, '');
};

export const API_BASE_URL = getBaseUrl();

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  if (!authToken) {
    authToken = await loadAuthToken();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
  } as any;

  let baseUrl = getBaseUrl();
  let cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Ensure exact /api prefix matching
  if (baseUrl.endsWith('/api') && cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4);
  } else if (!baseUrl.endsWith('/api') && !cleanPath.startsWith('/api/')) {
    cleanPath = `/api${cleanPath}`;
  }

  const primaryUrl = `${baseUrl}${cleanPath}`;

  // Build candidate URLs (primary -> live double-api fix)
  const candidateUrls: string[] = [primaryUrl];
  if (primaryUrl.includes('astroai4u.com/api/') && !primaryUrl.includes('astroai4u.com/api/api/')) {
    candidateUrls.push(primaryUrl.replace('astroai4u.com/api/', 'astroai4u.com/api/api/'));
  }

  let lastError: any = null;
  let response: Response | null = null;
  let responseBodyText = '';
  let responseIsJson = false;

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { ...options, headers });
      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (res.ok && isJson) {
        response = res;
        responseBodyText = await res.text();
        responseIsJson = true;
        break;
      }

      lastError = new Error(`Server returned status ${res.status}`);

      // Save details from the last attempt as backup
      response = res;
      responseIsJson = isJson;
      if (candidateUrls.indexOf(url) < candidateUrls.length - 1) {
        continue;
      }
      responseBodyText = await res.text();
    } catch (err: any) {
      lastError = err;
      if (candidateUrls.indexOf(url) < candidateUrls.length - 1) {
        continue;
      }
    }
  }

  if (!response) {
    throw lastError || new Error('Network request failed. Please check your connection.');
  }

  if (!responseIsJson) {
    throw new Error(`Server returned non-JSON response (${response.status}). Ensure backend server is running.`);
  }

  const data = JSON.parse(responseBodyText || '{}');

  if (!response.ok) {
    const error: any = new Error(data.message || 'API Request failed');
    error.status = response.status;
    error.code = data.code;
    error.data = data;
    throw error;
  }

  return data;
};

// ==================== AUTH API ====================
export const loginUser = (email: string, password: string) => {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const googleAuthUser = (code: string, redirectUri?: string) => {
  return apiFetch('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ code, redirectUri }),
  });
};

export const registerUser = (email: string, password: string, is_believer = true) => {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, is_believer }),
  });
};

export const verifyOtp = (email: string, otp: string) => {
  return apiFetch('/api/auth/verify-signup-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
};

export const resendOtp = (email: string) => {
  return apiFetch('/api/auth/resend-signup-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const fetchMe = () => {
  return apiFetch('/api/auth/me', { method: 'GET' });
};

export const requestPasswordResetOtp = (email: string) => {
  return apiFetch('/api/auth/forgot-password/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const verifyPasswordResetOtp = (email: string, otp: string) => {
  return apiFetch('/api/auth/forgot-password/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
};

export const resetPasswordWithOtp = (password: string, resetSessionToken: string) => {
  return apiFetch('/api/auth/reset-password-with-otp', {
    method: 'POST',
    body: JSON.stringify({ password, resetSessionToken }),
  });
};

// ==================== PROFILE & INSIGHTS API ====================
export const fetchProfile = () => {
  return apiFetch('/api/profile', { method: 'GET' });
};

export const saveBasicProfile = (data: {
  full_name: string;
  date_of_birth: string;
  time_of_birth?: string;
  place_of_birth: string;
  gender?: string;
  current_location?: string;
}) => {
  return apiFetch('/api/profile/basic', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const saveLifeContext = (data: {
  career_stage?: string;
  relationship_status?: string;
  main_life_focus?: string;
  personality_style?: string;
  primary_life_problem?: string;
}) => {
  return apiFetch('/api/profile/context', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const generateInsights = (forceRegenerate = false) => {
  return apiFetch('/api/profile/generate-insights', {
    method: 'POST',
    body: JSON.stringify({ forceRegenerate }),
  });
};

export const getInsightStatus = () => {
  return apiFetch('/api/profile/insight-status', { method: 'GET' });
};

// ==================== BIRTH CHART ====================
export const fetchBirthChart = () => {
  return apiFetch('/api/reports/birth-chart', { method: 'GET' });
};

// ==================== VISION AI READINGS ====================
export const getPalmReading = (imageBase64: string, mimeType: string, forceRegenerate = false) => {
  return apiFetch('/api/palm-reading', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, mimeType, forceRegenerate }),
  });
};

export const getCoffeeReading = (imageBase64: string, mimeType: string, forceRegenerate = false) => {
  return apiFetch('/api/coffee-reading', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, mimeType, forceRegenerate }),
  });
};

export const getFaceReading = (imageBase64: string, mimeType: string, forceRegenerate = false) => {
  return apiFetch('/api/face-reading', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, mimeType, forceRegenerate }),
  });
};

export const getReadingHistory = (type: 'palm' | 'coffee' | 'face') => {
  return apiFetch(`/api/reading-history/${type}`, { method: 'GET' });
};

// ==================== DRESSING STYLER / STYLE FORECASTER ====================
export const generateStyleLook = (
  force = false,
  modifier?: string,
  context?: string,
  vibe?: string,
  imageBase64?: string,
  occasion?: string,
  mimeType?: string
) => {
  return apiFetch('/api/dressing-styler/generate', {
    method: 'POST',
    body: JSON.stringify({
      force,
      modifier,
      context,
      vibe,
      image_base64: imageBase64,
      occasion,
      mime_type: mimeType,
    }),
  });
};

export const getTodayStyleLook = () => {
  return apiFetch('/api/dressing-styler/today', { method: 'GET' });
};

export const updateStyleInteraction = (data: {
  selected_context?: string;
  selected_modifier?: string;
  vibe_selection?: string;
  outfit_score?: any;
}) => {
  return apiFetch('/api/dressing-styler/interact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ==================== HOROSCOPE & DAILY DECISION ====================
export const getHoroscope = (zodiac: string) => {
  return apiFetch('/api/horoscope', {
    method: 'POST',
    body: JSON.stringify({ zodiac }),
  });
};

export const getDailyDecisionData = (zodiac: string) => {
  return apiFetch('/api/horoscope/daily-decision-engine', {
    method: 'POST',
    body: JSON.stringify({ zodiac }),
  });
};

// ==================== NUMEROLOGY ====================
export const getNumerologyData = () => {
  return apiFetch('/api/numerology', { method: 'GET' });
};

// ==================== REPORTS ====================
export const fetchReportList = () => {
  return apiFetch('/api/reports/list', { method: 'GET' });
};

export const generateReport = (type: string, inputData: any) => {
  return apiFetch('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ type, inputData }),
  });
};

export const fetchReportDetails = (id: string) => {
  return apiFetch(`/api/reports/${id}`, { method: 'GET' });
};

// ==================== CREDITS & PAYMENT ====================
export const fetchCredits = () => {
  return apiFetch('/api/credits', { method: 'GET' });
};

export const ensureAuthenticatedSession = async () => {
  if (authToken) return authToken;
  try {
    const guestEmail = `user_${Date.now()}_${Math.floor(Math.random()*1000)}@astroai4u.com`;
    const guestPass = `Astro@${Date.now()}`;
    const regRes = await registerUser(guestEmail, guestPass);
    if (regRes && regRes.token) {
      setAuthToken(regRes.token);
      return regRes.token;
    }
  } catch (e) {
    // Ignore auto guest registration notice
  }
  return authToken;
};

export const fetchPaymentStatus = () => {
  return apiFetch('/api/payment/status', { method: 'GET' });
};

export const verifyIAPPayment = async (data: {
  platform: string;
  productId: string;
  transactionId?: string;
  receipt: string;
  purchaseToken?: string;
}) => {
  await ensureAuthenticatedSession();
  return apiFetch('/api/payment/verify-iap', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ==================== AI CHAT & HISTORY ====================
export const fetchChatList = () => {
  return apiFetch('/api/ai-chat/list', { method: 'GET' });
};

export const createChat = (category: string, title?: string, prompt?: string) => {
  return apiFetch('/api/ai-chat/create', {
    method: 'POST',
    body: JSON.stringify({ category, title, prompt }),
  });
};

export const fetchChatMessages = (chatId: string) => {
  return apiFetch(`/api/ai-chat/${chatId}/messages`, { method: 'GET' });
};

export const sendChatMessage = (chatId: string, message: string, method = 'astrology') => {
  return apiFetch('/api/ai-chat/send', {
    method: 'POST',
    body: JSON.stringify({ chatId, message, method }),
  });
};

export const getOracleDisclosure = () => apiFetch('/api/oracle/disclosure');
export const acceptOracleDisclosure = () => apiFetch('/api/oracle/disclosure/accept', { method: 'POST', body: '{}' });
export const getOraclePredictions = (page = 1) => apiFetch(`/api/oracle/predictions?page=${page}&limit=20`);
export const deleteOraclePrediction = (id: string) => apiFetch(`/api/oracle/predictions/${id}`, { method: 'DELETE' });
export const submitOracleOutcome = (id: string, choice: string) => apiFetch(`/api/oracle/predictions/${id}/outcome`, { method: 'POST', body: JSON.stringify({ choice }) });
export const explainOraclePrediction = (id: string) => apiFetch(`/api/oracle/predictions/${id}/explain`, { method: 'POST', body: '{}' });
export const saveOracleSynchronicity = (id: string, text: string) => apiFetch(`/api/oracle/predictions/${id}/synchronicity`, { method: 'POST', body: JSON.stringify({ save: true, text }) });
export const getOracleSettings = () => apiFetch('/api/oracle/settings');
export const getOracleCalibration = () => apiFetch('/api/oracle/calibration');
export const updateOracleSettings = (settings: { personalized_learning?: boolean; contextual_signals?: boolean }) => apiFetch('/api/oracle/settings', { method: 'PATCH', body: JSON.stringify(settings) });
export const getOracleMemories = () => apiFetch('/api/oracle/memories');
export const deleteOracleMemory = (id: string) => apiFetch(`/api/oracle/memories/${id}`, { method: 'DELETE' });

// ==================== TAROT AI INTERPRETATION ====================
export const interpretTarotCard = (cardData: {
  card_name: string;
  is_reversed: boolean;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
  position?: string;
  all_cards?: { name: string; is_reversed: boolean }[];
}) => {
  return apiFetch('/api/tarot-reading/interpret', {
    method: 'POST',
    body: JSON.stringify(cardData),
  });
};

// ==================== ASTRO CALENDAR ====================
export const fetchCalendarEvents = (year: number, month: number) => {
  return apiFetch(`/api/calendar/events?year=${year}&month=${month}`, { method: 'GET' });
};

export const createCustomCalendarEvent = (data: {
  title: string;
  date: string;
  description?: string;
  category?: string;
  isRecurring?: boolean;
}) => {
  return apiFetch('/api/calendar/custom-events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteCustomCalendarEvent = (id: string) => {
  return apiFetch(`/api/calendar/custom-events/${id}`, { method: 'DELETE' });
};

export const getExportIcsUrl = () => {
  return `${API_BASE_URL}/api/calendar/export-ics`;
};

export const fetchDailyInsight = (date: string) => {
  return apiFetch('/api/calendar/daily-insight', {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
};

export const deleteAccount = () => {
  return apiFetch('/api/profile/delete-account', {
    method: 'DELETE',
  });
};

export const deductTarotCredit = () => {
  return apiFetch('/api/tarot-reading/deduct-credit', {
    method: 'POST',
  });
};
