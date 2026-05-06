import { apiFetch } from '@/api/client';
import type { WeeklyArticle } from '@/types';

/** 목록 응답: highlights와 analysis는 빠짐 (상세에서만 제공) */
export type WeeklyArticleSummary = Omit<WeeklyArticle, 'highlights' | 'analysis'>;

export async function getWeeklyList(): Promise<WeeklyArticleSummary[]> {
  const data = await apiFetch<WeeklyArticleSummary[] | null>('/api/weekly');
  return data ?? [];
}
Object.defineProperty(getWeeklyList, 'queryKey', { value: 'weeklyList' });

export async function getWeeklyArticle(id: string): Promise<WeeklyArticle> {
  return apiFetch<WeeklyArticle>(`/api/weekly/${encodeURIComponent(id)}`);
}
Object.defineProperty(getWeeklyArticle, 'queryKey', { value: 'weeklyArticle' });
