import { AuthUser } from '../auth/AuthContext';

export const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_BASE_URL || '';
  }
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
};

const TOKEN_KEY = 'astroai_token';

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const apiFetch = async (path: string, init?: RequestInit) => {
  const url = `${getBaseUrl()}${path}`;
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers ? (init.headers as Record<string, string>) : {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    let message = 'Request failed';
    try {
      const body = await res.json();
      message = body?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
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
