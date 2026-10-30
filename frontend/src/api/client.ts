const envUrl = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.trim();
const API_BASE = envUrl ? `${envUrl.replace(/\/$/, '')}/api` : '/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gc_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred during API request');
  }

  return data as T;
}
