// src/lib/api-client.ts
// -----------------------------------------------------------------------
// Minimal typed HTTP client.
// In local dev, Vite proxies /api → http://localhost:8000  (see vite.config.ts).
// In production / Databricks the same origin serves /api directly.
// -----------------------------------------------------------------------

const API_BASE = '/api/v1';

// Low-level generic fetch wrapper
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url  = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text} — ${endpoint}`);
  }

  return res.json() as Promise<T>;
}

// Convenience object with URL + query-param helpers
export const apiClient = {
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${window.location.origin}${API_BASE}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          url.searchParams.append(k, String(v));
        }
      });
    }
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return res.json();
  },
};
