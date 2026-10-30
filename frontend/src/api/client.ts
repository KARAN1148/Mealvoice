const envUrl = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.trim();

const getApiBase = () => {
  // 1. Explicit environment variable takes highest precedence
  if (envUrl) {
    return `${envUrl.replace(/\/$/, '')}/api`;
  }

  // 2. Local development on localhost or 127.0.0.1
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/api';
    }
  }

  // 3. In production on Vercel or live mobile web, point directly to live Render backend
  // Note: Vercel also has rewrites configured, so /api would work, but direct Render URL
  // avoids any single-point-of-failure rewrite edge cases.
  return 'https://mealvoice-backend.onrender.com/api';
};

const API_BASE = getApiBase();

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gc_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (netErr: any) {
    // If direct connection fails and we were using a full Render URL, try relative /api proxy as fallback
    if (API_BASE.startsWith('http') && typeof window !== 'undefined') {
      try {
        response = await fetch(`/api${endpoint}`, {
          ...options,
          headers
        });
      } catch (fallbackErr) {
        throw new Error('Network connection error: Unable to reach MealVoice server. Please check your internet connection.');
      }
    } else {
      throw new Error(netErr.message || 'Network connection error: Unable to reach MealVoice server.');
    }
  }

  // Safely parse JSON or handle server error responses gracefully
  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    // In case server returned HTML (e.g. Render waking up or 502/503), provide clean error message
    if (!response.ok) {
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error('MealVoice server is currently waking up from sleep. Please wait 10 seconds and try again.');
      }
      throw new Error(`Server returned status ${response.status}: Please try again.`);
    }
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'An error occurred during API request');
  }

  return data as T;
}
