import { AuthUser } from '../auth/AuthContext';

export const getBaseUrl = () => {
  // Check if we're in production (on astroai4u.com)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domain - API is on the same domain or use relative paths
    if (hostname === 'astroai4u.com' || hostname === 'www.astroai4u.com') {
      // If API is on the same domain, use relative path
      // If API is on different subdomain/port, set REACT_APP_API_BASE_URL
      return process.env.REACT_APP_API_BASE_URL || '';
    }
    
    // Local development
    if (process.env.NODE_ENV === 'development' || hostname === 'localhost') {
      return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
    }
  }
  
  // Default fallback
  return process.env.REACT_APP_API_BASE_URL || '';
};

const TOKEN_KEY = 'astroai_token';

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const apiFetch = async (path: string, init?: RequestInit, retries = 2): Promise<any> => {
  const url = `${getBaseUrl()}${path}`;
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers ? (init.headers as Record<string, string>) : {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  // Timeout controller — 20s for mobile networks
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let message = 'Request failed';
      try {
        const body = await res.json();
        message = body?.message || message;
      } catch { /* ignore */ }
      throw new Error(message);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;

  } catch (err: any) {
    clearTimeout(timeoutId);

    // Retry on network errors (not on abort/timeout, not on 4xx/5xx)
    if (retries > 0 && err.name !== 'AbortError' && err.message === 'Failed to fetch') {
      console.warn(`[apiFetch] Retrying ${path}... (${retries} left)`);
      await new Promise(r => setTimeout(r, 1500));
      return apiFetch(path, init, retries - 1);
    }

    // Re-throw with user-friendly message
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    if (err.message === 'Failed to fetch') {
      throw new Error('Could not reach the server. Please check your connection.');
    }
    throw err;
  }
};

export const login = (email: string, password: string) => {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }) as Promise<LoginResponse>;
};

export const register = (email: string, password: string, is_believer?: boolean) => {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, is_believer })
  }) as Promise<LoginResponse>;
};

export const getMe = () => {
  return apiFetch('/api/auth/me', { method: 'GET' });
};

export const forgotPassword = (email: string) => {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }) as Promise<{ ok: boolean; resetUrl?: string }>;
};

export const requestOtp = (email: string) => {
  return apiFetch('/api/auth/forgot-password/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  }) as Promise<{ ok: boolean; otp?: string }>;
};

export const verifyOtp = (email: string, otp: string) => {
  return apiFetch('/api/auth/forgot-password/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  }) as Promise<{ ok: boolean; resetSessionToken?: string }>;
};

export const resetPasswordWithOtp = (password: string, resetSessionToken: string) => {
  return apiFetch('/api/auth/reset-password-with-otp', {
    method: 'POST',
    body: JSON.stringify({ password, resetSessionToken })
  }) as Promise<{ ok: boolean }>;
};

export const resetPassword = (token: string, password: string) => {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  }) as Promise<{ ok: boolean }>;
};

export const getUsers = () => {
  return apiFetch('/api/users', { method: 'GET' });
};

export const updateUser = (id: string, data: any) => {
  return apiFetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deleteUser = (id: string) => {
  return apiFetch(`/api/users/${id}`, { method: 'DELETE' });
};
