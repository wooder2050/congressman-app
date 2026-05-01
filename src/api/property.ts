import { apiFetch } from '@/api/client';
import type { PropertyStatsResponse } from '@/types';

export async function getPropertyStats(): Promise<PropertyStatsResponse> {
  return apiFetch('/api/stats/property');
}
Object.defineProperty(getPropertyStats, 'queryKey', { value: 'propertyStats' });
