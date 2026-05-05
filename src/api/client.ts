import { ENV } from '@/config/env';
import { getSupabase } from '@/lib/supabase/client';

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** 인증 헤더 강제 요구 — 토큰 없으면 throw */
  requireAuth?: boolean;
}

async function getAuthToken(): Promise<string | null> {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) return null;
  try {
    const {
      data: { session },
    } = await getSupabase().auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const url = `${ENV.API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = await getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (options.requireAuth) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 404) return null as T;
  if (response.status === 401) throw new Error('인증이 만료되었습니다.');
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
