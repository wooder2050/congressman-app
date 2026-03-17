import { apiFetch } from '@/api/client';
import type { HomeStats } from '@/types';

export async function getHomeStats(termId: number): Promise<HomeStats> {
  return apiFetch(`/api/stats/home?termId=${termId}`);
}
Object.defineProperty(getHomeStats, 'queryKey', { value: 'homeStats' });
