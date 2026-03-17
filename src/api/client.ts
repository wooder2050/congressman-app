import { ENV } from '@/config/env';

export async function apiFetch<T = unknown>(path: string): Promise<T> {
  const url = `${ENV.API_BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) return null as T;
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return null as T;
  return JSON.parse(text) as T;
}
