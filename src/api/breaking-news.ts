import { apiFetch } from '@/api/client';

export interface BreakingNewsDetail {
  label: string;
  value: string;
  memberId?: string;
}

export interface BreakingNewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'committee' | 'election' | 'legislation' | 'politics';
  items?: BreakingNewsDetail[];
  sources?: { title: string; url: string }[];
  linkUrl?: string;
  active: boolean;
}

export async function getBreakingNews(): Promise<BreakingNewsItem[]> {
  const data = await apiFetch<BreakingNewsItem[] | null>('/api/breaking-news');
  return data ?? [];
}
Object.defineProperty(getBreakingNews, 'queryKey', { value: 'breakingNews' });
