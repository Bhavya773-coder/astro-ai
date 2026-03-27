import { AuthUser } from '../auth/AuthContext';

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "/api";

const TOKEN_KEY = 'astroai_token';

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const apiFetch = async (path: string, init?: RequestInit) => {
  const url = `${API_BASE_URL}${path}`;
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
    } catch {}
    throw new Error(message);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// ✅ NO /api here
export const login = (email: string, password: string) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }) as Promise<LoginResponse>;

export const register = (email: string, password: string, additionalData?: Record<string, any>) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, ...additionalData })
  }) as Promise<LoginResponse>;

export const getMe = () =>
  apiFetch('/auth/me', { method: 'GET' });