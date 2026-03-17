import { apiFetch } from '@/api/client';
import type { Schedule } from '@/types';

export async function getUpcomingSchedules(termId: number): Promise<Schedule[]> {
  return apiFetch(`/api/schedules/upcoming?termId=${termId}`);
}
Object.defineProperty(getUpcomingSchedules, 'queryKey', { value: 'upcomingSchedules' });

export async function getSchedules(params: {
  termId: number;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ schedules: Schedule[]; total: number }> {
  const searchParams = new URLSearchParams();
  searchParams.set('termId', String(params.termId));
  if (params.type) searchParams.set('type', params.type);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  return apiFetch(`/api/schedules?${searchParams.toString()}`);
}
Object.defineProperty(getSchedules, 'queryKey', { value: 'schedules' });
